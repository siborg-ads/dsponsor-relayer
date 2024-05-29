import config from "@/config";
import { populateSubgraphResult } from "@/queries/populate";
import fragments from "@/queries/fragments";

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

  if (options?.next) {
    requestInit.next = options.next;
  }

  if (options?.cache) {
    requestInit.cache = options.cache;
  }

  const request = await fetch(url, requestInit);

  const result = await request.json();

  // if (options?.populate && result?.data) {
  await populateSubgraphResult(chainId, result);
  // }

  return result;
}
