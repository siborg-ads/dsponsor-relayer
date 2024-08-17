import { unstable_cache as cache } from "next/cache";
import config from "@/config";
import { populateSubgraphResult } from "@/queries/populate";
import fragments from "@/queries/fragments";

/*
export async function executeQuery(chainId, query, variables, options) {
  return options?.cacheTags?.length && options?.cacheTags !== "no-store"
    ? cache(
        async (chainId, query, variables, options) => {
          return _executeQuery(chainId, query, variables, options);
        },
        ["graph"],
        {
          tags: options.cacheTags.map((cacheTag) => `${chainId}-${cacheTag}`)
        }
      )(chainId, query, variables, options)
    : _executeQuery(chainId, query, variables, options);
}
*/

export const executeCacheQuery = cache(executeQuery, ["graph"], { tags: ["graph"] });

export async function executeQuery(chainId, query, variables, options) {
  const url = config ? config[chainId]?.subgraphURL : null;

  if (!url) {
    return null;
  }

  query = /* GraphQL */ `
    ${fragments.join("\n")}
    ${query}
  `;

  const requestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
      //  "Authorization": "Bearer " + process.env.SUBGRAPH_API_KEY
    },
    body: JSON.stringify({ query, variables })
  };

  /*
  if (options?.cacheTags) {
    console.log("cacheTags", options.cacheTags);
    requestInit.next = { tags: options.cacheTags };
  } else {
    requestInit.cache = options?.cache ? options.cache : "no-store";
  }
  */

  /*
  console.time("executeQuery");
  const request = await fetch(url, requestInit);
  console.timeEnd("executeQuery");
  const result = await request.json();

  const populate = typeof options?.populate === "undefined" ? true : options.populate;
  if (populate && result?.data) {
    await populateSubgraphResult(chainId, result);
  }


  return result;
*/

  return { now: Date.now() };
}
