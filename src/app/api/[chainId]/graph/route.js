import { executeCacheQuery, executeQuery } from "@/queries/subgraph";

export async function POST(request, context) {
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

  return new Response(JSON.stringify(graphResult, null, 4), {
    headers: {
      "content-type": "application/json"
    }
  });
}

// export const fetchCache = "default-cache";

/*
export async function GET(request, context) {
  const { chainId } = context.params;
  const requestUrl = new URL(`${request.url}`);
  const query = requestUrl.searchParams.get("query");
  const variables = JSON.parse(requestUrl.searchParams.get("variables")) || {};
  const options = JSON.parse(requestUrl.searchParams.get("options")) || {};

  const graphResult = await executeQuery(chainId, query, variables, options);

  if (!graphResult) {
    return new Response("Error executing query", {
      status: 500
    });
  }

  return new Response(JSON.stringify(graphResult, null, 4), {
    headers: {
      "content-type": "application/json"
    }
  });
}
*/
