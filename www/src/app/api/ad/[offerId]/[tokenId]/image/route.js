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
    const offer = await admin.getOffer(offerId)
    if (!offer) {
        return new Response('Offer not found', {
            status: 404
        })
    }

    const validatedAds = await admin.getValidatedAdsFromOfferId(offer.offerId);

    const selectedAd = validatedAds.find(ad => ad.tokenId === tokenId);
    if (!selectedAd) {
        return new Response('Ad not found', {
            status: 404
        })
    }

    if(!selectedAd.records.imageURL){
        return new Response('Ad has no validated image', {
            status: 404
        });
    }
    const ogConfig = {
        width: imageSize,
        height: imageSize,
        title: selectedAd?.records?.title,
    }

    return new ImageResponse(
        (
            <img
                style={{
                    width: imageSize,
                    height: imageSize,
                }}
                src={selectedAd.records.imageURL}
            />
        ),ogConfig)
}
