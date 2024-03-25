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

    const ads = await admin.getValidatedAdsFromOfferId(offerId) || [];

    return new Response(JSON.stringify({
        ads,
    }, null, 4), {
        headers: {
            "content-type": "application/json",
        },
    });
}
