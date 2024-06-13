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
    marketplaceListings(
      first: 1000
      orderBy: lastUpdateTimestamp
      orderDirection: desc
      where: { status: CREATED }
    ) {
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
        ...MarketplaceBidFragment
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
