"use server";
import executeQuery from "@/queries/executeQuery";
import getLastValidatedAdImageQuery from "@/queries/getLastValidatedAdImageQuery";
import { DSponsorSDK } from "@dsponsor/sdk";

export default async function fetchImageUrlActions(chainId, offerId, tokenId) {
  "use server";
  const sdk = new DSponsorSDK({
    chain: {
      chainId
    }
  });

  const query = getLastValidatedAdImageQuery({
    offerId: parseInt(offerId),
    tokenId: parseInt(tokenId)
  });
  const endpoint = sdk.chain.graphApiUrl;

  const response = await executeQuery(endpoint, query);

  if (!response?.adProposals) {
    return "https://via.placeholder.com/500";
  }

  const ad = response.adProposals[0];
  const url = ad?.data;
  return url;
}
