import config from "@/config";
import { populateAdOffers } from "@/queries/populate";

export async function executeQuery(chainId, query, variables, options) {
  const url = config ? config[chainId]?.subgraphURL : null;

  if (!url) {
    return null;
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
  }

  const request = await fetch(url, requestInit);

  const result = await request.json();

  // if (options?.populate && result?.data) {
  await populateAdOffers(result);
  //  }

  return result;
}
