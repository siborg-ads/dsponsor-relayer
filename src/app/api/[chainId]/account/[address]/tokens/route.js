import { getHoldings } from "@/queries/activity";
import { getOfferTokensFromNftContracts } from "@/queries/offers";

export async function GET(request, context) {
  const { chainId, address } = context.params;

  if (!chainId) {
    return new Response("No chainId provided", {
      status: 400
    });
  }

  if (!address || address.length !== 42 || !address.startsWith("0x")) {
    return new Response("Invalid address provided", {
      status: 400
    });
  }

  const { nftContracts, tokenIds } = await getHoldings(chainId, address);

  const result = await getOfferTokensFromNftContracts(chainId, nftContracts, tokenIds);

  if (!result) {
    return new Response("Invalid result", {
      status: 401
    });
  }

  return new Response(JSON.stringify(result, null, 4), {
    headers: {
      "content-type": "application/json"
    }
  });
}
