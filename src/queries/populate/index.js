import config from "@/config";
import {
  computeBidAmounts,
  getCurrencyInfos,
  getMinimalBidPerToken,
  isObject,
  isValidUrl,
  priceFormattedForAllValuesObject,
  priceUsdcForAllValuesObject
} from "@/utils";

async function populateMarketplaceListing(chainId, listing, nftContract) {
  if (listing) {
    const {
      address,
      feeBps: protocolFeeBps,
      minimalBidBps,
      previousBidAmountBps
    } = config[chainId].smartContracts.DSPONSOR_MARKETPLACE || {};
    let { reservePricePerToken, buyoutPricePerToken, bids, token } = listing || {};

    const validPopulatedBids =
      bids &&
      ((bids[0] && bids[0].creationTimestamp && bids[0].totalBidAmount) || bids.length == 0);
    if (validPopulatedBids) {
      bids = bids.sort((a, b) => Number(b.creationTimestamp) - Number(a.creationTimestamp));
    }

    nftContract = token?.nftContract?.royalty ? token.nftContract : nftContract;

    const { royalty } = nftContract || {};
    let { bps: royaltyBps } = royalty || {};

    let { quantity, currency } = listing;
    if (!quantity && bids && bids[0]) quantity = bids[0].quantity;
    if (!currency && bids && bids[0]) currency = bids[0].currency;

    const { decimals, symbol, priceUSDC, priceUSDCFormatted } = currency
      ? (await getCurrencyInfos(chainId, currency)) || {}
      : {};

    listing = {
      ...listing,
      currencySymbol: symbol,
      currencyDecimals: decimals ? decimals.toString() : undefined,
      currencyPriceUSDC: priceUSDC,
      currencyPriceUSDCFormatted: priceUSDCFormatted,
      marketplaceAddress: address,
      protocolFeeBps: BigInt(protocolFeeBps).toString(),
      minimalBidBps: BigInt(minimalBidBps).toString(),
      previousBidAmountBps: BigInt(previousBidAmountBps).toString()
    };

    if (decimals) {
      listing.bids = listing.bids.map((b) => {
        const { totalBidAmount, paidBidAmount, refundBonus, refundAmount, refundProfit } = b;
        b.amountsFormatted = priceFormattedForAllValuesObject(decimals, {
          totalBidAmount,
          paidBidAmount,
          refundBonus,
          refundAmount,
          refundProfit
        });
        return b;
      });
    }

    if (
      minimalBidBps &&
      reservePricePerToken &&
      buyoutPricePerToken &&
      validPopulatedBids &&
      currency &&
      royaltyBps &&
      quantity &&
      quantity != "0"
    ) {
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
        buyoutPricePerToken,
        listerBuyAmount: listerBuyAmount.toString(),
        royaltiesBuyAmount: royaltiesBuyAmount.toString(),
        protocolFeeBuyAmount: protocolFeeBuyAmount.toString()
      };

      const buyPriceStructureFormatted = priceFormattedForAllValuesObject(
        decimals,
        buyPriceStructure
      );
      const bidPriceStructureFormatted = priceFormattedForAllValuesObject(
        decimals,
        bidPriceStructure
      );

      const bidPriceStructureUsdc = await priceUsdcForAllValuesObject(
        chainId,
        bidPriceStructure,
        currency
      );
      const bidPriceStructureUsdcFormatted = priceFormattedForAllValuesObject(
        6,
        bidPriceStructureUsdc
      );

      const buyPriceStructureUsdc = await priceUsdcForAllValuesObject(
        chainId,
        buyPriceStructure,
        currency
      );

      const buyPriceStructureUsdcFormatted = priceFormattedForAllValuesObject(
        6,
        buyPriceStructureUsdc
      );

      listing = {
        ...listing,
        bidPriceStructure,
        bidPriceStructureFormatted,
        bidPriceStructureUsdc,
        bidPriceStructureUsdcFormatted,
        buyPriceStructure,
        buyPriceStructureUsdc,
        buyPriceStructureFormatted,
        buyPriceStructureUsdcFormatted
      };
    }
  }
  return listing;
}

async function populateMint(chainId, mint) {
  if (mint) {
    const { currency, totalPaid } = mint || {};

    if (totalPaid && currency) {
      const { decimals, symbol, priceUSDC, priceUSDCFormatted } =
        (await getCurrencyInfos(chainId, currency)) || {};

      const mintTotalPaidFormatted = priceFormattedForAllValuesObject(decimals, { totalPaid });

      const mintTotalPaidUsdc = await priceUsdcForAllValuesObject(chainId, { totalPaid }, currency);

      const mintTotalPaidUsdcFormatted = priceFormattedForAllValuesObject(6, mintTotalPaidUsdc);

      mint = {
        ...mint,
        currencySymbol: symbol,
        currencyDecimals: decimals.toString(),
        currencyPriceUSDC: priceUSDC,
        currencyPriceUSDCFormatted: priceUSDCFormatted,
        mintTotalPaidFormatted,
        mintTotalPaidUsdc,
        mintTotalPaidUsdcFormatted
      };
    }
  }
  return mint;
}

