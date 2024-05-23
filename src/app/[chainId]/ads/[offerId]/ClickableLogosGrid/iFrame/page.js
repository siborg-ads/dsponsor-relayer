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
  const { bgColor, colSizes, previewTokenId, previewImage, previewLink } = req.searchParams;
  let { ratio } = req.searchParams;
  ratio = ratio?.length && /^\d+:\d+$/.test(ratio) ? ratio : "1:1";

  const response = await getValidatedAds({
    chainId,
    adOfferId: offerId,
    adParameterIds: [`imageURL-${ratio}`, "linkURL"]
  });

  if (!response) {
    return (
      <div>
        <h1>Offer not found</h1>
      </div>
    );
  }

  const adParameterIds = response._adParameterIds;
  const [imageKey, linkKey] = adParameterIds;

  if (adParameterIds?.length !== 2) {
    return (
      <div>
        <h1>Invalid ad parameters</h1>
      </div>
    );
  }

  if (!response._tokenIds?.length) {
    return (
      <div>
        <h1>No ads found</h1>
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
      return {
        offerId,
        tokenId,
        records: {
          linkURL: response[tokenId][linkKey].data || null,
          imageURL: response[tokenId][imageKey].data || null
        }
      };
    }
  });

  return (
    <html>
      <head />
      <body style={{ backgroundColor: bgColor ? `#${bgColor}` : "#0d102d" }}>
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
