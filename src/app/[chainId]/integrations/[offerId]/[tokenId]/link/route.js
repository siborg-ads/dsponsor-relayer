import { NextResponse } from "next/server";
import { getAdDataForToken } from "@/queries/ads";
import { isValidUrl } from "@/utils";

export async function GET(request, context) {
  const { offerId, tokenId, chainId } = (await context.params);
  const requestUrl = new URL(`${request.url}`);
  const searchParams = requestUrl.searchParams;
  const adParameterId = searchParams.get("adParameterId");
  const defaultAdParameterKey = "linkURL";

  const linkUrl = await getAdDataForToken({
    chainId,
    adOfferId: offerId,
    tokenId,
    adParameterId,
    defaultAdParameterKey
  });

  try {
    if (isValidUrl(linkUrl)) {
      return NextResponse.redirect(linkUrl, 302);
    } else {
      return new Response("Invalid link URL", {
        status: 400
      });
    }
  } catch (e) {
    console.error("Error fetching link", linkUrl);
    return new Response("Error fetching image", {
      status: 500
    });
  }
}
