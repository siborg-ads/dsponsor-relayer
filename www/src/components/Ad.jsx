/* eslint-disable @next/next/no-img-element */
import React from "react";

/*
const handleAdClick = async (e) => {
  // If the ad is already bought, do nothing
  const options = {};
  if (ad?.getRecord) {
    return;
  }
  e.preventDefault();

  const imageURL = window.prompt("Enter the imageURL");
  if (!prompt) {
    return;
  }
  const linkURL = window.prompt("Enter the linkURL");
  if (!linkURL) {
    return;
  }
  console.log("AdSpaceRenderer: Buying ad space...");
  const tokenId = ad.tokenId;
  const adParameters = ["imageURL", "linkURL"];
  const tokenData = options.tokenData || "0x";
  const valuePrice = BigInt(self.prices[0]);
  const bps = self.bps;
  const fee = (valuePrice * BigInt(bps)) / BigInt(10000); // Calculate fee based on BPS
  const feeAndValue = valuePrice + fee; // Total value including the fee

  const mintParameters = {
    tokenId,
    to: self.signer.getAddress(),
    currency: self.currencies[0],
    tokenData,
    offerId: self.offerId,
    adParameters,
    adDatas: [imageURL, linkURL],
    referralAdditionalInformation: options?.referral ?? self.referral
  };
  try {
    await admin.mintAndSubmit(mintParameters, { value: feeAndValue.toString() });
  } catch (e) {
    console.error("AdSpaceRenderer: Error buying ad space", e);
  }
};
*/

const Ad = ({ ad }) => {
  return (
    <div className="aspect-w-1 aspect-h-1 flex w-full min-w-[50px] max-w-[300px] items-center justify-center overflow-hidden rounded border border-blue-500 bg-[#00143e] text-black hover:border-[#9abffb] hover:bg-[#353f75]">
      <a
        href={ad.records.linkURL ?? `https://app.dsponsor.com/offer/${ad.offerId}/${ad.tokenId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-full w-full items-center justify-center text-black no-underline"
      >
        {ad.records.imageURL ? (
          <img
            src={ad.records.imageURL}
            alt="Ad image"
            className="aspect-square h-full w-full object-contain"
          />
        ) : (
          <img
            src="/available.webp"
            alt="Ad image"
            className="aspect-square h-full w-full object-contain"
          />
        )}
      </a>
    </div>
  );
};

export default Ad;
