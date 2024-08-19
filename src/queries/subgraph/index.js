import { unstable_cache as cache } from "next/cache";
import config from "@/config";
import { populateSubgraphResult } from "@/queries/populate";
import fragments from "@/queries/fragments";

export async function executeQuery(chainId, query, variables, options) {
  return options?.next?.tags?.length
    ? cache(
        async (chainId, query, variables, options) => {
          return _executeQuery(chainId, query, variables, options);
        },
        ["graph"],
        {
          tags: options.next.tags
        }
      )(chainId, query, variables, options)
    : _executeQuery(chainId, query, variables, options);
}

async function _executeQuery(chainId, query, variables, options) {
  console.log("_executeQuery");
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

  if (options.next) {
    console.log("cacheTags", options.next);
    requestInit.next = options.next;
  } else {
    requestInit.cache = options?.cache ? options.cache : "no-store";
  }

  console.time("executeQuery");
  const request = await fetch(url, requestInit);
  console.timeEnd("executeQuery");
  const result = await request.json();

  const populate = typeof options?.populate === "undefined" ? true : options.populate;
  if (populate && result?.data) {
    await populateSubgraphResult(chainId, result);
  }

  return result;
}
