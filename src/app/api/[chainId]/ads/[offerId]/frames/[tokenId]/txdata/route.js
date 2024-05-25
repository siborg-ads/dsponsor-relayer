import { transaction } from "frames.js/core";
import { createFrames } from "frames.js/next";

const frames = createFrames({
  basePath: "/"
});

export const POST = frames(async (ctx) => {
  const [, , chainId, , offerId, , tokenId] = ctx.url.pathname.split("/");

  // Do something with the request data to generate transaction data
  // Create calldata for the transaction using Viem's `encodeFunctionData`
  /*
  const myCalldata = encodeFunctionData({
    abi: myContractAbi,
    functionName: "myFunction",
    args: [myArg1, myArg2],
  });
  */

  // Return transaction data that conforms to the correct type

  console.log({ chainId, offerId, tokenId });

  return transaction({
    chainId: "eip155:10", // OP Mainnet
    method: "eth_sendTransaction",
    params: {
      abi: [],
      to: "0x64E8f7C2B4fd33f5E8470F3C6Df04974F90fc2cA",
      // data: calldata,
      value: "44"
    }
  });
});
