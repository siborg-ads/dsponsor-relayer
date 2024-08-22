import { Alchemy } from "alchemy-sdk";
import { parseUnits, getAddress } from "ethers";
import config from "@/config";
import { executeQuery } from "@/queries/subgraph";
import { getCurrencyInfos, priceFormattedForAllValuesObject } from "@/utils";
import { memoize } from "nextjs-better-unstable-cache";

export async function getAllOffers(chainId, options) {
  let skip = 0;
  let offers = [];
  // let hasMore = true;

  // @dev : no pagination for now
  //  while (hasMore) {
  const getAllOffersQuery = /* GraphQL */ `
    query getAllOffers($skip: Int!) {
      adOffers(first: 1000, skip: $skip) {
        ...BaseAdOfferFragment
        nftContract {
          id
        }
      }
    }
  `;
  const baseOptions = { populate: false, next: { tags: [`${chainId}-adOffers`] } };
  options = options ? { ...baseOptions, ...options } : baseOptions;
  const graphResult = await executeQuery(chainId, getAllOffersQuery, { skip }, options);

  if (graphResult.data.adOffers.length > 0) {
    // hasMore = true;
    offers = [...offers, ...graphResult.data.adOffers];
  } else {
    // hasMore = false;
  }

  skip += 1000;
  // }

  return offers;
}

export const getHoldersForNftContract = memoize(_getHoldersForNftContract, {
  revalidateTags: (chainId, nftContractAddress) => [
    `${chainId}-nftContract-${getAddress(nftContractAddress)}`
  ],
  log: ["datacache", "verbose"]
});

async function _getHoldersForNftContract(chainId, nftContractAddress) {
  const settings = {
    apiKey: process.env.NEXT_ALCHEMY_API_KEY,
    network: config[chainId].network
  };
  const alchemy = new Alchemy(settings);
  const { owners } = await alchemy.nft.getOwnersForContract(nftContractAddress, {
    withTokenBalances: true
  });

  return owners;
}

export async function getHolders(chainId, nftContractAddresses, userAddress) {
  const ownerBalances = {};

  for (const nftContractAddress of nftContractAddresses) {
    const owners = await getHoldersForNftContract(chainId, nftContractAddress);
    for (let { ownerAddress, tokenBalances } of owners) {
      ownerAddress = getAddress(ownerAddress);
      if (!ownerBalances[ownerAddress]) {
        ownerBalances[ownerAddress] = 0;
      }
      for (const { balance } of tokenBalances) {
        ownerBalances[ownerAddress] += Number(balance);
      }
    }
  }
  return userAddress
    ? {
        [getAddress(userAddress)]: ownerBalances[getAddress(userAddress)]
          ? ownerBalances[getAddress(userAddress)]
          : 0
      }
    : ownerBalances;
}

export const getHoldings = memoize(_getHoldings, {
  revalidateTags: (chainId, ownerAddress) => [`${chainId}-userAddress-${getAddress(ownerAddress)}`],
  log: ["datacache", "verbose"]
});

async function _getHoldings(chainId, ownerAddress) {
  const settings = {
    apiKey: process.env.NEXT_ALCHEMY_API_KEY,
    network: config[chainId].network
  };

  const alchemy = new Alchemy(settings);

  let tokens = [];
  let pageKey = null;

  do {
    const { ownedNfts, pageKey: newPageKey } = await alchemy.nft.getNftsForOwner(ownerAddress, {
      pageKey
    });
    pageKey = newPageKey;
    tokens = tokens.concat(ownedNfts);
  } while (pageKey);

  let possibleTokens = [];
  for (const nft of tokens) {
    if (nft.tokenId) {
      possibleTokens.push({
        tokenId: nft.tokenId,
        tokenUri: nft.tokenUri,
        nftContractAddress: nft.contract.address.toLowerCase(),
        ownerAddress,
        name: nft.contract.name,
        symbol: nft.contract.symbol,
        balance: nft.balance,
        timeLastUpdated: nft.timeLastUpdated
      });
    }
  }

  const nftContracts = [...new Set(possibleTokens.map((token) => token.nftContractAddress))];
  const tokenIds = [
    ...new Set(possibleTokens.map((token) => `${token.nftContractAddress}-${token.tokenId}`))
  ];

  return { nftContracts, tokenIds };
}

