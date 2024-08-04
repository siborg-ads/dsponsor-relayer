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
  let adParameterIds =
    ratio?.length && /^\d+:\d+$/.test(ratio)
      ? [`imageURL-${ratio}`, "linkURL"]
      : [`imageURL`, "linkURL"];

  const response = await getValidatedAds({
    chainId,
    adOfferId: offerId,
    adParameterIds
  });

  if (!response) {
    return (
      <div>
        <h1>Offer not found</h1>
      </div>
    );
  }

  adParameterIds = response._adParameterIds;
  const [imageKey, linkKey] = adParameterIds;

  const imageKeyParts = imageKey.split("-");
  ratio =
    ratio?.length && /^\d+:\d+$/.test(ratio)
      ? ratio
      : imageKeyParts.length === 2
        ? imageKeyParts[1]
        : ratio;

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

export const dynamic = "force-dynamic";
