"use server";
import React from "react";
import AdDynamicGrid from "@/components/AdDynamicGrid";
import { getValidatedAds } from "@/queries/ads";

export async function generateMetadata() {
  return {
    title: "DSponsor iFrame",
    description: "Unlock smarter monetization for your content.",
    keyword: "web3, nft, monetization, media, ads"
  };
}

export default async function IframePage(req) {
  const { chainId, offerId } = req.params;

  let bgColor = "#0d102d";
  if (req?.searchParams?.bgColor) {
    bgColor = `#${req?.searchParams?.bgColor}`;
  }

  let sizes = [];
  if (req?.searchParams?.sizes) {
    sizes = req?.searchParams?.sizes.split(",");
    sizes = new Array(5).fill(0).map((_, i) => parseInt(sizes[i]) || parseInt(sizes.slice(-1)[0]));
  }

  const preview = {
    image: (req?.searchParams?.previewImage || "").replace(/ /g, "+"),
    link: req?.searchParams?.previewLink || "",
    tokenId: req?.searchParams?.previewPosition
  };

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
    if (preview.image && preview.link && preview.tokenId === tokenId) {
      return {
        offerId,
        tokenId,
        records: {
          linkURL: preview.link,
          imageURL: preview.image
        }
      };
    } else {
      const adParameters = Object.keys(response[tokenId]);

      const imageKey = response[tokenId]["imageURL-1:1"]
        ? "imageURL-1:1"
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
      <body style={{ backgroundColor: bgColor }}>
        <AdDynamicGrid ads={ads} sizes={sizes} />
      </body>
    </html>
  );
}

IframePage.getLayout = function getLayout(page) {
  return (
    <html>
      <head />
      <body className="bg-gray-800">{page}</body>
    </html>
  );
};
