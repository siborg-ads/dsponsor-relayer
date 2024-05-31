import config from "@/config";
import {
  computeBidAmounts,
  getDecimalsAndSymbol,
  getMinimalBidPerToken,
  isObject,
  priceFormattedForAllValuesObject
} from "@/utils";

async function populateMarketplaceListing(chainId, listing, nftContract) {
  if (listing) {
    const {
      address,
      feeBps: protocolFeeBps,
      minimalBidBps,
      previousBidAmountBps
    } = config[chainId].smartContracts.DSPONSOR_MARKETPLACE || {};
    const { reservePricePerToken, buyoutPricePerToken, bids, quantity, currency } = listing || {};
    const { royalty } = nftContract || {};
    let { bps: royaltyBps } = royalty || {};

    if (!royaltyBps) royaltyBps = "0";

    if (minimalBidBps && reservePricePerToken && buyoutPricePerToken && bids) {
      let { totalBidAmount: previousBidAmount } = bids[0] || {};
      previousBidAmount = previousBidAmount ? previousBidAmount : "0";
      const previousPricePerToken = previousBidAmount
        ? (BigInt(previousBidAmount) / BigInt(quantity)).toString()
        : "0";

      const bidPriceStructure = Object.assign(
        { previousBidAmount, previousPricePerToken },
        computeBidAmounts(
          getMinimalBidPerToken(previousPricePerToken, reservePricePerToken, minimalBidBps),
          quantity,
          reservePricePerToken,
          buyoutPricePerToken,
          previousPricePerToken,
          minimalBidBps,
          previousBidAmountBps,
          royaltyBps,
          protocolFeeBps
        )
      );

      /////////////////

      const protocolFeeBuyAmount =
        (BigInt(buyoutPricePerToken) * BigInt(protocolFeeBps)) / BigInt("10000");
      const royaltiesBuyAmount =
        (BigInt(buyoutPricePerToken) * BigInt(royaltyBps)) / BigInt("10000");
      const listerBuyAmount =
        BigInt(buyoutPricePerToken) - royaltiesBuyAmount - protocolFeeBuyAmount;

      const buyPriceStructure = {
        listerBuyAmount: listerBuyAmount.toString(),
        royaltiesBuyAmount: royaltiesBuyAmount.toString(),
        protocolFeeBuyAmount: protocolFeeBuyAmount.toString(),
        buyoutPricePerToken
      };

      const { decimals, symbol } = (await getDecimalsAndSymbol(chainId, currency)) || {};

      listing = {
        ...listing,
        currencySymbol: symbol,
        currencyDecimals: decimals.toString(),
        marketplaceAddress: address,
        protocolFeeBps: BigInt(protocolFeeBps).toString(),
        minimalBidBps: BigInt(minimalBidBps).toString(),
        previousBidAmountBps: BigInt(previousBidAmountBps).toString(),
        bidPriceStructure,
        bidPriceStructureFormatted: priceFormattedForAllValuesObject(decimals, bidPriceStructure),
        buyPriceStructure,
        buyPriceStructureFormatted: priceFormattedForAllValuesObject(decimals, buyPriceStructure)
      };
    }
  }
  return listing;
}

async function populateMintPrice(chainId, price) {
  if (price) {
    const { currency, amount } = price || {};
    const { address, feeBps } = config[chainId].smartContracts.DSPONSOR_ADMIN || {};
    if (amount && currency && feeBps) {
      const protocolFeeAmount = (BigInt(amount) * BigInt(feeBps)) / BigInt(10000);
      const totalAmount = BigInt(amount) + protocolFeeAmount;

      const mintPriceStructure = {
        protocolFeeBps: BigInt(feeBps).toString(),
        //
        creatorAmount: amount,
        protocolFeeAmount: protocolFeeAmount.toString(),
        totalAmount: totalAmount.toString()
      };

      const { decimals, symbol } = (await getDecimalsAndSymbol(chainId, currency)) || {};

      price = {
        ...price,
        currencySymbol: symbol,
        currencyDecimals: decimals.toString(),
        minterAddress: address,
        mintPriceStructure,
        mintPriceStructureFormatted: priceFormattedForAllValuesObject(decimals, mintPriceStructure)
      };
    }
  }
  return price;
}

