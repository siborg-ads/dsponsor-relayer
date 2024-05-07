import {AdSpaceRenderer, DSponsorSDK} from "@dsponsor/sdk";
import getLastValidatedAdLinkQuery from "@/queries/getLastValidatedAdLinkQuery";
import executeQuery from "@/queries/executeQuery";
import fetchCardUrlActions from "@/app/[chainId]/ad/[offerId]/[tokenId]/card/fetchCardUrlActions";
import {ImageResponse} from "@vercel/og";

export async function GET(
    request,
    context,
) {
    const {
        offerId,
        tokenId,
        chainId
    } = context.params

    const url = await fetchCardUrlActions(chainId, offerId, tokenId);

    if(!url){
        return <div>Loading...</div>
    }


    // return new ImageResponse(
    return new Response(null, {
        status: 200,
    });
}
