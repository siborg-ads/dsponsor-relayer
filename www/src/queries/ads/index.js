import { executeQuery } from "@/queries/subgraph";

export const TokensFragment = /* GraphQL */ `
  fragment TokenFragment on Token {
    tokenId
    setInAllowList
    marketplaceListings(where: { status: CREATED }) {
      listingType
      startTime
      endTime
      currency
      buyoutPricePerToken
      reservePricePerToken
      status
      bids(orderBy: totalBidAmount, orderDirection: desc, first: 1) {
        totalBidAmount
      }
    }
    nftContract {
      allowList
      prices(where: { enabled: true }) {
        currency
        amount
      }
    }
    mint {
      tokenData
      blockTimestamp
    }
    prices(where: { enabled: true }) {
      currency
      amount
    }
  }
`;

export const AdOfferFragment = /* GraphQL */ `
  fragment AdOfferFragment on AdOffer {
    id
    nftContract {
      allowList
      maxSupply
      prices(where: { enabled: true }) {
        currency
        amount
      }
      tokens(first: 1000) {
        ...TokenFragment
      }
    }
  }
`;

export const ValidatedAdFragment = /* GraphQL */ `
  fragment ValidatedAdFragment on AdProposal {
    adParameter {
      id
    }
    data
    token {
      ...TokenFragment
    }
  }
`;

export const getValidatedAdsForTokensQuery = /* GraphQL */ `
  ${TokensFragment}
  ${AdOfferFragment}
  ${ValidatedAdFragment}
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
      ...ValidatedAdFragment
    }
  }
`;

const getValidatedAdsForOfferQuery = /* GraphQL */ `
  ${TokensFragment}
  ${AdOfferFragment}
  ${ValidatedAdFragment}
  query getValidatedAds($adOfferId: String) {
    adOffers(where: { id: $adOfferId }) {
      ...AdOfferFragment
    }
    adProposals(first: 1000, where: { adOffer_: { id: $adOfferId }, status: CURRENT_ACCEPTED }) {
      ...ValidatedAdFragment
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

  graphResult.data.adProposals.forEach((ad) => {
    const { tokenId, setInAllowList, marketplaceListings, nftContract, mint, prices } = ad.token;
    if (!result[tokenId]) {
      result[tokenId] = {};
    }
    result[tokenId][ad.adParameter.id] = ad.data;

    if (mint?.tokenData) {
      result[tokenId].tokenData = mint.tokenData;
    }

    const restrictedToAllowlist = nftContract?.allowList ? setInAllowList === false : false;

    result[tokenId]._buy = {
      mint:
        mint?.blockTimestamp || restrictedToAllowlist
          ? null
          : prices[0]
            ? prices[0]
            : nftContract?.prices[0],
      secondary:
        marketplaceListings.find(
          (l) => l.startTime < Date.now() / 1000 && l.endTime > Date.now() / 1000
        ) || null
    };
  });

  if (!tokenIds) {
    // tokenids = array from 0 to maxSupply -1
    tokenIds = graphResult.data.adOffers[0].nftContract.tokens.map((t) => t.tokenId);
  }

  if (tokenIds && tokenIds.length > 0) {
    graphResult.data.adOffers[0].nftContract.tokens
      .filter((t) => tokenIds.includes(t.tokenId))
      .forEach((token) => {
        const { tokenId, setInAllowList, marketplaceListings, nftContract, mint, prices } = token;
        if (!result[tokenId]) {
          result[tokenId] = {};
        }

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
      });
  }

  const { allowList, maxSupply, prices, tokens } = graphResult.data.adOffers[0].nftContract;

  const availableAllowlistedTokens = tokens
    .filter((t) => {
      const isMinted = t.mint && t.mint.blockTimestamp && t.mint.blockTimestamp > 0;

      return t.setInAllowList && !isMinted;
    })
    .map(({ tokenId, prices: tokenPrices }) => {
      return {
        tokenId,
        prices: tokenPrices && tokenPrices.length > 0 ? tokenPrices : prices
      };
    });

  result._mint =
    (allowList === false && prices.length) || availableAllowlistedTokens.length > 0
      ? {
          allowList,
          maxSupply,
          availableAllowlistedTokens,
          prices
        }
      : null;

  return result;
}
