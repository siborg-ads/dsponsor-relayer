'use client';
import React from 'react';
import {useEffect, useState} from "react";
import {AdSpaceRenderer,DSponsorSDK} from "@dsponsor/sdk";
import './index.css';

const Ad = ({ ad,admin }) => {
    const handleAdClick = async (e) => {
        // If the ad is already bought, do nothing
        const options = {};
        if(ad?.getRecord) {
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
        const adParameters = ["imageURL","linkURL"]
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
        try{
            await admin.mintAndSubmit(mintParameters, {value:feeAndValue.toString()});
        } catch (e) {
            console.error('AdSpaceRenderer: Error buying ad space', e);
        }
    };

    return (
        <div className="border border-blue-500 overflow-hidden h-12 w-12 flex justify-center items-center bg-blue-300 text-black rounded hover:bg-blue-600">
            <a href={ad.records.linkURL} target="_blank" className="no-underline text-black flex justify-center items-center w-full h-full">
                {ad.records.imageURL && (
                    <img src={ad.records.imageURL} alt="Ad image" className="object-fit w-full h-full" />
                )}
                {!ad.records.imageURL && (
                    <p>{ad.records.text || 'Buy'}</p>
                )}
            </a>
        </div>
    );
};

const AdPlaceholder = () => {
    return (
        <div className="border border-blue-500 overflow-hidden h-12 w-12 flex justify-center items-center bg-blue-300 text-black rounded">
            <p>Buy</p>
        </div>
    );
};

const IframePage = (req) => {
    const {offerId} = req.params;


    const [loaded, setLoaded] = useState(false);
    const [adRows, setAdRows] = useState([]);

    const dsponsor = new DSponsorSDK();
    const admin = dsponsor.getDSponsorAdmin();

    const sponsoredItem = AdSpaceRenderer.fromOffer(offerId, {
        selector: 'dsponsor',
    })

    useEffect(() => {
        const fetchData = async () => {
            if (!loaded) {
                await sponsoredItem.preload();
                const selectedAds = sponsoredItem.select();
                setAdRows(selectedAds);
                setLoaded(true);
            }
        }
        fetchData();
    }, []);


    // Prepare the grid content, displaying placeholders if not loaded
    const gridContent = loaded ? adRows.flat().map((ad, index) => (
        <Ad key={index} ad={ad} admin={admin}/>
    )) : new Array(8).fill(null).map((_, index) => ( // assuming a grid of 2 rows and 4 columns as default
        <AdPlaceholder key={index} />
    ));

    return (
        <div className="grid grid-rows-2 grid-cols-4 gap-1 p-2 m-2 bg-blue-800 text-white border border-blue-400 rounded-md max-w-64">
            {gridContent}
        </div>
    );
};

export default IframePage;
