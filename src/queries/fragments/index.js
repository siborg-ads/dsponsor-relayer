export const BaseAdOfferFragment = /* GraphQL */ `
  fragment BaseAdOfferFragment on AdOffer {
    id
    disable
    metadataURL
    name
    initialCreator
    validators
    admins
    creationTimestamp
    adParameters(where: { enable: true }) {
      adParameter {
        id
        base
        variants
      }
    }
  }
`;

const BaseNftContractFragment = /* GraphQL */ `
  fragment BaseNftContractFragment on NftContract {
    id
    allowList
    maxSupply
    royalty {
      bps
      receiver
    }
    prices(where: { enabled: true }) {
      currency
      amount
    }
  }
`;

export const AdOfferFragment = /* GraphQL */ `
  fragment AdOfferFragment on AdOffer {
    ...BaseAdOfferFragment
    nftContract {
      ...BaseNftContractFragment
      tokens(first: 1000) {
        ...TokenFragment
      }
    }
  }
`;

export const AdOfferSelectedTokensFragment = /* GraphQL */ `
  fragment AdOfferSelectedTokensFragment on AdOffer {
    ...BaseAdOfferFragment
    nftContract {
      ...BaseNftContractFragment
      tokens(where: { tokenId_in: $tokenIds }) {
        ...TokenFragment
      }
    }
  }
`;

export const AdOfferSelectedNftTokensFragment = /* GraphQL */ `
  fragment AdOfferSelectedNftTokensFragment on AdOffer {
    ...BaseAdOfferFragment
    nftContract {
      ...BaseNftContractFragment
      tokens(where: { id_in: $tokenIds }) {
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
      id
      quantity
      listingType
      startTime
      endTime
      currency
      buyoutPricePerToken
      reservePricePerToken
      status
      bids(orderBy: totalBidAmount, orderDirection: desc, first: 1) {
        bidder
        totalBidAmount
      }
    }
    nftContract {
      ...BaseNftContractFragment
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

const fragments = [
  BaseAdOfferFragment,
  BaseNftContractFragment,
  AdOfferFragment,
  AdOfferSelectedTokensFragment,
  AdOfferSelectedNftTokensFragment,
  AdProposalFragment,
  TokenFragment
];

export default fragments;
