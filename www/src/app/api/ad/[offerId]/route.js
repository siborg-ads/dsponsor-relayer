import {AdSpaceRenderer, DSponsorSDK} from "@dsponsor/sdk";
import {ImageResponse} from "@vercel/og";

export async function GET(
    request,
    context,
) {
    const {
        offerId,
    } = context.params

    const sdk = new DSponsorSDK();
    const admin = await sdk.getDSponsorAdmin();
    const offer = await admin.getOffer(offerId)

    if (!offer) {
        return new Response('Offer not found', {
            status: 404
        })
    }

    return new Response(JSON.stringify(offer, null, 4), {
        headers: {
            "content-type": "application/json",
        },
    });
}
