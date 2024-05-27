/** @jsxImportSource frog/jsx */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/jsx-key */

import config from "@/config";
import DSponsorAdminABI from "@/config/abis/DSponsorAdmin.js";
import DSponsorMarketplaceABI from "@/config/abis/DSponsorMarketplace.js";
import { getRandomAdData, getValidatedAds } from "@/queries/ads";
import { getEthQuote } from "@/queries/uniswap/quote";
import { Button, Frog } from "frog";
import { handle } from "frog/next";
import { createSystem } from "frog/ui";

const { Box, Heading, Text, VStack, Image, vars } = createSystem();

const actions = {
  MINT: "Mint",
  BUY: "Buy",
  BID: "Bid"
};

const app = new Frog({
  basePath: "/",
  ui: { vars }
});

app.frame("/api/:chainId/ads/:offerId/frames", async (c) => {
  const { offerId, chainId } = c.req.param();

  let { ratio, tokenIds } = c.req.query();
  ratio = ratio === "1:1" ? "1:1" : "1.91:1";

  const {
    randomAd,
    _adParameterIds,
    _tokenIds,
    _validatedAds
    // _randomTokenId
  } =
    (await getRandomAdData({
      chainId,
      adOfferId: offerId,
      tokenIds,
      adParameterIds: [`imageURL-${ratio}`, "linkURL"]
    })) || {};

  if (_adParameterIds?.length !== 2) {
    return null;
  }

  const [imageURL, linkURL] = _adParameterIds;
  ratio =
    imageURL.split("-")[1] === "1:1" || imageURL.split("-")[1] === "1.91:1"
      ? imageURL.split("-")[1]
      : "1.91:1";

  let image;
  const intents = [];

  const mintTokenId = Object.keys(_validatedAds).find((tokenId) => {
    return _validatedAds[tokenId]?._buy?.mint?.length > 0;
  });

  if (mintTokenId) {
    image = _validatedAds[mintTokenId][imageURL].data;
    const action = actions.MINT;

    intents.push(
      <Button.Transaction
        action={`/api/${chainId}/ads/${offerId}/frames/${mintTokenId}/txres`}
        target={`/api/${chainId}/ads/${offerId}/frames/${mintTokenId}/txdata/${action}`}
      >
        {action}
      </Button.Transaction>
    );
  }

  const secondaryTokenId = Object.keys(_validatedAds).find((tokenId) => {
    return !!_validatedAds[tokenId]?._buy?.secondary;
  });

  if (secondaryTokenId) {
    const { listingType } = _validatedAds[secondaryTokenId]._buy.secondary;

    const action = listingType === "Direct" ? actions.BUY : actions.BID;

    image = _validatedAds[secondaryTokenId][imageURL].data;
    intents.push(
      <Button.Transaction
        action={`/api/${chainId}/ads/${offerId}/frames`}
        target={`/api/${chainId}/ads/${offerId}/frames/${secondaryTokenId}/txdata/${action}`}
      >
        {action}
      </Button.Transaction>
    );
  }

  if (randomAd && _tokenIds.length > 0) {
    image = randomAd[imageURL].data;
    const text = randomAd[linkURL].state === "CURRENT_ACCEPTED" ? "Visit" : "Details";
    intents.push(<Button.Link href={randomAd[linkURL].data}>{text}</Button.Link>);
  }

  let contentType;
  try {
    const imageResponse = await fetch(image, {
      method: "HEAD"
    });
    contentType = imageResponse.headers.get("Content-Type");
  } catch (error) {
    console.log("error fetching image", error);
  }

  if (contentType && ["image/jpeg", "image/png", "image/gif", "image/bmp"].includes(contentType)) {
    image = (
      <Box>
        <Image src={image} alt="frameImg" objectFit="contain" width="100%" height="100%" />
      </Box>
    );
  } else if (contentType && contentType.includes("image/")) {
    // keep img url as it is
  } else {
    image = (
      <Box grow alignVertical="center" backgroundColor="background" padding="32">
        <VStack gap="4">
          <Heading>DSponsor Ad Space</Heading>
          <Text color="text200" size="20">
            Buy ad space ownership or checkout current sponsor details 👇
          </Text>
        </VStack>
      </Box>
    );
  }

  return c.res({
    image,
    imageAspectRatio: ratio,
    intents
  });
});

app.frame("/api/:chainId/ads/:offerId/frames/:tokenId/txres", async (c) => {
  const { offerId, chainId, tokenId } = c.req.param();
  const { transactionId } = c;

  return c.res({
    image: (
      <Box grow alignVertical="center" backgroundColor="background" padding="32">
        <VStack gap="4">
          <Heading size="48">Transaction submitted 🎉</Heading>
          <Text color="text200" size="32">
            Verify your tx or Manage your ad 👇
          </Text>
        </VStack>
      </Box>
    ),
    intents: [
      <Button.Link href={`${config[chainId].explorerURL}/tx/${transactionId}`}>
        Transaction
      </Button.Link>,
      <Button.Link href={`${config[chainId].appURL}/${chainId}/offer/${offerId}/${tokenId}`}>
        Manage
      </Button.Link>
    ]
  });
});

app.transaction("/api/:chainId/ads/:offerId/frames/:tokenId/txdata/:action", async (c) => {
  const { offerId, tokenId, chainId, action } = c.req.param();

  const {
    //  verified,
    frameData
  } = c;

  const validatedAds = await getValidatedAds({
    chainId,
    adOfferId: offerId,
    tokenIds: [tokenId]
  });

  const { mint, secondary } = validatedAds[tokenId]._buy || {};

  if (action === actions.MINT && mint.length > 0) {
    const { currency, totalAmount } = mint[0];

    const quote = await getEthQuote(chainId, currency, totalAmount /* , slippagePerCent = 0.3 */);

    const { amountInEthWithSlippage: value } = quote;

    const mintParams = {
      tokenId,
      to: frameData.address,
      currency,
      tokenData: "",
      offerId,
      adParameters: [],
      adDatas: []
    };

    return c.contract({
      abi: DSponsorAdminABI,
      chainId: `eip155:${chainId}`,
      functionName: "mintAndSubmit",
      args: [mintParams],
      to: config[chainId].smartContracts.DSPONSOR_ADMIN.address,
      value
    });
  } else if (action === actions.BUY && secondary) {
    const { id: listingId, buyoutPricePerToken, currency } = secondary;

    const { amountInEthWithSlippage: value } = await getEthQuote(
      chainId,
      currency,
      buyoutPricePerToken /* , slippagePerCent = 0.3 */
    );

    const buyParams = {
      listingId,
      buyFor: frameData.address,
      quantity: 1,
      currency,
      totalPrice: buyoutPricePerToken,
      referralInformation: ""
    };

    return c.contract({
      abi: DSponsorMarketplaceABI,
      chainId: `eip155:${chainId}`,
      functionName: "buy",
      args: [buyParams],
      to: config[chainId].smartContracts.DSPONSOR_MARKETPLACE.address,
      value
    });
  } else if (action === actions.BID && secondary) {
    const { id: listingId, minimalBidAmount, currency } = secondary;
    const { amountInEthWithSlippage: value } = await getEthQuote(
      chainId,
      currency,
      minimalBidAmount /* , slippagePerCent = 0.3 */
    );
    const args = [listingId, minimalBidAmount, ""];

    return c.contract({
      abi: DSponsorMarketplaceABI,
      chainId: `eip155:${chainId}`,
      functionName: "bid",
      args,
      to: config[chainId].smartContracts.DSPONSOR_MARKETPLACE.address,
      value
    });
  }
});

export const GET = handle(app);
export const POST = handle(app);
