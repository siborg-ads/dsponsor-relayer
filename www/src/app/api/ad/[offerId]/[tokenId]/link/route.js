import {AdSpaceRenderer, DSponsorSDK} from "@dsponsor/sdk";
import {ImageResponse} from "@vercel/og";

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

    const validatedAds = await admin.getValidatedAds({offerId:offer.offerId});

    const selectedAd = validatedAds.find(ad => ad.tokenId === tokenId);
    if (!selectedAd) {
        return new Response('Ad not found', {
            status: 404
        })
    }

    if(!selectedAd.records.linkURL){
        return new Response('Ad has no validated link', {
            status: 404
        });
    }

    const link = selectedAd.records.linkURL?.value;

    return new Response(null, {
        status: 302,
        headers: {
            Location: link,
        },
    });
}
