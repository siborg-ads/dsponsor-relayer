'use server'
import executeQuery from "@/queries/executeQuery";
import {DSponsorSDK} from "@dsponsor/sdk";
import getLastValidatedAdLinkQuery from "@/queries/getLastValidatedAdLinkQuery";

export default async function fetchLinkUrlActions(chainId, offerId, tokenId) {
    'use server';
    const sdk = new DSponsorSDK({
        chain: {
            chainId
        }
    });
    const query = getLastValidatedAdLinkQuery({offerId: parseInt(offerId), tokenId: parseInt(tokenId)});
    const endpoint = sdk.chain.graphApiUrl;
    const response = await executeQuery(endpoint, query);
    if(!response?.adProposals){
        return null;
    }

    const ad = response.adProposals[0];
    let url = ad?.data;
    return url;
}
