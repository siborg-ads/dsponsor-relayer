import config from "@/config";
import { executeQuery } from "@/queries/subgraph";
import { normalizeString, stringToUint256 } from "@/utils";

export const getValidatedAdsForTokensQuery = /* GraphQL */ `
  query getValidatedAds($adOfferId: String, $tokenIds: [BigInt!]) {
    adOffers(where: { id: $adOfferId }) {
      ...AdOfferSelectedTokensFragment
    }
    adProposals(
      first: 1000
      where: {
        adOffer_: { id: $adOfferId }
        token_: { tokenId_in: $tokenIds }
        status: CURRENT_ACCEPTED
      }
    ) {
      ...AdProposalFragment
    }
  }
`;

const getValidatedAdsForOfferQuery = /* GraphQL */ `
  query getValidatedAds($adOfferId: String) {
    adOffers(where: { id: $adOfferId }) {
      ...AdOfferFragment
    }
    adProposals(first: 1000, where: { adOffer_: { id: $adOfferId }, status: CURRENT_ACCEPTED }) {
      ...AdProposalFragment
    }
  }
`;

export async function getValidatedAds({
  chainId,
  adOfferId,
  tokenIds,
  tokenDatas,
  adParameterIds
}) {
  const chainName = config[chainId]?.chainName;
  const appURL = config[chainId]?.appURL;

  /**
   * Handle input token data
   */
  if (tokenDatas && tokenDatas.length) {
    tokenDatas = tokenDatas.map((t) => normalizeString(t));
    tokenIds = tokenIds && tokenIds.length ? tokenIds : tokenDatas.map((t) => stringToUint256(t));
  }

  /**
   * Execute the GraphQL query
   */
  const variables = {
    adOfferId
  };
  const query =
    tokenIds && tokenIds.length ? getValidatedAdsForTokensQuery : getValidatedAdsForOfferQuery;

  if (tokenIds && tokenIds.length) {
    variables.tokenIds = tokenIds;
  }

  const graphResult = await executeQuery(chainId, query, variables);

  if (
    !graphResult ||
    !graphResult.data ||
    !graphResult.data.adProposals ||
    !graphResult.data.adOffers[0]
  ) {
    return null;
  }

  const result = {};
  const { nftContract, adParameters: offerAdParameters } = graphResult.data.adOffers[0];
  const { allowList, prices: defaultPrices } = nftContract;

  /**
   * Handle ad parameters
   */

  const adParameters = adParameterIds?.length
    ? adParameterIds

        .map((adParameterId) => {
          const base = adParameterId.split("-")[0];

          let adParameter = offerAdParameters.find(
            (a) => a?.adParameter?.id === adParameterId
          )?.adParameter;

          if (!adParameter) {
            adParameter = offerAdParameters.find((a) => a?.adParameter?.base === base)?.adParameter;
          }

          return adParameter;
        })
        .filter((a) => !!a)
    : graphResult.data.adOffers[0].adParameters.map((a) => a.adParameter);
  adParameterIds = adParameters.map((a) => a.id);

  /**
   * POPULATE: Provide validated ads data
   */

  graphResult.data.adProposals.forEach((ad) => {
    const { token } = ad;
    const { tokenId } = token;
    if (!result[tokenId]) {
      result[tokenId] = {};
    }
    if (adParameterIds.includes(ad.adParameter.id)) {
      result[tokenId][ad.adParameter.id] = { state: "CURRENT_ACCEPTED", data: ad.data };
    }
  });

  /**
   * POPULATE: Fulfill data for each token id
   */

  if (!tokenIds) {
    tokenIds = graphResult.data.adOffers[0].nftContract.tokens.map((t) => t.tokenId);
  }

  if (tokenIds && tokenIds.length > 0) {
    for (let i = 0; i < tokenIds.length; i++) {
      const _tokenId = tokenIds[i];
      if (!result[_tokenId]) {
        result[_tokenId] = {};
      }

      const token = graphResult.data.adOffers[0].nftContract.tokens.find(
        (t) => t.tokenId === _tokenId
      );

      const tokenData = token?.mint?.tokenData
        ? token.mint.tokenData
        : tokenDatas && tokenDatas.length && tokenDatas[i]
          ? tokenDatas[i]
          : undefined;
      if (tokenData) {
        result[_tokenId]._tokenData = tokenData;
      }

      // Provide buy infos for each token /////////////////////////////////

      let link = `${appURL}/${chainName}/offer/${adOfferId}/${_tokenId}`;
      if (tokenData) {
        link += `?tokenData=${tokenData}`;
      }

      const isMinted = token?.mint?.blockTimestamp && token?.mint?.blockTimestamp > 0;
      const isInAllowlist = allowList ? token?.setInAllowList : true;
      const tokenCanBeMinted = !isMinted && isInAllowlist;

      const mint = tokenCanBeMinted
        ? token?.tokenPrices?.length
          ? token.tokenPrices
          : defaultPrices?.length
            ? defaultPrices
            : null
        : null;

      result[_tokenId]._buy = {
        link,
        mint,
        secondary:
          token?.marketplaceListings.find(
            (l) =>
              l.startTime < Date.now() / 1000 &&
              l.endTime > Date.now() / 1000 &&
              l.status === "CREATED"
          ) || null
      };

      // Provide default data for each ad parameter, for each token /////////////////////////////////

      for (const adParameter of adParameters) {
        if (!result[_tokenId][adParameter.id]) {
          const state = result[_tokenId]._buy.mint?.length
            ? "BUY_MINT"
            : result[_tokenId]._buy.secondary
              ? "BUY_MARKET"
              : "UNAVAILABLE";
          result[_tokenId][adParameter.id] = {
            state,
            data: await getDefaultAdData(
              state,
              chainId,
              adOfferId,
              _tokenId,
              tokenData,
              adParameter,
              result[_tokenId]._buy
            )
          };
        }
      }
    }
  }

  return Object.assign(
    { _tokenIds: tokenIds, _tokenData: tokenDatas, _adParameterIds: adParameterIds },
    result
  );
}

