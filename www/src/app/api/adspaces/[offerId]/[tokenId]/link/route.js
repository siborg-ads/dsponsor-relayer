import {AdSpaceRenderer, DSponsorSDK} from "@dsponsor/sdk";

export async function GET(
    request,
    context,
) {
    const {
        offerId,
        tokenId,
    } = context.params

    const sdk = new DSponsorSDK();
    const admin = await sdk.getDSponsorAdmin();
    const offer = await admin.getOffer(offerId)
    if (!offer) {
        return new Response('Offer not found', {
            status: 404
        })
    }

    const nft = admin.getDSponsorNFT(offer.nftContract);
    const ads = await nft.getAds();

    const selectedAd = ads.find(ad => ad.tokenId === tokenId);
    if (!selectedAd) {
        return new Response('Ad not found', {
            status: 404
        })
    }

    const link = selectedAd.records.linkURL;
    // We only redirect to the link if it's a valid URL
    if (link) {
        return new Response(null, {
            status: 302,
            headers: {
                Location: link,
            },
        });
    } else {
        return new Response('Ad has no link', {
            status: 404
        });
    }
}
