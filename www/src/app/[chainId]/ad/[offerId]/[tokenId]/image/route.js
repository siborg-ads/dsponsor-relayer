import {NextResponse} from "next/server";
import fetchImageUrlActions from "@/app/[chainId]/ad/[offerId]/[tokenId]/image/fetchImageUrlActions";


export async function GET(
    request,
    context,
) {
    const {
        offerId,
        tokenId,
        chainId
    } = context.params
    const url = await fetchImageUrlActions(chainId, offerId, tokenId);
    const res = await fetch(url);
    const blob = await res.blob()
    const headers = new Headers()
    headers.set('Content-Type', 'image/*')
    return new NextResponse(blob, { status: 200, statusText: 'OK', headers })
}
