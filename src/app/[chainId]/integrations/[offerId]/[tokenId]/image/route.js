import { NextResponse } from "next/server";
import { ImageResponse } from "@vercel/og";
import { getValidatedAds } from "@/queries/ads";
import { isValidUrl } from "@/utils";

export async function GET(request, context) {
  const { offerId, tokenId, chainId } = context.params;
  const requestUrl = new URL(`${request.url}`);
  const searchParams = requestUrl.searchParams;
  const adParameterId = searchParams.get("adParameterId");
  let includeAvailable = searchParams.get("includeAvailable") === "false" ? false : true;
  let includeReserved = searchParams.get("includeReserved") === "false" ? false : true;
  const ratio = searchParams.get("ratio");
  const defaultAdParameterKey =
    ratio?.length && /^\d+:\d+$/.test(ratio) ? `imageURL-${ratio}` : "imageURL";

  let adParameterKey = adParameterId ? adParameterId : defaultAdParameterKey;

  let imgUrl;
  let displayImage = false;

  const result = await getValidatedAds({
    chainId,
    adOfferId: offerId,
    // tokenIds: [tokenId],
    adParameterIds: [adParameterKey]
  });

  const { _adParameterIds } = result || {};

  if (_adParameterIds?.length) {
    adParameterKey = _adParameterIds[0];

    if (result?.[tokenId]?.[adParameterKey]) {
      const { state, data } = result[tokenId][adParameterKey] || {};
      const isReserved = state === "UNAVAILABLE";
      const isAvailable = state === "BUY_MINT" || state === "BUY_MARKET";

      imgUrl = data;

      displayImage =
        imgUrl &&
        isValidUrl(imgUrl) &&
        (!isReserved || includeReserved) &&
        (!isAvailable || includeAvailable);
    }
  }

  if (displayImage) {
    return NextResponse.redirect(imgUrl, 302);
  } else {
    return new ImageResponse(<div></div>, { width: 1, height: 1, status: 302 });
  }
}
