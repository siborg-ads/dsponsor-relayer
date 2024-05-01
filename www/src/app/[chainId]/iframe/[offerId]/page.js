'use server';
import React from 'react';
import AdDynamicGrid from "@/components/AdDynamicGrid";
import {DSponsorSDK} from "@dsponsor/sdk";
import getValidatedAdProposalsQuery from "@/queries/getValidatedAdProposalsQuery";
import executeQuery from "@/queries/executeQuery";
import styles from './index.css';


// Is memoized
async function getOfferData(offerId) {
    const dsponsor = new DSponsorSDK();
    const endpoint = dsponsor.chain.graphApiUrl;
    const admin = dsponsor.getDSponsorAdmin();
    const query = getValidatedAdProposalsQuery({offerId: parseInt(offerId)});
    const queryResponse = await executeQuery(endpoint, query);
    if (!queryResponse?.adOffers) {
        return null;
    }
    if (queryResponse.adOffers.length === 0) {
        return null;
    }

    const response = queryResponse.adOffers[0];

    // fetch contractURI
    const contractURI = response?.nftContract?.contractURI;

    response.contractURIMetadata = await fetch(contractURI).then(res => res.json());

    return response;
}

export async function generateMetadata({params, searchParams}, parent) {
    const offerId = params.offerId;
    const response = await getOfferData(offerId);
    return {
        title: `${response?.contractURIMetadata?.name} - DSponsor`,
        description: response?.contractURIMetadata?.description || 'Unlock smarter monetization for your content.',
        keyword: response?.contractURIMetadata?.keyword || `${response?.contractURIMetadata?.name} monetization, ${response?.contractURIMetadata?.name} ads`,
    };
}


export default async function IframePage(req) {
    const {offerId} = req.params;

    // User can pass along a background color (bgColor) to customize the iframe
    let bgColor = '#0d102d';
    let sizes = [];
    if (req?.searchParams?.sizes) {
        sizes = req?.searchParams?.sizes.split(',');
        sizes = new Array(5).fill(0).map((_, i) => parseInt(sizes[i]) || parseInt(sizes.slice(-1)[0]));
    }
    if (req?.searchParams?.bgColor) {
        bgColor = `#${req?.searchParams?.bgColor}`;
    }

    const response = await getOfferData(offerId);

    if (!response) {
        return (
            <div>
                <h1>Offer not found</h1>
            </div>
        )
    }

    const allowedTokens = [];
    if (response?.nftContract?.allowList) {
        const maxSupply = response?.nftContract?.maxSupply;
        allowedTokens.push(...Array.from({length: maxSupply}, (_, i) => i.toString()));
    }

    // Two cases:
    // If we had available slots, we need to fill them with placeholders and replace when we have an ad
    // If we don't have available slots, we only push the ad that are available
    function transformToAd(tokenData) {
        const isMinted = !!tokenData.mint && tokenData?.transactionHash !== null;

        let imageURL = '/available.webp';
        let linkURL = `https://app.dsponsor.com/offer/${offerId}/${tokenData.tokenId}`;
        if (isMinted) {
            imageURL = '/reserved.webp';
            const currentProposals = tokenData?.currentProposals;
            for (const proposal of currentProposals) {
                if (proposal.adParameter?.id === 'imageURL') {
                    imageURL = proposal?.acceptedProposal?.data;
                }
                if (proposal.adParameter?.id === 'linkURL') {
                    linkURL = proposal?.acceptedProposal?.data;
                }
            }
        }

        return {
            offerId: offerId,
            tokenId: tokenData.tokenId,
            minted: isMinted,
            records: {
                linkURL: linkURL,
                imageURL: imageURL,
            }
        }
    }

    const flatAdList = [...response?.nftContract?.tokens.map(transformToAd)];
    return (
        <html>
        <head/>
        <body style={{backgroundColor: bgColor}}>
        <AdDynamicGrid offerId={offerId} ads={flatAdList} sizes={sizes}/>
        </body>
        </html>
    )
};


IframePage.getLayout = function getLayout(page) {
    return (
        <html>
        <head/>
        <body className='bg-gray-800'>{page}</body>
        </html>
    )
}