export async function getDefaultAdData(
  state,
  chainId,
  adOfferId,
  tokenId,
  tokenData,
  adParameter,
  buyInfos
) {
  const { base } = adParameter;

  let data = null;

  if (base === "imageURL") {
    if (state === "BUY_MINT" || state === "BUY_MARKET") {
      data = `${config[chainId].assetsURL}/available.webp`;
    } else if (state === "UNAVAILABLE") {
      data = `${config[chainId].assetsURL}/reserved.webp`;
    }
    // test
    // const random = Math.floor(Math.random() * 1000);
    // data = `https://www.placehold.it/500x${random}`;
  } else if (base === "linkURL") {
    data = buyInfos.link;
  }

  return data;
}

export async function getAdDataForToken(
  chainId,
  adOfferId,
  tokenId,
  adParameterId,
  defaultAdParameterKey
) {
  const adParameterKey = adParameterId ? adParameterId : defaultAdParameterKey;

  const result = await getValidatedAds({
    chainId,
    adOfferId,
    tokenIds: [tokenId],
    adParameterIds: [adParameterKey]
  });

  return result[tokenId][adParameterKey].data || null;
}

export const getRandomAdData = async ({ chainId, adOfferId, tokenIds, adParameterIds }) => {
  const response = await getValidatedAds({
    chainId,
    adOfferId,
    tokenIds,
    adParameterIds
  });
  if (
    !response ||
    !response._tokenIds?.length ||
    !response._adParameterIds?.length ||
    (adParameterIds?.length > 0 && response._adParameterIds.length !== adParameterIds.length)
  ) {
    return null;
  }

  let eligibibleTokenIds = [];
  let eligibleAds = {};

  for (const tokenId of response._tokenIds) {
    let allAccepted = true;

    for (const adParameterId of response._adParameterIds) {
      if (
        !response[tokenId][adParameterId] ||
        response[tokenId][adParameterId].state !== "CURRENT_ACCEPTED"
      ) {
        allAccepted = false;
        break;
      }
    }

    if (allAccepted) {
      eligibibleTokenIds.push(tokenId);
      eligibleAds[tokenId] = response[tokenId];
    }
  }

  if (!Object.keys(eligibleAds).length) {
    for (const tokenId of response._tokenIds) {
      let allAccepted = true;

      for (const adParameterId of response._adParameterIds) {
        if (
          !response[tokenId][adParameterId] ||
          response[tokenId][adParameterId].state.includes("BUY")
        ) {
          allAccepted = false;
          break;
        }
      }

      if (allAccepted) {
        eligibibleTokenIds.push(tokenId);
        eligibleAds[tokenId] = response[tokenId];
      }
    }
  }

  if (!Object.keys(eligibleAds).length) {
    return null;
  }

  const randomTokenId = eligibibleTokenIds[Math.floor(Math.random() * eligibibleTokenIds.length)];

  return {
    randomAd: eligibleAds[randomTokenId],
    _adParameterIds: response._adParameterIds,
    _tokenIds: response._tokenIds
  };
};
