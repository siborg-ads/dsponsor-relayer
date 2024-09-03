import { NextResponse } from "next/server";
import { getAdDataForToken } from "@/queries/ads";
import { isValidUrl } from "@/utils";

export async function GET(request, context) {
  const { offerId, tokenId, chainId } = context.params;
  const requestUrl = new URL(`${request.url}`);
  const searchParams = requestUrl.searchParams;
  const adParameterId = searchParams.get("adParameterId");
  const ratio = searchParams.get("ratio");
  const defaultAdParameterKey =
    ratio?.length && /^\d+:\d+$/.test(ratio) ? `imageURL-${ratio}` : "imageURL";

  const imgUrl = await getAdDataForToken({
    chainId,
    adOfferId: offerId,
    tokenId,
    adParameterId,
    defaultAdParameterKey
  });

  try {
    if (isValidUrl(imgUrl)) {
      return NextResponse.redirect(imgUrl, 307);
    } else {
      return new Response("Invalid image URL", {
        status: 400
      });
    }
  } catch (e) {
    console.error("Error fetching image", imgUrl);
    return new Response("Error fetching image", {
      status: 500
    });
  }
}