async function populateMintPrice(chainId, price) {
  if (price) {
    const { currency, amount } = price || {};
    const { address, feeBps } = config[chainId].smartContracts.DSPONSOR_ADMIN || {};
    if (amount && currency && feeBps) {
      const protocolFeeAmount = (BigInt(amount) * BigInt(feeBps)) / BigInt(10000);
      const totalAmount = BigInt(amount) + protocolFeeAmount;

      const mintPriceStructure = {
        //
        creatorAmount: amount,
        protocolFeeAmount: protocolFeeAmount.toString(),
        totalAmount: totalAmount.toString()
      };

      const { decimals, symbol, priceUSDC, priceUSDCFormatted } =
        (await getCurrencyInfos(chainId, currency)) || {};

      const mintPriceStructureFormatted = priceFormattedForAllValuesObject(
        decimals,
        mintPriceStructure
      );

      const mintPriceStructureUsdc = await priceUsdcForAllValuesObject(
        chainId,
        mintPriceStructure,
        currency
      );

      const mintPriceStructureUsdcFormatted = priceFormattedForAllValuesObject(
        6,
        mintPriceStructureUsdc
      );

      price = {
        ...price,
        currencySymbol: symbol,
        currencyDecimals: decimals.toString(),
        currencyPriceUSDC: priceUSDC,
        currencyPriceUSDCFormatted: priceUSDCFormatted,
        minterAddress: address,
        protocolFeeBps: BigInt(feeBps).toString(),
        mintPriceStructure,
        mintPriceStructureFormatted,
        mintPriceStructureUsdc,
        mintPriceStructureUsdcFormatted
      };
    }
  }
  return price;
}

function tokenMetadataReplace(offerMetadata, tokenMetadata, tokenData, tokenId) {
  const res = {
    name: "Untitled token",
    description: "No description for this token",
    image: "https://via.placeholder.com/500x500?text=Unknown%20token"
  };

  if (typeof offerMetadata === "object" && offerMetadata !== null) {
    Object.assign(res, offerMetadata);
  }

  if (tokenId && typeof tokenMetadata === "object") {
    try {
      tokenMetadata = JSON.parse(JSON.stringify(tokenMetadata).replace(/\{tokenId\}/g, tokenId));

      Object.assign(res, tokenMetadata);
    } catch (e) {
      console.error(`Error with token metadata ${tokenMetadata}`);
    }
  }

  if (tokenData && typeof tokenMetadata === "object") {
    try {
      tokenMetadata = JSON.parse(
        JSON.stringify(tokenMetadata).replace(/\{tokenData\}/g, tokenData)
      );

      Object.assign(res, tokenMetadata);
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
    const tokenId = token?.tokenId;

    token.metadata = tokenMetadataReplace(offerMetadata, tokenMetadata, tokenData, tokenId);
  }
}

async function populateAdOffer(adOffer) {
  const { metadataURL, nftContract, metadata } = adOffer;

  const initialMetadata = metadata ? metadata : {};

  if (metadata?.content?.length) {
    try {
      const cleanedContent = metadata.content.replace(/\n/g, "\\n");

      const metadataContent = JSON.parse(cleanedContent);
      adOffer.metadata = Object.assign({}, initialMetadata, metadataContent);
    } catch (e) {
      console.error(`Error parsing metadata for ${metadata.content}`, e);
    }
  } else if (isValidUrl(metadataURL)) {
    try {
      const metadataRequest = await fetch(metadataURL, {
        headers: {
          "content-type": "application/json"
        },
        next: { tags: [`metadataURL-${metadataURL}`] },
        cache: "force-cache"
      });
      const metadataContent = await metadataRequest.json();
      adOffer.metadata = Object.assign({}, initialMetadata, metadataContent);
    } catch (e) {
      console.error(`Error fetching metadata for ${metadataURL}`, e);
    }
  }

  if (nftContract?.tokens?.length) {
    for (let i = 0; i < nftContract.tokens.length; i++) {
      const offerMetadata = adOffer.metadata?.offer;
      const tokenMetadata = adOffer.metadata?.offer?.token_metadata;
      const tokenData = nftContract.tokens[i].mint?.tokenData;
      const tokenId = nftContract.tokens[i]?.tokenId;
      adOffer.nftContract.tokens[i].metadata = tokenMetadataReplace(
        offerMetadata,
        tokenMetadata,
        tokenData,
        tokenId
      );
    }
  }
}

function populateCurrentProposal(currentProposal) {
  if (currentProposal) {
    const { adParameter, acceptedProposal, pendingProposal, rejectedProposal } = currentProposal;
    if (adParameter?.id && adParameter.id.includes("linkURL")) {
      if (acceptedProposal && acceptedProposal.data.startsWith("http") === false) {
        currentProposal.acceptedProposal.data = `https://${acceptedProposal.data}`;
      }
      if (pendingProposal && pendingProposal.data.startsWith("http") === false) {
        currentProposal.pendingProposal.data = `https://${pendingProposal.data}`;
      }
      if (rejectedProposal && rejectedProposal.data.startsWith("http") === false) {
        currentProposal.rejectedProposal.data = `https://${rejectedProposal.data}`;
      }
    }
  }
}

function populateAllProposals(allProposals) {
  if (allProposals && allProposals.length) {
    for (let i = 0; i < allProposals.length; i++) {
      const { adParameter, data } = allProposals[i];
      if (adParameter?.id && adParameter.id.includes("linkURL")) {
        if (data && data.startsWith("http") === false) {
          allProposals[i].data = `https://${data}`;
        }
      }
    }
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

    if (isObject(current.mint)) {
      current.mint = await populateMint(chainId, current.mint);
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
    if (Array.isArray(current.currentProposals)) {
      for (let i = 0; i < current.currentProposals.length; i++) {
        populateCurrentProposal(current.currentProposals[i]);
      }
    }
    if (Array.isArray(current.allProposals)) {
      populateAllProposals(current.allProposals);
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
