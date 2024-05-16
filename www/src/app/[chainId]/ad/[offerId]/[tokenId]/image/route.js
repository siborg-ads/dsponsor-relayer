import { NextResponse } from "next/server";
import * as path from "path";
import { readFile } from "fs/promises";
import fetchCardUrlActions from "@/app/[chainId]/ad/[offerId]/[tokenId]/card/fetchCardUrlActions";

export async function GET(request, context) {
  const { offerId, tokenId, chainId } = context.params;

  const response = await fetchCardUrlActions(chainId, offerId, tokenId);

  const url = response.find((ad) => ad.adParameter.base === "linkURL").data;
  const imageSrc = response.find((ad) => ad.adParameter.base === "imageURL").data;

  let blob;
  if (imageSrc) {
    const res = await fetch(imageSrc);
    blob = await res.blob();
  } else {
    if (url) {
      blob = await readFile(path.join(process.cwd(), "public/reserved.webp"));
    } else {
      blob = await readFile(path.join(process.cwd(), "public/available.webp"));
    }
  }
  const headers = new Headers();
  headers.set("Content-Type", "image/*");
  return new NextResponse(blob, { status: 200, statusText: "OK", headers });
}
