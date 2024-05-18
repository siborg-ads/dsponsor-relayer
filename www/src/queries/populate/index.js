import { isObject } from "@/utils";

async function tokenMetadataReplace(tokenMetadata, tokenData) {
  let res = null;
  if (tokenData && tokenMetadata) {
    try {
      res = JSON.parse(JSON.stringify(tokenMetadata).replace(/\{tokenData\}/g, tokenData));
    } catch (e) {
      console.error(`Error with token metadata ${tokenMetadata}`, e);
    }
  }
  return res;
}

async function populateTokens(token) {
  const adOffer = token?.nftContract?.adOffers?.length ? token.nftContract.adOffers[0] : null;

  if (adOffer) {
    await populateAdOffer(token.nftContract.adOffers[0]);

    const tokenData = token?.mint?.tokenData;
    const tokenMetadata = token.nftContract.adOffers[0]?.metadata?.offer?.token_metadata;

    token.metadata = await tokenMetadataReplace(tokenMetadata, tokenData);
  }
}

async function populateAdOffer(adOffer) {
  const { id, metadataURL, nftContract } = adOffer;

  if (id) {
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
            const tokenData = nftContract.tokens[i].mint?.tokenData;
            const tokenMetadata = adOffer.metadata?.offer?.token_metadata;
            adOffer.nftContract.tokens[i].metadata = await tokenMetadataReplace(
              tokenMetadata,
              tokenData
            );
          }
        }
      } catch (e) {
        console.error(`Error fetching metadata for ${metadataURL}`);
      }
    }
  }
}

export async function populateSubgraphResult(queryResult) {
  // Recursive function to traverse the object
  async function traverse(current) {
    if (isObject(current.adOffer)) {
      await populateAdOffer(current.adOffer);
    }
    if (isObject(current.token)) {
      await populateTokens(current.token);
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
