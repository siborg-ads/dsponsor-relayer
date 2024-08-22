import React from "react";
import AdsGrid from "@/components/AdsGrid";
import { getRandomAdData } from "@/queries/ads";

export async function generateMetadata() {
  return {
    title: "DSponsor iFrame - Dynamic Banner",
    description: "Unlock smarter monetization for your content.",
    keyword: "web3, nft, monetization, media, ads"
  };
}

export default async function DynamicBannerIframePage(req) {
  const { chainId, offerId } = req.params;
  const { bgColor, colSizes, previewImage, previewLink, tokenIds } = req.searchParams;
  let { ratio } = req.searchParams;
  const adParameterIds =
    ratio?.length && /^\d+:\d+$/.test(ratio)
      ? [`imageURL-${ratio}`, "linkURL"]
      : [`imageURL`, "linkURL"];

  let ad;
  let lastUpdate;

  if (previewImage && previewLink) {
    ad = {
      offerId,
      records: {
        linkURL: previewLink,
        imageURL: previewImage
      }
    };
    lastUpdate = new Date().toJSON();
  } else {
    const { randomAd, _adParameterIds, _validatedAds } =
      (await getRandomAdData({
        chainId,
        adOfferId: offerId,
        tokenIds: tokenIds?.split(","),
        adParameterIds
      })) || {};
    const { _lastUpdate } = _validatedAds || {};
    lastUpdate = _lastUpdate;

    if (randomAd) {
      const [imageKey, linkKey] = _adParameterIds;
      ad = {
        offerId,
        records: {
          imageURL: randomAd[imageKey].data,
          linkURL: randomAd[linkKey].data
        }
      };
    }

    const [imageKey] = _adParameterIds;

    const imageKeyParts = imageKey.split("-");
    ratio =
      ratio?.length && /^\d+:\d+$/.test(ratio)
        ? ratio
        : imageKeyParts.length === 2
          ? imageKeyParts[1]
          : ratio;
  }

  if (!ad) {
    return <div></div>;
  }

  return (
    <html>
      <head />
      <body style={{ backgroundColor: bgColor ? `#${bgColor}` : "#fff" }}>
        <AdsGrid
          ads={[ad]}
          chainId={chainId}
          colSizes={colSizes?.length ? colSizes.split(",") : undefined}
          ratio={ratio}
          lastUpdate={lastUpdate}
        />
      </body>
    </html>
  );
}

DynamicBannerIframePage.getLayout = function getLayout(page) {
  return (
    <html>
      <head />
      <body className="bg-gray-800">{page}</body>
    </html>
  );
};
