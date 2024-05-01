import React from "react";

const handleAdClick = async (e) => {
    // If the ad is already bought, do nothing
    const options = {};
    if (ad?.getRecord) {
        return;
    }
    e.preventDefault();

    const imageURL = window.prompt('Enter the imageURL');
    if (!prompt) {
        return;
    }
    const linkURL = window.prompt('Enter the linkURL');
    if (!linkURL) {
        return;
    }
    console.log('AdSpaceRenderer: Buying ad space...');
    let tokenId = ad.tokenId;
    const adParameters = ["imageURL", "linkURL"]
    const tokenData = options.tokenData || '0x';
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
    }
    try {
        await admin.mintAndSubmit(mintParameters, {value: feeAndValue.toString()});
    } catch (e) {
        console.error('AdSpaceRenderer: Error buying ad space', e);
    }
};
const Ad = ({ad}) => {
    return (
        <div className="aspect-w-1 aspect-h-1 min-w-[175px] max-w-[300px] w-full border border-blue-500 overflow-hidden flex justify-center items-center bg-[#00143e] hover:bg-[#353f75] hover:border-[#9abffb] rounded text-black">
            <a href={ad.records.linkURL} target="_blank" rel="noopener noreferrer"
               className="no-underline text-black flex justify-center items-center w-full h-full">
                {ad.records.imageURL ? (
                    <img src={ad.records.imageURL} alt="Ad image" className="object-contain w-full h-full aspect-square"/>
                ) : (
                    <img src="/available.webp" alt="Ad image" className="object-contain w-full h-full"/>
                )}
            </a>
        </div>
    );
};


export default Ad;
