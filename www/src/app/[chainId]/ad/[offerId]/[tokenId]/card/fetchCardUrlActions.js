"use server";
import executeQuery from "@/queries/executeQuery";
import { DSponsorSDK } from "@dsponsor/sdk";
import getLastValidatedAdQuery from "@/queries/getLastValidatedAdQuery";

export default async function fetchCardUrlActions(chainId, offerId, tokenId) {
  "use server";
  const sdk = new DSponsorSDK({
    chain: {
      chainId
    }
  });

  const query = getLastValidatedAdQuery({
    offerId: parseInt(offerId),
    tokenId: parseInt(tokenId)
  });
  const endpoint = sdk.chain.graphApiUrl;

  const response = await executeQuery(endpoint, query);

  return response?.adProposals ?? [];
}
