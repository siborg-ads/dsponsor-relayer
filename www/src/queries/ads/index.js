import config from "@/config";
import { executeQuery } from "@/queries/subgraph";

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

export async function getValidatedAds(chainId, adOfferId, tokenIds) {
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
  const { adParameters, nftContract } = graphResult.data.adOffers[0];
  const { allowList, prices: defaultPrices } = nftContract;

  const getTokenMintValue = (token) => {
    const isMinted = token?.mint?.blockTimestamp && token?.mint?.blockTimestamp > 0;
    const isInAllowlist = allowList ? token?.setInAllowList : true;
    const tokenCanBeMinted = !isMinted && isInAllowlist;

    return tokenCanBeMinted
      ? token?.tokenPrices?.length
        ? token.tokenPrices
        : defaultPrices?.length
          ? defaultPrices
          : null
      : null;
  };

  /**
   * Provide validated ads data
   */

  graphResult.data.adProposals.forEach((ad) => {
    const { token } = ad;
    const { tokenId } = token;
    if (!result[tokenId]) {
      result[tokenId] = {};
    }
    result[tokenId][ad.adParameter.id] = { state: "CURRENT_ACCEPTED", data: ad.data };
  });

  /**
   * Fulfill data for each token id
   */

  if (!tokenIds) {
    tokenIds = graphResult.data.adOffers[0].nftContract.tokens.map((t) => t.tokenId);
  }

  if (tokenIds && tokenIds.length > 0) {
    for (const _tokenId of tokenIds) {
      if (!result[_tokenId]) {
        result[_tokenId] = {};
      }

      const token = graphResult.data.adOffers[0].nftContract.tokens.find(
        (t) => t.tokenId === _tokenId
      );

      const tokenData = token?.mint?.tokenData;
      if (tokenData) {
        result[_tokenId].tokenData = token.mint.tokenData;
      }

      result[_tokenId]._buy = {
        mint: getTokenMintValue(token),
        secondary:
          token?.marketplaceListings.find(
            (l) =>
              l.startTime < Date.now() / 1000 &&
              l.endTime > Date.now() / 1000 &&
              l.status === "CREATED"
          ) || null
      };

      for (const { adParameter } of adParameters) {
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

  return result;
}

export async function getDefaultAdData(
  state,
  chainId,
  adOfferId,
  tokenId,
  tokenData,
  adParameter,
  // eslint-disable-next-line no-unused-vars
  buyInfos
) {
  const chainName = config[chainId]?.chainName;
  const appURL = config[chainId]?.appURL;

  const {
    base
    // variants
  } = adParameter;

  let data = null;

  if (base === "imageURL") {
    if (state === "BUY_MINT" || state === "BUY_MARKET") {
      data = "https://relayer.dsponsor.com/available.webp";
    } else if (state === "UNAVAILABLE") {
      data = data = "https://relayer.dsponsor.com/reserved.webp";
    }
  } else if (base === "linkURL") {
    return `${appURL}/offer/${chainName}/${adOfferId}/${tokenId}`;
  }

  return data;
}
