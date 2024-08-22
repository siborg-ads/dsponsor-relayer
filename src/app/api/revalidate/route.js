import { getAddress } from "ethers";
import { revalidateTag } from "next/cache";
import { waitUntil } from "@vercel/functions";
import { getActivity } from "@/queries/activity";

export async function POST(request) {
  const { tags } = await request.json();

  let revalidated = 0;
  let updatedActivity = 0;

  if (tags?.length) {
    for (let tag of tags) {
      const [chainId, item, id] = tag.split("-");
      if (chainId && item && id && item === "nftContract")
        tag = `${chainId}-nftContract-${getAddress(id)}`;
      if (chainId && item && id && item === "userAddress")
        tag = `${chainId}-userAddress-${getAddress(id)}`;

      revalidateTag(tag);
      revalidated++;
    }
  }

  if (tags?.length) {
    for (let tag of tags) {
      const [chainId, item, id] = tag.split("-");

      if (chainId && item && id && item === "userAddress") {
        waitUntil(getActivity(chainId, null, null, getAddress(id), null));
        updatedActivity++;
      }

      if (chainId && item && id && item === "nftContract") {
        waitUntil(getActivity(chainId, null, null, null, getAddress(id)));
        updatedActivity++;
      }

      if (chainId && item && item === "activity") {
        waitUntil(getActivity(chainId, null, null, null, null));
        updatedActivity++;
      }
    }
  }

  return Response.json({ revalidated, updatedActivity, now: new Date() });
}
