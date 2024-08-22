import { revalidateTag } from "next/cache";
import { getAddress } from "ethers";

export async function POST(request) {
  const { tags } = await request.json();

  let revalidated = 0;

  if (tags?.length) {
    for (let tag of tags) {
      const [chainId, item, id] = tag.split("-");
      if (chainId && item && id && item === "nftContract")
        tag = `${chainId}-nftContract-${getAddress(id)}`;
      if (chainId && item && id && item === "userAddress")
        tag = `${chainId}-userAddress-${getAddress(id)}`;

      // TODO
      // if 'activity' ==> compute new activity rendering
      // if 'userAddress' ==> compute new activity user rendering

      revalidateTag(tag);
      revalidated++;
    }
  }

  return Response.json({ revalidated, now: new Date() });
}
