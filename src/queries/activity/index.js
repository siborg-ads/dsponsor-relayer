import { Alchemy } from "alchemy-sdk";
import { parseUnits } from "ethers";
import config from "@/config";
import { executeQuery } from "@/queries/subgraph";
import { getCurrencyInfos, priceFormattedForAllValuesObject } from "@/utils/pricing";

export async function getAllOffers(chainId) {
  const geAllOffersQuery = /* GraphQL */ `
    query getAllOffers {
      adOffers {
        ...BaseAdOfferFragment
        nftContract {
          id
        }
      }
    }
  `;
  const graphResult = await executeQuery(chainId, geAllOffersQuery);
  return graphResult.data.adOffers;
}

export async function getHolders(chainId, nftContractAddresses) {
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

    for (const { ownerAddress, tokenBalances } of owners) {
      if (!ownerBalances[ownerAddress]) {
        ownerBalances[ownerAddress] = 0;
      }
      for (const { balance } of tokenBalances) {
        ownerBalances[ownerAddress] += Number(balance);
      }
    }
  }
  return ownerBalances;
}

export async function getSpendings(chainId) {
  const getSpendingsQuery = /* GraphQL */ `
    query getSpendings($fromTimestamp: BigInt, $toTimestamp: BigInt) {
      newBids(
        orderBy: blockTimestamp
        orderDirection: asc
        where: { blockTimestamp_gte: $fromTimestamp, blockTimestamp_lte: $toTimestamp }
      ) {
        ...NewBidFragment
      }
      revenueTransactions(
        where: { blockTimestamp_gte: $fromTimestamp, blockTimestamp_lte: $toTimestamp }
      ) {
        ...RevenueTransactionFragment
      }
    }
  `;

  const result = {};
  const lastBid = {
    blockTimestamp: 0,
    bidderAddr: "0x0000000000000000000000000000000000000000",
    listingId: "0"
  };

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

  const graphResult = await executeQuery(chainId, getSpendingsQuery, {
    fromTimestamp: "0",
    toTimestamp: "9999999999999999"
  });

  for (const {
    blockTimestamp,
    currency,
    quantityWanted,
    newPricePerToken,
    refundBonus,
    newBidder,
    previousBidder,
    listingId
  } of graphResult.data.newBids) {
    if (blockTimestamp > lastBid.blockTimestamp) {
      lastBid.blockTimestamp = blockTimestamp;
      lastBid.bidderAddr = newBidder;
      lastBid.listingId = listingId;
    }

    setupResult(newBidder, currency);
    setupResult(previousBidder, currency);

    const spent = BigInt(quantityWanted) * (BigInt(newPricePerToken) + BigInt(refundBonus));
    result[newBidder]["currenciesAmounts"][currency].bidSpent += spent;
    result[newBidder]["currenciesAmounts"][currency].totalSpent += spent;
    result[newBidder].nbBids += 1;

    /**
     * @fix - this should be implemented differently
     */
    result[previousBidder]["currenciesAmounts"][currency].bidSpent -=
      BigInt("20") * BigInt(refundBonus);
    result[previousBidder]["currenciesAmounts"][currency].totalSpent -=
      BigInt("20") * BigInt(refundBonus);

    result[previousBidder]["currenciesAmounts"][currency].bidRefundReceived += BigInt(refundBonus);
    result[previousBidder]["currenciesAmounts"][currency].totalReceived += BigInt(refundBonus);
    result[previousBidder].nbRefunds += 1;
  }

  /* @todo
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

  return { lastBid, spendings: result };
}
