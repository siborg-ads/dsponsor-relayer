import { NextResponse } from "next/server";
import { getRandomAdData } from "@/queries/ads";
import { isValidUrl } from "@/utils";

export async function GET(request, context) {
  const { offerId, chainId } = context.params;
  const requestUrl = new URL(`${request.url}`);
  const searchParams = requestUrl.searchParams;
  const tokenIds = searchParams.get("tokenIds");
  let ratio = searchParams.get("ratio");
  ratio = ratio?.length && /^\d+:\d+$/.test(ratio) ? ratio : "1:1";

  let imgUrl, blob;

  const { randomAd, _adParameterIds } =
    (await getRandomAdData({
      chainId,
      adOfferId: offerId,
      tokenIds: tokenIds?.split(","),
      adParameterIds: [`imageURL-${ratio}`]
    })) || {};

  if (randomAd) {
    const [imageKey] = _adParameterIds;
    imgUrl = randomAd[imageKey].data;
  }

  try {
    if (isValidUrl(imgUrl)) {
      const res = await fetch(imgUrl);
      blob = await res.blob();

      const headers = new Headers();
      headers.set("Content-Type", "image/*");
      return new NextResponse(blob, { status: 200, statusText: "OK", headers });
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
