import { getValidatedAds } from "@/queries/ads";
import { stringToUint256 } from "@/queries/tokens";

export async function GET(request, context) {
  const { chainId, offerId } = context.params;
  const requestUrl = new URL(`${request.url}`);
  const searchParams = requestUrl.searchParams;
  const tokenData = searchParams.get("tokenData");
  const tokenIds = searchParams.get("tokenIds");

  const _tokenIds = tokenIds
    ? tokenIds.split(",")
    : tokenData
      ? tokenData.split(",").map((t) => stringToUint256(t))
      : undefined;

  const result = await getValidatedAds(chainId, offerId, _tokenIds);

  if (!result) {
    return new Response("No offer found", {
      status: 401
    });
  }

  return new Response(JSON.stringify(Object.assign(result, { _tokenIds }), null, 4), {
    headers: {
      "content-type": "application/json"
    }
  });
}
