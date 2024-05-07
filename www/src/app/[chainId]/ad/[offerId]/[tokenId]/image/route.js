import {NextResponse} from "next/server";
import fetchImageUrlActions from "@/app/[chainId]/ad/[offerId]/[tokenId]/image/fetchImageUrlActions";
import * as path from "path";
import { readFile } from "fs/promises";


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

    let blob;
    if(url){
        const res = await fetch(url);
        blob = await res.blob()
    } else {
        blob = await readFile(path.join(process.cwd(), "public/available.webp"));
    }
    const headers = new Headers()
    headers.set('Content-Type', 'image/*')
    return new NextResponse(blob, { status: 200, statusText: 'OK', headers })
}
