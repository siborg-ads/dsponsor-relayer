"use server";
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
  ratio = ratio?.length && /^\d+:\d+$/.test(ratio) ? ratio : "5:1";

  let ad;

  if (previewImage && previewLink) {
    ad = {
      offerId,
      records: {
        linkURL: previewLink,
        imageURL: previewImage
      }
    };
  } else {
    const { randomAd, _adParameterIds } =
      (await getRandomAdData({
        chainId,
        adOfferId: offerId,
        tokenIds: tokenIds?.split(","),
        adParameterIds: [`imageURL-${ratio}`, "linkURL"]
      })) || {};

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
  }

  if (!ad) {
    return <div></div>;
  }

  return (
    <html>
      <head />
      <body style={{ backgroundColor: bgColor ? `#${bgColor}` : "#0d102d" }}>
        <AdsGrid
          ads={[ad]}
          chainId={chainId}
          colSizes={colSizes?.length ? colSizes.split(",") : undefined}
          ratio={ratio}
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
