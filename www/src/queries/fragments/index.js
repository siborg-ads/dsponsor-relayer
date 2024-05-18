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

export const AdProposalFragment = /* GraphQL */ `
  fragment AdProposalFragment on AdProposal {
    adParameter {
      id
    }
    data
    token {
      ...TokenFragment
    }
  }
`;

export const TokenFragment = /* GraphQL */ `
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

const fragments = [AdOfferFragment, AdProposalFragment, TokenFragment];

export default fragments;
