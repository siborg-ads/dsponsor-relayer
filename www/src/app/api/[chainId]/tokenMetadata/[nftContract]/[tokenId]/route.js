import { getOfferTokensFromNftContract } from "@/queries/offers";

export async function GET(request, context) {
  const { chainId, nftContract, tokenId } = context.params;

  const result = await getOfferTokensFromNftContract(chainId, nftContract, [tokenId]);

  const tokenMetadata = result?.nftContract?.tokens?.[0]?.metadata
    ? result.nftContract.tokens[0].metadata
    : result?.metadata?.offer
      ? result.metadata.offer
      : null;

  const tokenDataName = tokenMetadata?.name;
  const tokenDataDescription = tokenMetadata?.description;
  const tokenDataImage = tokenMetadata?.image;

  if (!tokenDataName || !tokenDataDescription || !tokenDataImage) {
    return new Response("No valid token metadata found", {
      status: 401
    });
  }

  return new Response(JSON.stringify(Object.assign(tokenMetadata, null, 4)), {
    headers: {
      "content-type": "application/json"
    }
  });
}
