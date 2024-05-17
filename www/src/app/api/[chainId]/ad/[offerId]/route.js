import { DSponsorSDK } from "@dsponsor/sdk";

export async function GET(request, context) {
  const { chainId, offerId } = context.params;

  const sdk = new DSponsorSDK({
    chainId: chainId
  });
  const admin = await sdk.getDSponsorAdmin();
  const offer = await admin.getOffer({ offerId: parseInt(offerId) });

  if (!offer) {
    return new Response("Offer not found", {
      status: 404
    });
  }

  return new Response(JSON.stringify(offer), {
    headers: {
      "content-type": "application/json"
    }
  });
}
