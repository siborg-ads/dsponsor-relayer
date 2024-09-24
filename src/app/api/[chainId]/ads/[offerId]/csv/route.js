import { getRandomAdData } from "@/queries/ads";
import config from "@/config";

export async function GET(request, context) {
  const { chainId, offerId } = context.params;

  const requestUrl = new URL(`${request.url}`);
  const searchParams = requestUrl.searchParams;

  const type = searchParams.get("type") || "grid";

  const tokenIds = searchParams.get("tokenIds")?.length
    ? searchParams.get("tokenIds").split(",")
    : undefined;
  const tokenDatas = searchParams.get("tokenData")?.length
    ? searchParams.get("tokenData").split(",")
    : undefined;
  const adParameterIds = searchParams.get("adParameterIds")?.length
    ? searchParams.get("adParameterIds").split(",")
    : ["imageURL", "linkURL"];
  const includeAvailable = searchParams.get("includeAvailable") === "false" ? false : true;
  const includeReserved = searchParams.get("includeReserved") === "false" ? false : true;

  const unitLink = (tokenId) =>
    `${config[chainId].relayerURL}/${chainId}/integrations/${offerId}/${tokenId}`;
  const imgLink = (tokenId) => `${unitLink(tokenId)}/image?adParameterId=${imageKey}`;

  let csv = "url\n";

  const {
    // randomAd,
    _adParameterIds,
    _tokenIds,
    _randomTokenId,
    _validatedAds
  } = await getRandomAdData({
    chainId,
    adOfferId: offerId,
    tokenIds,
    tokenDatas,
    adParameterIds
    /*
    options: {
      populate: true
    }
      */
  });
  const [imageKey, linkKey] = _adParameterIds;

  if (type === "dynamic") {
    const state = _validatedAds?.[_randomTokenId]?.[imageKey]?.state || null;
    const isReserved = state === "UNAVAILABLE";
    const isAvailable = state === "BUY_MINT" || state === "BUY_MARKET";

    if ((!isReserved || includeReserved) && (!isAvailable || includeAvailable)) {
      csv += `[![img](${imgLink(_randomTokenId)})](${unitLink(_randomTokenId)}/link)\n`;
    }
  } else if (type === "grid") {
    const ads = _tokenIds
      .map((tokenId) => {
        return {
          offerId,
          tokenId,
          records: {
            linkURL: _validatedAds?.[tokenId]?.[linkKey]?.data || null,
            imageURL: _validatedAds?.[tokenId]?.[imageKey]?.data || null
          }
        };
      })
      .filter((ad) => {
        const state = _validatedAds?.[ad.tokenId]?.[imageKey]?.state || null;
        const isReserved = state === "UNAVAILABLE";
        const isAvailable = state === "BUY_MINT" || state === "BUY_MARKET";

        return (
          ad.records.imageURL &&
          ad.records.linkURL &&
          (!isReserved || includeReserved) &&
          (!isAvailable || includeAvailable)
        );
      });

    for (const { tokenId } of ads) {
      csv += `[![img](${imgLink(tokenId)})](${unitLink(tokenId)}/link)\n`;
    }
  }

  return new Response(csv, {
    headers: {
      "content-type": "text/csv"
    }
  });
}
