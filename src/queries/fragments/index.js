export const BaseAdOfferFragment = /* GraphQL */ `
  fragment BaseAdOfferFragment on AdOffer {
    id
    disable
    metadataURL
    metadata {
      content
    }
    name
    initialCreator
    validators
    admins
    creationTimestamp
    adParameters(where: { enable: true }) {
      enable
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
    owner
    prices(where: { enabled: true }) {
      enabled
      currency
      amount
    }
    royalty {
      bps
      receiver
    }
  }
`;

const BaseProtocolFeesFragment = /* GraphQL */ `
  fragment BaseProtocolFeesFragment on CallWithProtocolFee {
    id
    blockTimestamp
    transactionHash
    currency
    fee
    enabler
    spender
    referralAddresses
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

export const MarketplaceBidFragment = /* GraphQL */ `
  fragment MarketplaceBidFragment on MarketplaceBid {
    amountSentToCreator
    creatorRecipient
    amountSentToProtocol
    amountSentToSeller
    sellerRecipient
    ####
    creationTxHash
    creationTimestamp
    bidder
    totalBidAmount # current bid / new price per token * quantity
    paidBidAmount # how much bidder paid
    refundBonus
    refundAmount # refund (outbid case)
    refundProfit # how much bidder gains from refund
    currency
    status
  }
`;

export const RevenueTransactionFragment = /* GraphQL */ `
  fragment RevenueTransactionFragment on RevenueTransaction {
    id
    blockTimestamp

    marketplaceBids {
      ...MarketplaceBidFragment
      listing {
        currency
        token {
          nftContract {
            id
          }
        }
      }
    }
    marketplaceDirectBuys {
      totalPricePaid
      buyer
      amountSentToCreator
      creatorRecipient
      amountSentToProtocol
      amountSentToSeller
      sellerRecipient
      listing {
        currency
        token {
          nftContract {
            id
          }
        }
      }
    }
    marketplaceOffers {
      currency
      totalPrice
      offeror
      amountSentToCreator
      creatorRecipient
      amountSentToProtocol
      amountSentToSeller
      sellerRecipient
      token {
        nftContract {
          id
        }
      }
    }
    mints {
      currency
      amount
      to
      amountSentToProtocol
      token {
        nftContract {
          id
        }
      }
    }
    protocolFees {
      ...BaseProtocolFeesFragment
    }
  }
`;

export const TokenFragment = /* GraphQL */ `
  fragment TokenFragment on Token {
    tokenId
    setInAllowList
    owner
    marketplaceListings(first: 1000, orderBy: lastUpdateTimestamp, orderDirection: desc) {
      id
      lister
      quantity
      listingType
      startTime
      endTime
      currency
      buyoutPricePerToken
      reservePricePerToken
      status
      bids(first: 1000, orderBy: totalBidAmount, orderDirection: desc) {
        ...MarketplaceBidFragment
      }
    }
    nftContract {
      ...BaseNftContractFragment
    }
    mint {
      tokenData
      blockTimestamp
      totalPaid
      currency
    }
    prices(where: { enabled: true }) {
      currency
      amount
    }
    currentProposals {
      adOffer {
        id
      }
      adParameter {
        id
      }
      pendingProposal {
        status
        data
        creationTimestamp
      }
      acceptedProposal {
        status
        data
        creationTimestamp
      }
      rejectedProposal {
        status
        data
        rejectReason
        creationTimestamp
      }
    }
    allProposals(first: 1000, orderBy: creationTimestamp, orderDirection: desc) {
      adParameter {
        id
      }
      status
      data
      rejectReason
      creationTimestamp
      lastUpdateTimestamp
    }
  }
`;

const fragments = [
  BaseAdOfferFragment,
  BaseNftContractFragment,
  BaseProtocolFeesFragment,
  AdOfferFragment,
  AdOfferSelectedTokensFragment,
  AdOfferSelectedNftTokensFragment,
  AdProposalFragment,
  MarketplaceBidFragment,
  RevenueTransactionFragment,
  TokenFragment
];

export default fragments;
