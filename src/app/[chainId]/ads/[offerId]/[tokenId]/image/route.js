import { NextResponse } from "next/server";
import { getAdDataForToken } from "@/queries/ads";

export async function GET(request, context) {
  const { offerId, tokenId, chainId } = context.params;
  const requestUrl = new URL(`${request.url}`);
  const searchParams = requestUrl.searchParams;
  const adParameterId = searchParams.get("adParameterId");
  const defaultAdParameterKey = "imageURL";

  const imgUrl = await getAdDataForToken(
    chainId,
    offerId,
    tokenId,
    adParameterId,
    defaultAdParameterKey
  );

  let blob;

  try {
    const res = await fetch(imgUrl);
    blob = await res.blob();

    const headers = new Headers();
    headers.set("Content-Type", "image/*");
    return new NextResponse(blob, { status: 200, statusText: "OK", headers });
  } catch (e) {
    console.error("Error fetching image", e);
    return new Response("Error fetching image", {
      status: 500
    });
  }
}

export const dynamic = "force-dynamic";
