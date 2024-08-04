import { NextResponse } from "next/server";
import { getRandomAdData } from "@/queries/ads";
import { isValidUrl } from "@/utils";

export async function GET(request, context) {
  const { offerId, chainId } = context.params;
  const requestUrl = new URL(`${request.url}`);
  const searchParams = requestUrl.searchParams;
  const tokenIds = searchParams.get("tokenIds");
  const ratio = searchParams.get("ratio");

  const adParameterIds =
    ratio?.length && /^\d+:\d+$/.test(ratio) ? [`imageURL-${ratio}`] : ["imageURL"];

  let imgUrl;

  const { randomAd, _adParameterIds } =
    (await getRandomAdData({
      chainId,
      adOfferId: offerId,
      tokenIds: tokenIds?.split(","),
      adParameterIds
    })) || {};

  if (randomAd) {
    const [imageKey] = _adParameterIds;
    imgUrl = randomAd[imageKey].data;
  }

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

export const dynamic = "force-dynamic";
