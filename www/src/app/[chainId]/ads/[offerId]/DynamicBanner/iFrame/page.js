"use server";
import React from "react";
import AdsGrid from "@/components/AdsGrid";
import { getRandomImageLinkToDisplay } from "@/queries/ads";

export async function generateMetadata() {
  return {
    title: "DSponsor iFrame - Dynamic Banner",
    description: "Unlock smarter monetization for your content.",
    keyword: "web3, nft, monetization, media, ads"
  };
}

export default async function DynamicBannerIframePage(req) {
  const { chainId, offerId } = req.params;
  const { bgColor, colSizes, ratio, previewImage, previewLink, tokenIds } = req.searchParams;
  let ad =
    previewImage && previewLink
      ? {
          offerId,
          records: {
            linkURL: previewLink,
            imageURL: previewImage
          }
        }
      : await getRandomImageLinkToDisplay(ratio, chainId, offerId, tokenIds);

  if (!ad) {
    return <div></div>;
  }

  return (
    <html>
      <head />
      <body style={{ backgroundColor: bgColor ? bgColor : "#0d102d" }}>
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
