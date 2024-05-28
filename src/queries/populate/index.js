import config from "@/config";
import { isObject } from "@/utils";

async function populateMarketplaceListing(chainId, listing) {
  if (listing) {
    const { address, feeBps, minimalBidBps, previousBidAmountBps } =
      config[chainId].smartContracts.DSPONSOR_MARKETPLACE || {};
    const { reservePricePerToken, buyoutPricePerToken, bids } = listing || {};

    if (minimalBidBps && reservePricePerToken && buyoutPricePerToken && bids) {
      const { totalBidAmount: previousBid } = bids[0] || {};

      const currentBid = previousBid ? BigInt(previousBid) : BigInt(reservePricePerToken);
      const totalMinimalBidAmount =
        currentBid + (currentBid * BigInt(minimalBidBps)) / BigInt("10000");

      const previousBidFeeAmount = previousBid
        ? (BigInt(totalMinimalBidAmount) * BigInt(previousBidAmountBps)) / BigInt("10000")
        : BigInt("0");

      const minimalNextBidAmount = BigInt(totalMinimalBidAmount) - previousBidFeeAmount;
      const protocolFeeBidAmount =
        (BigInt(minimalNextBidAmount) * BigInt(feeBps)) / BigInt("10000");

      // todo : royaltiesBidAmount =  get royalties fron nft contract
      const royaltiesBidAmount = BigInt("0");

      const listerBidAmount =
        totalMinimalBidAmount - previousBidFeeAmount - royaltiesBidAmount - protocolFeeBidAmount;

      ////////////////////////////

      const protocolFeeBuyAmount = (BigInt(buyoutPricePerToken) * BigInt(feeBps)) / BigInt("10000");
      // todo : royaltiesBuyAmount = get royalties fron nft contract
      const royaltiesBuyAmount = BigInt("0");
      const listerBuyAmount =
        BigInt(buyoutPricePerToken) - royaltiesBuyAmount - protocolFeeBuyAmount;

      listing = {
        ...listing,
        bidPriceStructure: {
          protocolFeeBps: BigInt(feeBps).toString(),
          minimalBidBps: BigInt(minimalBidBps).toString(),
          previousBidAmountBps: BigInt(previousBidAmountBps).toString(),
          ///

          minimalNextBidAmount: minimalNextBidAmount.toString(),
          previousBidFeeAmount: previousBidFeeAmount.toString(),
          listerBidAmount: listerBidAmount.toString(),
          royaltiesBidAmount: royaltiesBidAmount.toString(),
          protocolFeeBidAmount: protocolFeeBidAmount.toString(),
          totalMinimalBidAmount: totalMinimalBidAmount.toString(),
          ///
          marketplaceAddress: address
        },
        buyPriceStructure: {
          protocolFeeBps: BigInt(feeBps).toString(),
          ///
          listerBuyAmount: listerBuyAmount.toString(),
          royaltiesBuyAmount: royaltiesBuyAmount.toString(),
          protocolFeeBuyAmount: protocolFeeBuyAmount.toString(),
          totalBuyAmount: buyoutPricePerToken,
          ///
          marketplaceAddress: address
        }
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
      price = {
        ...price,
        mintPriceStructure: {
          protocolFeeBps: BigInt(feeBps).toString(),
          //
          creatorAmount: amount,
          protocolFeeAmount: protocolFeeAmount.toString(),
          totalAmount: totalAmount.toString(),
          minterAddress: address
        }
      };
    }
  }
  return price;
}

async function tokenMetadataReplace(offerMetadata, tokenMetadata, tokenData) {
  let res = null;
  if (
    tokenData &&
    tokenMetadata &&
    tokenMetadata.name &&
    tokenMetadata.description &&
    tokenMetadata.image
  ) {
    try {
      res = JSON.parse(JSON.stringify(tokenMetadata).replace(/\{tokenData\}/g, tokenData));
    } catch (e) {
      console.error(`Error with token metadata ${tokenMetadata}`, e);
    }
    if (!res) {
      if (tokenMetadata) {
        res = tokenMetadata;
      }
    }
  }

  if (!res) {
    if (offerMetadata.name && offerMetadata.description && offerMetadata.image) {
      res = offerMetadata;
    }
  }

  if (!res) {
    res = {
      name: "Untitled token",
      description: "No description for this token",
      image: "https://via.placeholder.com/500x500?text=Unknown%20token"
    };
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
        current.marketplaceListing
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
          current.marketplaceListings[key]
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
