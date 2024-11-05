// import { memoize } from "nextjs-better-unstable-cache";
import config from "@/config";
import { populateSubgraphResult } from "@/queries/populate";
import fragments from "@/queries/fragments";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

/*
export async function executeQuery(chainId, query, variables, options) {
  return options?.next?.tags?.length
    ? memoize(_executeQuery, {
        revalidateTags: (chainId, query, variables, options) => options.next.tags,
        log: process.env.NEXT_CACHE_LOGS ? process.env.NEXT_CACHE_LOGS.split(",") : []
      })(chainId, query, variables, options)
    : _executeQuery(chainId, query, variables, options);
}
*/

export async function executeQuery(chainId, query, variables, options) {
  const url = config ? config[chainId]?.subgraphURL : null;

  if (!url) {
    return null;
  }

  query = /* GraphQL */ `
    ${fragments.join("\n")}
    ${query}
  `;

  // Find the closing curly brace of the query and insert the _meta block before it
  const lastCurlyBraceIndex = query.lastIndexOf("}");
  // Define the _meta block with timestamp

  const metaBlock = `
    _meta {
        block {
          timestamp
        }
    }
  `;

  if (query.includes("query IntrospectionQuery") === false && lastCurlyBraceIndex !== -1) {
    query = query.slice(0, lastCurlyBraceIndex) + metaBlock + query.slice(lastCurlyBraceIndex);
  }

  const requestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
      //  "Authorization": "Bearer " + process.env.SUBGRAPH_API_KEY
    },
    body: JSON.stringify({ query, variables })
  };

  if (options?.next) {
    requestInit.next = options.next;
    if (
      options?.next?.tags?.length ||
      (options?.next?.revalidate && options?.next?.revalidate > 0)
    ) {
      requestInit.cache = "force-cache";
      if (options?.cache) {
        requestInit.cache = options.cache;
      }
    }
  } else {
    requestInit.cache = options?.cache ? options.cache : "no-store";
  }

  // requestInit.cache = "no-store";

  console.time("requestInit");
  const request = await fetch(url, requestInit);
  const result = await request.json();
  console.timeEnd("requestInit");

  console.time("populate");
  const populate = typeof options?.populate === "undefined" ? true : options.populate;
  if (populate && result?.data) {
    await populateSubgraphResult(chainId, result);
  }
  console.timeEnd("populate");

  return result;
}
