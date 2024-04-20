import {DSponsorSDK} from "@dsponsor/sdk";
import queryBuilder from "./queryBuilder";
import {cacheExchange, createClient, fetchExchange} from "urql";

export async function GET(
    request,
    context,
) {
    const {
        chainId,
    } = context.params

    let sdk;
    let error;
    if (!chainId) {
        error = new Error("No chainId provided")
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
    const queryParams = {}
    let withMetadata = false;
    if (!error) {
        try {
            const url = sdk.chain.graphApiUrl;
            const requestUrl = new URL(`${request.url}`);

            const searchParams = requestUrl.searchParams;


            // Special query not for the graph
            if(searchParams.get("withMetadata")) {
                withMetadata = true;
            }

            if(searchParams.get("limit")) {
                queryParams.limit = searchParams.get("limit")
            }
            if(searchParams.get("orderBy")) {
                queryParams.orderBy = searchParams.get("orderBy")
            }
            if(searchParams.get("orderDirection")) {
                queryParams.orderDirection = searchParams.get("orderDirection")
            }
            if(searchParams.get("where")) {
                queryParams.where = searchParams.get("where")
            }
            if(searchParams.get("skip")) {
                queryParams.skip = searchParams.get("skip")
            }
            if(searchParams.get("block")) {
                queryParams.block = searchParams.get("block")
            }

            const computedQuery = queryBuilder(queryParams)

            const startRequest = new Date().getTime();
            const client = createClient({
                url,
                exchanges: [cacheExchange, fetchExchange]
            })
            const queryRequest = await client.query(computedQuery).toPromise()
            endRequest = new Date().getTime();
            data = queryRequest.data;
        } catch (e) {
            error = e;
        }
    }

    if(error) {
        console.trace("GET /api/graph/[chainId]", {
            error,
            endRequest,
            queryParams,
        });
    }

    if(withMetadata){
        const promises = data?.adOffers?.map(async (offer) => {
            const metadataRequest = await fetch(offer.metadataURL, {
                headers: {
                    "content-type": "application/json",
                },
                cache: "force-cache",
            });
            const metadata = await metadataRequest.json();
            offer.metadata = metadata;
        });

        await Promise.all(promises);
    }


    return new Response(JSON.stringify({
        ...data,
        error: error?.message,
    }, null, 4), {
        headers: {
            "content-type": "application/json",
        },
    });
}
