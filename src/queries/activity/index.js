import { Alchemy } from "alchemy-sdk";
import { parseUnits, getAddress } from "ethers";
import config from "@/config";
import { executeQuery } from "@/queries/subgraph";
import { getCurrencyInfos, priceFormattedForAllValuesObject } from "@/utils";

export async function getAllOffers(chainId) {
  let skip = 0;
  let offers = [];
  let hasMore = true;

  while (hasMore) {
    const geAllOffersQuery = /* GraphQL */ `
      query getAllOffers($skip: Int!) {
        adOffers(first: 1000, skip: $skip) {
          ...BaseAdOfferFragment
          nftContract {
            id
          }
        }
      }
    `;
    const graphResult = await executeQuery(chainId, geAllOffersQuery, { skip });

    if (graphResult.data.adOffers.length > 0) {
      hasMore = true;
      offers = [...offers, ...graphResult.data.adOffers];
    } else {
      hasMore = false;
    }

    skip += 1000;
  }

  return offers;
}

export async function getHolders(chainId, nftContractAddresses, userAddress) {
  const settings = {
    apiKey: process.env.NEXT_ALCHEMY_API_KEY,
    network: config[chainId].network
  };

  const alchemy = new Alchemy(settings);

  const ownerBalances = {};

  for (const nftContractAddress of nftContractAddresses) {
    const { owners } = await alchemy.nft.getOwnersForContract(nftContractAddress, {
      withTokenBalances: true
    });

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
    ? { [getAddress(userAddress)]: ownerBalances[getAddress(userAddress)] }
    : ownerBalances;
}

export async function getSpendings(
  chainId,
  nftContractAddress,
  userAddress,
  fromTimestamp,
  toTimestamp
) {
  nftContractAddress = nftContractAddress ? nftContractAddress.toLowerCase() : "";

  if (!userAddress) userAddress = "";
  if (!fromTimestamp) fromTimestamp = "0";
  if (!toTimestamp) toTimestamp = "99999999999";

  const getBidsQuery = /* GraphQL */ `
    query getBids(
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
            }
            marketplaceListings(
              first: 1000
              orderBy: creationTimestamp
              orderDirection: desc
              where: {
                listingType: Auction
                bids_: {
                  bidder_contains: $userAddress
                  creationTimestamp_gte: $fromTimestamp
                  creationTimestamp_lte: $toTimestamp
                }
              }
            ) {
              status
              currency
              bids(
                first: 1000
                orderBy: creationTimestamp
                orderDirection: desc
                where: { bidder_contains: $userAddress }
              ) {
                ...MarketplaceBidFragment
              }
            }
          }
        }
      }
    }
  `;

  let noMoreOffers = false;
  let noMoreTokens = false;

  const firstOffers = 1000;
  let skipOffers = 0;
  const firstTokens = 1000;
  let skipTokens = 0;

  const result = {};
  const lastBid = {
    blockTimestamp: 0,
    bidderAddr: "0x0000000000000000000000000000000000000000",
    listingId: "0"
  };
  let totalBids = 0;

  const setupResult = (addr, currency) => {
    if (!result[addr]) {
      result[addr] = {
        nbBids: 0,
        nbWinningBids: 0,
        nbRefunds: 0,
        nbSoldBids: 0,
        nbBuys: 0,
        nbSoldBuys: 0,
        nbOffers: 0,
        nbSoldOffers: 0,
        nbMints: 0,
        nbSoldMint: 0,
        usdcAmounts: {
          // total USDC
          totalSpent: BigInt("0"),
          totalReceived: BigInt("0"),
          bidSpent: BigInt("0"),
          bidRefundReceived: BigInt("0"),
          bidReceived: BigInt("0"),
          buySpent: BigInt("0"),
          buyReceived: BigInt("0"),
          offerSpent: BigInt("0"),
          offerReceived: BigInt("0"),
          mintSpent: BigInt("0"),
          mintReceived: BigInt("0"),
          totalProtocolFee: BigInt("0")
        },
        currenciesAmounts: {}
      };
    }

    if (!result[addr]["currenciesAmounts"][currency]) {
      result[addr]["currenciesAmounts"][currency] = {
        totalSpent: BigInt("0"),
        totalReceived: BigInt("0"),
        //
        bidSpent: BigInt("0"),
        bidRefundReceived: BigInt("0"),
        bidReceived: BigInt("0"),
        buySpent: BigInt("0"),
        buyReceived: BigInt("0"),
        offerSpent: BigInt("0"),
        offerReceived: BigInt("0"),
        mintSpent: BigInt("0"),
        mintReceived: BigInt("0"),
        totalProtocolFee: BigInt("0")
      };
    }
  };

  while (!noMoreOffers) {
    noMoreOffers = true;
    skipTokens = 0;

    while (!noMoreTokens) {
      noMoreTokens = true;
      const graphResult = await executeQuery(chainId, getBidsQuery, {
        nftContractAddress,
        userAddress,
        fromTimestamp,
        toTimestamp,
        firstOffers,
        skipOffers,
        firstTokens,
        skipTokens
      });

      const { adOffers } = graphResult.data;

      if (adOffers.length) {
        noMoreOffers = false;

        for (const {
          id: offerId,
          nftContract: { id: contractAddress, tokens }
        } of adOffers) {
          if (tokens.length) {
            noMoreTokens = false;

            for (const { tokenId, mint, metadata, marketplaceListings } of tokens) {
              const tokenData = mint ? mint.tokenData : null;

              for (const { bids } of marketplaceListings) {
                if (bids.length) {
                  noMoreTokens = false;

                  for (const {
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

                    setupResult(bidder, currency);
                    result[bidder].nbBids += 1;

                    if (refundProfit > BigInt("0")) {
                      result[bidder]["currenciesAmounts"][currency].bidRefundReceived +=
                        BigInt(refundProfit);
                      result[bidder]["currenciesAmounts"][currency].totalReceived +=
                        BigInt(refundProfit);
                      result[bidder].nbRefunds += 1;

                      result[bidder]["currenciesAmounts"][currency].bidSpent -=
                        BigInt(refundProfit);
                      result[bidder]["currenciesAmounts"][currency].totalSpent +=
                        BigInt(refundProfit);
                    } else {
                      result[bidder]["currenciesAmounts"][currency].bidSpent +=
                        BigInt(paidBidAmount);
                      result[bidder]["currenciesAmounts"][currency].totalSpent +=
                        BigInt(paidBidAmount);
                    }
                  }
                }
              }
            }
          }
        }
        skipTokens += firstTokens;
      }
    }

    skipOffers += firstOffers;
  }

  ////////////////////////////////

  /* @todo
revenueTransactions(
        where: { blockTimestamp_gte: $fromTimestamp, blockTimestamp_lte: $toTimestamp }
      ) {
        ...RevenueTransactionFragment
      }


  for (const {
    marketplaceBids,
    marketplaceDirectBuys,
    marketplaceOffers,
    mint,
    protocolFees
  } of graphResult.data.revenueTransactions) {
  }
    */

  for (const addr of Object.keys(result)) {
    for (const currency of Object.keys(result[addr]["currenciesAmounts"])) {
      const { symbol, decimals, priceUSDC } = await getCurrencyInfos(chainId, currency);

      for (const key of Object.keys(result[addr]["currenciesAmounts"][currency])) {
        const usdcAmount =
          (BigInt(priceUSDC) * BigInt(result[addr]["currenciesAmounts"][currency][key])) /
          parseUnits("1", decimals);
        result[addr]["usdcAmounts"][key] += usdcAmount;
      }
      result[addr]["currenciesAmounts"][currency] = {
        symbol,
        ...priceFormattedForAllValuesObject(6, { priceUSDC }),
        ...priceFormattedForAllValuesObject(decimals, result[addr]["currenciesAmounts"][currency])
      };
    }
    // delete result[addr]["currenciesAmounts"];
  }

  return { totalBids, lastBid, spendings: result };
}
