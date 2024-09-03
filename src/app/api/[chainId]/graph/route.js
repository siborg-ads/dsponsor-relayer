import { executeQuery } from "@/queries/subgraph";

export async function POST(request, context) {
  const { query, variables, options } = await request.json();
  const { chainId } = context.params;
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

export const runtime = "edge";
