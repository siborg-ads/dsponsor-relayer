// import {AdSpaceRenderer, DSponsorSDK} from "@dsponsor/sdk";
import {AdSpaceRenderer, DSponsorSDK} from "../../../../../../../../../../d-sponsor-sdk/dist/index";
import {ImageResponse} from "@vercel/og";
import getLastValidatedAdLinkQuery from "@/app/queries/getLastValidatedAdLinkQuery";
import executeQuery from "@/app/queries/executeQuery";

export async function GET(
    request,
    context,
) {
    const {
        offerId,
        tokenId,
    } = context.params



    const { searchParams } = new URL(`${request.url}`);
    const imageSize = searchParams.get("size") || "50";

    const sdk = new DSponsorSDK();
    const admin = await sdk.getDSponsorAdmin();
    const offer = await admin.getOffer({offerId})
    if (!offer) {
        return new Response('Offer not found', {
            status: 404
        })
    }

    const query = getLastValidatedAdLinkQuery({offerId: parseInt(offerId), tokenId: parseInt(tokenId)});
    const endpoint = sdk.chain.graphApiUrl;
    const response = await executeQuery(endpoint, query);
    if(!response?.adProposals){
        return null;
    }

    const ad = response.adProposals[0];
    let link = ad?.data;

    return new Response(null, {
        status: 302,
        headers: {
            Location: link,
        },
    });
}
