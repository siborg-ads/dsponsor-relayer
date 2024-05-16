import fetchCardUrlActions from "@/app/[chainId]/ad/[offerId]/[tokenId]/card/fetchCardUrlActions";

export async function GET(request, context) {
  const { offerId, tokenId, chainId } = context.params;

  const url = await fetchCardUrlActions(chainId, offerId, tokenId);

  if (!url) {
    return <div>Loading...</div>;
  }

  // return new ImageResponse(
  return new Response(null, {
    status: 200
  });
}
