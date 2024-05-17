export async function populateAdOffers(queryResult) {
  // memoïze metadata per offerId
  const offerMetadata = {};

  async function populateAdOffer(adOffer) {
    const { id, metadataURL, nftContract } = adOffer;

    if (id) {
      if (offerMetadata[id]) {
        adOffer.metadata = offerMetadata[id];
      } else {
        if (metadataURL) {
          try {
            const metadataRequest = await fetch(metadataURL, {
              headers: {
                "content-type": "application/json"
              }
            });
            adOffer.metadata = await metadataRequest.json();

            if (nftContract?.tokens?.length) {
              for (let i = 0; i < nftContract.tokens.length; i++) {
                const tokenData = nftContract.tokens[i].mint?.tokenData;
                const tokenMetadata = adOffer.metadata?.offer?.token_metadata;
                if (tokenData && tokenMetadata) {
                  try {
                    adOffer.nftContract.tokens[i].metadata = JSON.parse(
                      JSON.stringify(tokenMetadata).replace(/\{tokenData\}/g, tokenData)
                    );
                  } catch (e) {
                    console.error(`Error with token metadata ${tokenMetadata}`, e);
                  }
                }
              }
            }

            offerMetadata[id] = adOffer;
          } catch (e) {
            console.error(`Error fetching metadata for ${metadataURL}`);
          }
        }
      }
    }
  }

  // Helper function to check if a value is an object
  function isObject(value) {
    return value && typeof value === "object" && !Array.isArray(value);
  }

  // Recursive function to traverse the object
  async function traverse(current) {
    if (isObject(current.adOffer)) {
      await populateAdOffer(current.adOffer);
    }

    if (Array.isArray(current.adOffers)) {
      for (let key in current.adOffers) {
        await populateAdOffer(current.adOffers[key]);
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
        current[key].forEach(async (item) => {
          if (isObject(item)) {
            await traverse(item);
          }
        });
      }
    }
  }

  // Start traversing from the root object
  await traverse(queryResult);

  return queryResult;
}
