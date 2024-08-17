// import { executeCacheQuery, executeQuery } from "@/queries/subgraph";

import { executeCacheQuery } from "@/queries/subgraph";

export async function POST(request, context) {
  /*
  const { query, variables, options } = await request.json();
  const { chainId } = context.params;
  const graphResult = options?.cacheTags
    ? await executeCacheQuery(chainId, query, variables, options)
    : await executeQuery(chainId, query, variables, options);

  if (!graphResult) {
    return new Response("Error executing query", {
      status: 500
    });
  }
*/
  const graphResult = { request, context, postnow: Date.now() };
  return new Response(JSON.stringify(graphResult, null, 4), {
    headers: {
      "content-type": "application/json"
    }
  });
}

// export const fetchCache = "default-cache";

export async function GET(request, context) {
  const graphResult = {
    request,
    context,
    getnow: await executeCacheQuery("8453", "query { getnow }", {})
  };
  return new Response(JSON.stringify(graphResult, null, 4), {
    headers: {
      "content-type": "application/json"
    }
  });
}
