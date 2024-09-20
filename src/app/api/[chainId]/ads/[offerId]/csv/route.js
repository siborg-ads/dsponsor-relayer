import { getValidatedAds } from "@/queries/ads";
import config from "@/config";

export async function GET(request, context) {
  const { chainId, offerId } = context.params;

  const requestUrl = new URL(`${request.url}`);
  const searchParams = requestUrl.searchParams;
  const tokenIds = searchParams.get("tokenIds")?.length
    ? searchParams.get("tokenIds").split(",")
    : undefined;
  const tokenDatas = searchParams.get("tokenData")?.length
    ? searchParams.get("tokenData").split(",")
    : undefined;
  const adParameterIds = searchParams.get("adParameterIds")?.length
    ? searchParams.get("adParameterIds").split(",")
    : undefined;
  const includeAvailable = searchParams.get("includeAvailable") === "false" ? false : true;
  const includeReserved = searchParams.get("includeReserved") === "false" ? false : true;

  const response = await getValidatedAds({
    chainId,
    adOfferId: offerId,
    tokenIds,
    tokenDatas,
    adParameterIds,
    options: {
      populate: true
    }
  });
  const [imageKey, linkKey] = response._adParameterIds;

  const ads = response._tokenIds
    .map((tokenId) => {
      return {
        offerId,
        tokenId,
        records: {
          linkURL: response[tokenId][linkKey].data || null,
          imageURL: response[tokenId][imageKey].data || null
        }
      };
    })
    .filter((ad) => {
      const isReserved = response[ad.tokenId][imageKey].state === "UNAVAILABLE";
      const isAvailable =
        response[ad.tokenId][imageKey].state === "BUY_MINT" ||
        response[ad.tokenId][imageKey].state === "BUY_MARKET";

      return (
        ad.records.imageURL &&
        ad.records.linkURL &&
        (!isReserved || includeReserved) &&
        (!isAvailable || includeAvailable)
      );
    });

  const unitLink = (tokenId) =>
    `${config[chainId].relayerURL}/${chainId}/integrations/${offerId}/${tokenId}`;
  const imgLink = (tokenId) =>
    `${unitLink(tokenId)}/image?adParameterId=${imageKey}&includeAvailable=${includeAvailable}&includeReserved=${includeReserved}`;

  let csv = "url\n";
  for (const { tokenId } of ads) {
    csv += `[![img](${imgLink(tokenId)})](${unitLink(tokenId)}/link)\n`;
  }

  return new Response(csv, {
    headers: {
      "content-type": "text/csv"
    }
  });
}