async function tokenMetadataReplace(offerMetadata, tokenMetadata, tokenData) {
  const res = {
    name: "Untitled token",
    description: "No description for this token",
    image: "https://via.placeholder.com/500x500?text=Unknown%20token"
  };

  if (typeof offerMetadata === "object" && offerMetadata !== null) {
    Object.assign(res, offerMetadata);
  }

  if (
    tokenData &&
    tokenMetadata &&
    tokenMetadata.name &&
    tokenMetadata.description &&
    tokenMetadata.image
  ) {
    try {
      const fetchTokenData = JSON.parse(
        JSON.stringify(tokenMetadata).replace(/\{tokenData\}/g, tokenData)
      );
      Object.assign(res, fetchTokenData);
    } catch (e) {
      console.error(`Error with token metadata ${tokenMetadata}`);
    }
  }

  return res;
}

async function populateTokens(token) {
  const adOffer = token?.nftContract?.adOffers?.length ? token.nftContract.adOffers[0] : null;

  if (adOffer) {
    await populateAdOffer(token.nftContract.adOffers[0]);

    const offerMetadata = token.nftContract.adOffers[0]?.metadata?.offer;
    const tokenMetadata = token.nftContract.adOffers[0]?.metadata?.offer?.token_metadata;
    const tokenData = token?.mint?.tokenData;

    token.metadata = await tokenMetadataReplace(offerMetadata, tokenMetadata, tokenData);
  }
}

async function populateAdOffer(adOffer) {
  const { metadataURL, nftContract } = adOffer;

  if (metadataURL) {
    try {
      const metadataRequest = await fetch(metadataURL, {
        headers: {
          "content-type": "application/json"
        },
        cache: "force-cache"
      });
      adOffer.metadata = await metadataRequest.json();

      if (nftContract?.tokens?.length) {
        for (let i = 0; i < nftContract.tokens.length; i++) {
          const offerMetadata = adOffer.metadata?.offer;
          const tokenMetadata = adOffer.metadata?.offer?.token_metadata;
          const tokenData = nftContract.tokens[i].mint?.tokenData;
          adOffer.nftContract.tokens[i].metadata = await tokenMetadataReplace(
            offerMetadata,
            tokenMetadata,
            tokenData
          );
        }
      }
    } catch (e) {
      console.error(`Error fetching metadata for ${metadataURL}`);
    }
  }

  if (!adOffer.metadata) {
    adOffer.metadata = {
      name: "Untitled",
      description: "No description",
      image: "https://via.placeholder.com/500x500?text=Unknown"
    };
  }
}

export async function populateSubgraphResult(chainId, queryResult) {
  // Recursive function to traverse the object
  async function traverse(current) {
    if (isObject(current.adOffer)) {
      await populateAdOffer(current.adOffer);
    }
    if (isObject(current.token)) {
      await populateTokens(current.token);
    }
    if (isObject(current.price)) {
      current.price = await populateMintPrice(chainId, current.price);
    }
    if (isObject(current.marketplaceListing)) {
      current.marketplaceListing = await populateMarketplaceListing(
        chainId,
        current.marketplaceListing,
        current.nftContract
      );
    }

    if (Array.isArray(current.adOffers)) {
      for (let key in current.adOffers) {
        await populateAdOffer(current.adOffers[key]);
      }
    }
    if (Array.isArray(current.tokens)) {
      for (let key in current.tokens) {
        await populateTokens(current.tokens[key]);
      }
    }
    if (Array.isArray(current.prices)) {
      for (let key in current.prices) {
        current.prices[key] = await populateMintPrice(chainId, current.prices[key]);
      }
    }
    if (Array.isArray(current.marketplaceListings)) {
      for (let key in current.marketplaceListings) {
        current.marketplaceListings[key] = await populateMarketplaceListing(
          chainId,
          current.marketplaceListings[key],
          current.nftContract
        );
      }
    }

    // Iterate through all properties of the current object
    for (let key in current) {
      // If the property is an object, traverse it recursively
      if (isObject(current[key])) {
        await traverse(current[key]);
      }
      // If the property is an array, iterate through its elements
      if (Array.isArray(current[key])) {
        for (let i = 0; i < current[key].length; i++) {
          if (isObject(current[key][i])) {
            await traverse(current[key][i]);
          }
        }
      }
    }
  }

  // Start traversing from the root object
  await traverse(queryResult);

  return queryResult;
}
