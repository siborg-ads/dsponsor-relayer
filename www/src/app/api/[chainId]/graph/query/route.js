import { DSponsorSDK } from "@dsponsor/sdk";
import queryBuilder from "./queryBuilder";
import { cacheExchange, createClient, fetchExchange } from "urql";

export async function GET(request, context) {
  const { chainId } = context.params;

  let sdk;
  let error;
  if (!chainId) {
    error = new Error("No chainId provided");
  }
  try {
    sdk = new DSponsorSDK({
      chain: {
        chainId
      }
    });
  } catch (e) {
    error = e;
  }

  let data;
  let endRequest;
  const queryParams = {};
  let withMetadata = false;
  if (!error) {
    try {
      const url = sdk.chain.graphApiUrl;
      const requestUrl = new URL(`${request.url}`);

      const searchParams = requestUrl.searchParams;

      // Special query not for the graph
      if (searchParams.get("withMetadata")) {
        withMetadata = true;
      }

      queryParams.method = "adOffers";

      if (searchParams.get("method")) {
        queryParams.method = searchParams.get("method");
      }

      const validQueryParams = [];
      switch (queryParams.method) {
        case "raw":
          validQueryParams.push("query");
          break;
        case "adOffers":
        case "adProposals":
        case "adParameters":
          validQueryParams.push("orderBy");
          validQueryParams.push("orderDirection");
          validQueryParams.push("where");
          validQueryParams.push("first");
          validQueryParams.push("skip");
          validQueryParams.push("block");
          break;
        default:
          error = `Invalid method ${queryParams.method}`;
          break;
      }

      validQueryParams.forEach((param) => {
        // Special query for the graph
        // e.g. ?where=...
        if (searchParams.get(param)) {
          queryParams[param] = searchParams.get(param);
        }
      });

      if (error === undefined) {
        let computedQuery;
        if (queryParams.method === "raw") {
          computedQuery = searchParams.get("query");
        } else {
          computedQuery = queryBuilder(queryParams, searchParams.get("response"));
        }

        const client = createClient({
          url,
          exchanges: [cacheExchange, fetchExchange]
        });

        console.log({ computedQuery });

        const queryRequest = await client.query(computedQuery).toPromise();

        console.log("OKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK");
        endRequest = new Date().getTime();
        data = queryRequest.data;
      }
    } catch (e) {
      error = e;
    }
  }

  if (error) {
    console.trace("GET /api/[chainId]/graph/query", {
      error,
      endRequest,
      queryParams
    });
  }

  if (withMetadata && error === undefined && data?.adOffers) {
    // Only for adOffers and if requested
    const promises = data?.adOffers?.map(async (offer) => {
      try {
        // http or https
        if (!offer.metadataURL || !offer.metadataURL.match(/^http(s)?:\/\//)) {
          return;
        }
        const metadataRequest = await fetch(offer.metadataURL, {
          headers: {
            "content-type": "application/json"
          },
          cache: "no-cache"
        });
        const metadata = await metadataRequest.json();
        offer.metadata = metadata;
      } catch (e) {
        console.log(offer);
        console.error(`Error fetching metadata for ${offer.metadataURL}`, e);
      }
    });
    await Promise.all(promises);
  }

  return new Response(
    JSON.stringify(
      {
        ...data,
        error: error?.message
      },
      null,
      4
    ),
    {
      headers: {
        "content-type": "application/json"
      }
    }
  );
}
