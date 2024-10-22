import { getAddress } from "ethers";
import { getProfile } from "@/queries/account";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

export async function GET(request, context) {
  const { chainId, address } = (await context.params);

  const response = await getProfile(chainId, getAddress(address));

  return new Response(JSON.stringify(response, null, 2), {
    headers: {
      "content-type": "application/json"
    }
  });
}
