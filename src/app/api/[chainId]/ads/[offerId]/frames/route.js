/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/jsx-key */
import { createFrames, Button } from "frames.js/next";
import { getRandomAdData } from "@/queries/ads";

const frames = createFrames({
  basePath: "/"
});

const handleRequest = frames(async (ctx) => {
  const [, , chainId, , offerId] = ctx.url.pathname.split("/");
  const { tokenIds } = ctx.searchParams;

  if (ctx.message?.transactionId) {
    return {
      image: (
        <div tw="bg-purple-800 text-white w-full h-full justify-center items-center flex">
          Transaction submitted! {ctx.message.transactionId}
        </div>
      ),
      imageOptions: {
        aspectRatio: "1:1"
      },
      buttons: [
        <Button action="link" target={`https://www.onceupon.gg/tx/${ctx.message.transactionId}`}>
          View on block explorer
        </Button>
      ]
    };
  }

  const { randomAd, _adParameterIds, _tokenIds, _validatedAds } =
    (await getRandomAdData({
      chainId,
      adOfferId: offerId,
      tokenIds,
      adParameterIds: ["imageURL-1.91:1", "linkURL"]
    })) || {};

  if (_adParameterIds?.length !== 2) {
    return null;
  }

  const [imageURL, linkURL] = _adParameterIds;

  let image;
  const buttons = [];

  const mintTokenId = Object.keys(_validatedAds).find((tokenId) => {
    return _validatedAds[tokenId]?._buy?.mint?.length > 0;
  });

  if (mintTokenId) {
    image = _validatedAds[mintTokenId][imageURL].data;
    buttons.push(
      <Button
        action="tx"
        target={`/api/${chainId}/ads/${offerId}/frames/${mintTokenId}/txdata`}
        post_url={`/api/${chainId}/ads/${offerId}/frames`}
      >
        Mint Ad Space
      </Button>
    );
  } else {
    const secondaryTokenId = Object.keys(_validatedAds).find((tokenId) => {
      return !!_validatedAds[tokenId]?._buy?.secondary;
    });

    if (secondaryTokenId) {
      image = _validatedAds[secondaryTokenId][imageURL].data;
      buttons.push(
        <Button
          action="tx"
          target={`/api/${chainId}/ads/${offerId}/frames/${secondaryTokenId}/txdata`}
          post_url={`/api/${chainId}/ads/${offerId}/frames`}
        >
          {`${
            _validatedAds[secondaryTokenId]?._buy?.secondary.listingType === "Direct"
              ? "Buy"
              : "Bid"
          } Ad Space`}
        </Button>
      );
    }
  }

  if (randomAd && _tokenIds.length > 0) {
    image = randomAd[imageURL].data;
    const text = randomAd[linkURL].state === "CURRENT_ACCEPTED" ? "Visit" : "Ad space details";
    buttons.push(
      <Button action="link" target={randomAd[linkURL].data}>
        {text}
      </Button>
    );
  }

  return {
    image,
    imageOptions: {
      aspectRatio: "1:1"
    },
    buttons
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
