import { getAddress } from "ethers";
import { getActivity } from "@/queries/activity";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

export async function GET(request, context) {
  const { chainId } = context.params;

  const requestUrl = new URL(`${request.url}`);
  const searchParams = requestUrl.searchParams;
  const fromTimestamp = searchParams.get("fromTimestamp");
  const toTimestamp = searchParams.get("toTimestamp");
  const userAddress = searchParams.get("userAddress")
    ? getAddress(searchParams.get("userAddress"))
    : null;
  const nftContractAddress = searchParams.get("nftContractAddress");

  const response = await getActivity(
    chainId,
    fromTimestamp,
    toTimestamp,
    userAddress,
    nftContractAddress
  );

  return new Response(JSON.stringify(response, null, 2), {
    headers: {
      "content-type": "application/json"
    }
  });
}

export const fetchCache = "default-cache";
