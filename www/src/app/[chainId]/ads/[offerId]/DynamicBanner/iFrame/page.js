"use server";
import React from "react";
import AdsGrid from "@/components/AdsGrid";
import { getValidatedAds } from "@/queries/ads";

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

  let ads =
    previewImage && previewLink
      ? [
          {
            offerId,
            records: {
              linkURL: previewLink,
              imageURL: previewImage
            }
          }
        ]
      : undefined;

  if (!ads) {
    const selectedTokenIds = tokenIds?.length ? tokenIds.split(",") : undefined;
    const response = await getValidatedAds(chainId, offerId, selectedTokenIds);
    if (!response || !response._tokenIds?.length) {
      return (
        <div>
          <h1>Offer not found</h1>
        </div>
      );
    }
    const randomTokenId = response._tokenIds[Math.floor(Math.random() * response._tokenIds.length)];

    const adParameters = Object.keys(response[randomTokenId]);
    const imageKey = response[randomTokenId][`imageURL-${ratio}`]
      ? `imageURL-${ratio}`
      : adParameters.find((key) => key.includes("imageURL"));
    const linkKey = response[randomTokenId]["linkURL"]
      ? "linkURL"
      : adParameters.find((key) => key.includes("linkURL"));

    ads = [
      {
        offerId,
        tokenId: randomTokenId,
        records: {
          linkURL: response[randomTokenId][linkKey].data,
          imageURL: response[randomTokenId][imageKey].data
        }
      }
    ];
  }

  return (
    <html>
      <head />
      <body style={{ backgroundColor: bgColor ? bgColor : "#0d102d" }}>
        <AdsGrid
          ads={ads}
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
