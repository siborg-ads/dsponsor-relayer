import { NextResponse } from "next/server";
import { ImageResponse } from "@vercel/og";
import { getRandomAdData } from "@/queries/ads";
import { isValidUrl } from "@/utils";

export async function GET(request, context) {
  const { offerId, chainId } = context.params;
  const requestUrl = new URL(`${request.url}`);
  const searchParams = requestUrl.searchParams;
  const tokenIds = searchParams.get("tokenIds");
  const ratio = searchParams.get("ratio");
  let includeAvailable = searchParams.get("includeAvailable") === "false" ? false : true;
  let includeReserved = searchParams.get("includeReserved") === "false" ? false : true;

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

    const isReserved = randomAd[imageKey].state === "UNAVAILABLE";
    const isAvailable =
      randomAd[imageKey].state === "BUY_MINT" || randomAd[imageKey].state === "BUY_MARKET";

    if ((!isReserved || includeReserved) && (!isAvailable || includeAvailable)) {
      imgUrl = randomAd[imageKey].data;
    }
  }

  if (isValidUrl(imgUrl)) {
    return NextResponse.redirect(imgUrl, 302);
  } else {
    return new ImageResponse(<div></div>, { width: 1, height: 1, status: 302 });
  }
}