export async function getSpendings(
  chainId,
  nftContractAddress,
  userAddress,
  fromTimestamp,
  toTimestamp,
  options
) {
  nftContractAddress = nftContractAddress ? nftContractAddress.toLowerCase() : "";

  if (!userAddress) userAddress = "";
  if (!fromTimestamp) fromTimestamp = "0";
  if (!toTimestamp) toTimestamp = "99999999999";

  const getSpendingsQuery = /* GraphQL */ `
    fragment RevenueTransactionFragmentFiltering on RevenueTransaction {
      protocolFees(
        where: {
          and: [
            { blockTimestamp_gte: $fromTimestamp }
            { blockTimestamp_lte: $toTimestamp }
            {
              or: [
                { enabler_contains: $userAddress }
                { spender_contains: $userAddress }
                { referralAdditionalInformation_contains: $userAddress }
              ]
            }
          ]
        }
      ) {
        ...BaseProtocolFeesFragment
      }
    }
    query getSpendings(
      $nftContractAddress: Bytes!
      $userAddress: Bytes!
      $fromTimestamp: BigInt!
      $toTimestamp: BigInt!
      $firstOffers: Int!
      $skipOffers: Int!
      $firstTokens: Int!
      $skipTokens: Int!
    ) {
      adOffers(
        first: $firstOffers
        skip: $skipOffers
        where: { nftContract_: { id_contains: $nftContractAddress } }
      ) {
        id
        metadataURL
        name
        nftContract {
          id
          tokens(first: $firstTokens, skip: $skipTokens) {
            tokenId
            mint {
              tokenData
              revenueTransaction {
                ...RevenueTransactionFragmentFiltering
              }
            }
            marketplaceListings(first: 1000, orderBy: creationTimestamp, orderDirection: desc) {
              status
              currency
              directBuys {
                revenueTransaction {
                  ...RevenueTransactionFragmentFiltering
                }
              }
              completedBid {
                revenueTransaction {
                  ...RevenueTransactionFragmentFiltering
                }
              }
              bids(
                first: 1000
                orderBy: creationTimestamp
                orderDirection: desc
                where: {
                  bidder_contains: $userAddress
                  creationTimestamp_gte: $fromTimestamp
                  creationTimestamp_lte: $toTimestamp
                }
              ) {
                ...MarketplaceBidFragment
              }
            }
          }
        }
      }
    }
  `;

  // let noMoreOffers = false;
  // let noMoreTokens = false;

  const firstOffers = 1000;
  let skipOffers = 0;
  const firstTokens = 1000;
  let skipTokens = 0;

  const result = {};
  const protocolFees = {};
  const lastBid = {
    blockTimestamp: 0,
    bidderAddr: "0x0000000000000000000000000000000000000000",
    listingId: "0"
  };
  let totalBids = 0;

  const protocolFeeCurrency = config[chainId].smartContracts.WETH;

  const setupResult = (addr, currency) => {
    if (!result[addr]) {
      result[addr] = {
        nbBids: 0,
        nbRefunds: 0,
        nbProtocolFeeBuys: 0,
        nbProtocolFeeSells: 0,
        nbProtocolFeeReferrals: 0,
        usdcAmounts: {
          // total USDC
          totalSpent: BigInt("0"),
          totalReceived: BigInt("0"),
          bidSpent: BigInt("0"),
          bidRefundReceived: BigInt("0"),
          totalProtocolFee: BigInt("0")
        },
        currenciesAmounts: {}
      };
    }

    if (!result[addr]["currenciesAmounts"][currency]) {
      result[addr]["currenciesAmounts"][currency] = {
        totalSpent: BigInt("0"),
        totalReceived: BigInt("0"),
        bidSpent: BigInt("0"),
        bidRefundReceived: BigInt("0"),
        totalProtocolFee: BigInt("0")
      };
    }
  };

  function processProtocolFee(protocolFeeObj, type) {
    let {
      id,
      blockTimestamp,
      transactionHash,
      currency,
      fee,
      enabler,
      spender,
      referralAddresses
    } = protocolFeeObj;

    let refAddr = referralAddresses.length
      ? referralAddresses[0]
      : "0x5b15cbb40ef056f74130f0e6a1e6fd183b14cdaf";

    enabler = getAddress(enabler);
    spender = getAddress(spender);
    refAddr = getAddress(refAddr);
    currency = getAddress(currency);

    [enabler, spender, refAddr].forEach((addr) => {
      setupResult(addr, currency);
      result[addr]["currenciesAmounts"][currency].totalProtocolFee += BigInt(fee);
    });

    if (currency === protocolFeeCurrency.address) {
      result[enabler].nbProtocolFeeSells += 1;
      result[spender].nbProtocolFeeBuys += 1;
      result[refAddr].nbProtocolFeeReferrals += 1;
    }

    protocolFees[id] = {
      blockTimestamp,
      transactionHash,
      type,
      currency,
      fee,
      enabler,
      spender,
      refAddr,
      referralAddresses
    };
  }

  // @we disable the while loop for now - no need for pagination right now
  // while (!noMoreOffers) {
  // noMoreOffers = true;
  // noMoreTokens = false;
  skipTokens = 0;

  // while (!noMoreTokens) {
  // noMoreTokens = true;

  const tags = [];
  if (nftContractAddress?.length) {
    tags.push(`${chainId}-nftContract-${getAddress(nftContractAddress)}`);
  }
  if (userAddress?.length) {
    tags.push(`${chainId}-userAddress-${getAddress(userAddress)}`);
  }
  if (tags.length === 0) {
    tags.push(`${chainId}-activity`);
  }
  const baseOptions = { populate: false, next: { tags } };
  options = options ? { ...baseOptions, ...options } : baseOptions;
  const graphResult = await executeQuery(
    chainId,
    getSpendingsQuery,
    {
      nftContractAddress,
      userAddress,
      fromTimestamp,
      toTimestamp,
      firstOffers,
      skipOffers,
      firstTokens,
      skipTokens
    },
    options
  );

  const { adOffers } = graphResult.data;

  if (adOffers.length) {
    // noMoreOffers = false;

    for (const {
      id: offerId,
      nftContract: { id: contractAddress, tokens }
    } of adOffers) {
      if (tokens.length) {
        // noMoreTokens = false;

        for (const { tokenId, mint, metadata, marketplaceListings } of tokens) {
          const { tokenData, revenueTransaction: revenueTransactionMint } = mint ? mint : {};

          if (
            revenueTransactionMint &&
            revenueTransactionMint.protocolFees &&
            revenueTransactionMint.protocolFees.length
          ) {
            for (const protocolFeeObj of revenueTransactionMint.protocolFees) {
              processProtocolFee(protocolFeeObj, "mint");
            }
          }

          for (const { bids, directBuys, completedBid } of marketplaceListings) {
            for (const { revenueTransaction } of directBuys) {
              if (revenueTransaction && revenueTransaction.protocolFees) {
                for (const protocolFeeObj of revenueTransaction.protocolFees) {
                  processProtocolFee(protocolFeeObj, "buy");
                }
              }
            }

            if (
              completedBid &&
              completedBid.revenueTransaction &&
              completedBid.revenueTransaction.protocolFees
            ) {
              for (const protocolFeeObj of completedBid.revenueTransaction.protocolFees) {
                processProtocolFee(protocolFeeObj, "auction");
              }
            }

            if (bids.length) {
              // noMoreTokens = false;

              for (let {
                creationTimestamp,
                bidder,
                paidBidAmount,
                refundProfit,
                currency
              } of bids) {
                totalBids += 1;

                if (creationTimestamp > lastBid.blockTimestamp) {
                  lastBid.blockTimestamp = creationTimestamp;
                  lastBid.bidderAddr = bidder;
                  lastBid.listing = { tokenId, contractAddress, offerId, tokenData, metadata };
                }

                bidder = getAddress(bidder);
                currency = getAddress(currency);
                setupResult(bidder, currency);
                result[bidder].nbBids += 1;

                if (refundProfit > BigInt("0")) {
                  result[bidder]["currenciesAmounts"][currency].bidRefundReceived +=
                    BigInt(refundProfit);
                  result[bidder]["currenciesAmounts"][currency].totalReceived +=
                    BigInt(refundProfit);
                  result[bidder].nbRefunds += 1;

                  result[bidder]["currenciesAmounts"][currency].bidSpent -= BigInt(refundProfit);
                  result[bidder]["currenciesAmounts"][currency].totalSpent -= BigInt(refundProfit);
                } else {
                  result[bidder]["currenciesAmounts"][currency].bidSpent += BigInt(paidBidAmount);
                  result[bidder]["currenciesAmounts"][currency].totalSpent += BigInt(paidBidAmount);
                }
              }
            }
          }
        }
      }
    }
    skipTokens += firstTokens;
  }
  // }
  skipOffers += firstOffers;
  //  }

  ////////////////////////////////

  for (const addr of Object.keys(result)) {
    for (const currency of Object.keys(result[addr]["currenciesAmounts"])) {
      const { symbol, decimals, priceUSDC } = await getCurrencyInfos(chainId, currency);
      for (const key of Object.keys(result[addr]["currenciesAmounts"][currency])) {
        const usdcAmount =
          (BigInt(priceUSDC) * BigInt(result[addr]["currenciesAmounts"][currency][key])) /
          parseUnits("1", decimals);
        result[addr]["usdcAmounts"][key] += usdcAmount;
      }

      result[addr]["currenciesAmounts"][currency].formatted = {
        symbol,
        ...priceFormattedForAllValuesObject(6, { priceUSDC }),
        ...priceFormattedForAllValuesObject(decimals, result[addr]["currenciesAmounts"][currency])
      };
    }
    // delete result[addr]["currenciesAmounts"];
  }

  for (const protocolFeeId of Object.keys(protocolFees)) {
    const { currency, fee } = protocolFees[protocolFeeId];
    const { symbol, decimals, priceUSDC } = await getCurrencyInfos(chainId, currency);
    const usdcAmount = (BigInt(priceUSDC) * BigInt(fee)) / parseUnits("1", decimals);
    protocolFees[protocolFeeId] = {
      ...protocolFees[protocolFeeId],
      symbol,
      decimals,
      usdcAmount,
      formattedAmounts: {
        ...priceFormattedForAllValuesObject(decimals, { fee }),
        ...priceFormattedForAllValuesObject(6, { usdcAmount })
      }
    };
  }

  return { totalBids, lastBid, spendings: result, protocolFees, protocolFeeCurrency };
}
