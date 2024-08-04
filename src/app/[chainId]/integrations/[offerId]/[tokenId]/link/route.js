import { NextResponse } from "next/server";
import { getAdDataForToken } from "@/queries/ads";
import { isValidUrl } from "@/utils";

export async function GET(request, context) {
  const { offerId, tokenId, chainId } = context.params;
  const requestUrl = new URL(`${request.url}`);
  const searchParams = requestUrl.searchParams;
  const adParameterId = searchParams.get("adParameterId");
  const defaultAdParameterKey = "linkURL";

  const linkUrl = await getAdDataForToken({
    chainId,
    adOfferId: offerId,
    tokenId,
    adParameterId,
    defaultAdParameterKey,
    options: {
      populate: false,
      next: { revalidate: 15 * 60 } // 15 minutes
    }
  });

  try {
    if (isValidUrl(linkUrl)) {
      return NextResponse.redirect(linkUrl, 307);
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

export const dynamic = "force-dynamic";
