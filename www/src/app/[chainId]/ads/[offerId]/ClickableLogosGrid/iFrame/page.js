"use server";
import React from "react";
import AdsGrid from "@/components/AdsGrid";
import { getValidatedAds } from "@/queries/ads";

export async function generateMetadata() {
  return {
    title: "DSponsor iFrame - Clickable Logos Grid",
    description: "Unlock smarter monetization for your content.",
    keyword: "web3, nft, monetization, media, ads"
  };
}

export default async function ClickableLogosGridIframePage(req) {
  const { chainId, offerId } = req.params;
  const { bgColor, colSizes, ratio, previewTokenId, previewImage, previewLink } = req.searchParams;

  const response = await getValidatedAds(chainId, offerId);

  if (!response) {
    return (
      <div>
        <h1>Offer not found</h1>
      </div>
    );
  }

  const tokenIds = response._tokenIds;
  const ads = tokenIds.map((tokenId) => {
    if (previewImage && previewLink && previewTokenId === tokenId) {
      return {
        offerId,
        tokenId,
        records: {
          linkURL: previewLink,
          imageURL: previewImage
        }
      };
    } else {
      const adParameters = Object.keys(response[tokenId]);

      const imageKey = response[tokenId][`imageURL-${ratio}`]
        ? `imageURL-${ratio}`
        : adParameters.find((key) => key.includes("imageURL"));
      const linkKey = response[tokenId]["linkURL"]
        ? "linkURL"
        : adParameters.find((key) => key.includes("linkURL"));

      return {
        offerId,
        tokenId,
        records: {
          linkURL: response[tokenId][linkKey].data,
          imageURL: response[tokenId][imageKey].data
        }
      };
    }
  });

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

ClickableLogosGridIframePage.getLayout = function getLayout(page) {
  return (
    <html>
      <head />
      <body className="bg-gray-800">{page}</body>
    </html>
  );
};
