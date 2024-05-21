import config from "@/config";
import { getEthQuote } from "@/queries/uniswap/quote";

export async function GET(request, context) {
  const { chainId } = context.params;

  const requestUrl = new URL(`${request.url}`);
  const searchParams = requestUrl.searchParams;
  const token = searchParams.get("token");
  const amount = searchParams.get("amount");
  const slippage = searchParams.get("slippage");

  const tokenOutAddr = token ? token : config?.[chainId]?.smartContracts?.USDC?.address;
  const amountOut = amount ? amount : "1000000";
  const slippagePerCent = slippage && Number(slippage) > 0.01 ? Number(slippage) : 0.3;

  const result = await getEthQuote(chainId, tokenOutAddr, amountOut, slippagePerCent);

  if (!result) {
    return new Response("Invalid info provided", {
      status: 401
    });
  }

  return new Response(JSON.stringify(Object.assign(result, null, 4)), {
    headers: {
      "content-type": "application/json"
    }
  });
}
