import { getValidatedAds } from "@/queries/ads";

export async function GET(request, context) {
  const { chainId, offerId } = context.params;
  const requestUrl = new URL(`${request.url}`);
  const searchParams = requestUrl.searchParams;
  const tokenData = searchParams.get("tokenData")
    ? searchParams.get("tokenData").split(",")
    : undefined;
  const tokenIds = searchParams.get("tokenIds")
    ? searchParams.get("tokenIds").split(",")
    : undefined;

  const result = await getValidatedAds(chainId, offerId, tokenIds, tokenData);

  if (!result) {
    return new Response("No offer found", {
      status: 401
    });
  }

  return new Response(JSON.stringify(Object.assign(result), null, 4), {
    headers: {
      "content-type": "application/json"
    }
  });
}
