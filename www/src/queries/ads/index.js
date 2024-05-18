import { executeQuery } from "@/queries/subgraph";

export const getValidatedAdsForTokensQuery = /* GraphQL */ `
  query getValidatedAds($adOfferId: String, $tokenIds: [BigInt!]) {
    adOffers(where: { id: $adOfferId }) {
      ...AdOfferFragment
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

export async function getValidatedAds(chainId, offerId, tokenIds) {
  const variables = {
    adOfferId: offerId
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

  /**
   * NFT Contract, Mint data
   */

  const {
    allowList,
    //  maxSupply,
    prices: defaultPrices
    // tokens
  } = graphResult.data.adOffers[0].nftContract;

  /*
  const availableAllowlistedTokens = tokens
    .filter((t) => {
      const isMinted = t.mint && t.mint.blockTimestamp && t.mint.blockTimestamp > 0;

      return t.setInAllowList && !isMinted;
    })
    .map(({ tokenId, prices: tokenPrices }) => {
      return {
        tokenId,
        prices: tokenPrices && tokenPrices.length > 0 ? tokenPrices : defaultPrices
      };
    });
*/

  const getTokenMintValue = (token) => {
    const { mint, prices: tokenPrices, setInAllowList } = token;

    const isInAllowlist = allowList ? setInAllowList : true;

    return mint?.blockTimestamp || !isInAllowlist
      ? null
      : tokenPrices && tokenPrices
        ? tokenPrices
        : defaultPrices;
  };

  /**
   * Provide validated ads data
   */

  graphResult.data.adProposals.forEach((ad) => {
    const { token } = ad;
    const { tokenId, marketplaceListings, mint } = token;
    if (!result[tokenId]) {
      result[tokenId] = {};
    }
    result[tokenId][ad.adParameter.id] = ad.data;

    if (mint?.tokenData) {
      result[tokenId].tokenData = mint.tokenData;
    }

    result[tokenId]._buy = {
      mint: getTokenMintValue(token),
      secondary:
        marketplaceListings.find(
          (l) => l.startTime < Date.now() / 1000 && l.endTime > Date.now() / 1000
        ) || null
    };
  });

  /**
   * Fulfill data for each token id
   */

  if (!tokenIds) {
    tokenIds = graphResult.data.adOffers[0].nftContract.tokens.map((t) => t.tokenId);
  }

  if (tokenIds && tokenIds.length > 0) {
    tokenIds.forEach((_tokenId) => {
      if (!result[_tokenId]) {
        result[_tokenId] = {};
      }

      const token = graphResult.data.adOffers[0].nftContract.tokens.find(
        (t) => t.tokenId === _tokenId
      );

      if (token) {
        const { tokenId, setInAllowList, marketplaceListings, nftContract, mint, prices } = token;

        if (mint?.tokenData) {
          result[tokenId].tokenData = mint.tokenData;
        }

        const restrictedToAllowlist = nftContract?.allowList ? !setInAllowList : false;

        result[tokenId]._buy = {
          mint:
            mint?.blockTimestamp || restrictedToAllowlist
              ? null
              : prices?.length > 0
                ? prices
                : nftContract?.prices,
          secondary:
            marketplaceListings.find(
              (l) => l.startTime < Date.now() / 1000 && l.endTime > Date.now() / 1000
            ) || null
        };
      } else {
        // mint / buy
      }
    });
  }

  return result;
}
