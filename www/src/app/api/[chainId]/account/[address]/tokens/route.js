import config from "@/config";
import { getOfferTokensFromNftContracts } from "@/queries/offers";
import { Alchemy } from "alchemy-sdk";

export async function GET(request, context) {
  const { chainId, address } = context.params;

  if (!chainId) {
    return new Response("No chainId provided", {
      status: 400
    });
  }

  if (!address || address.length !== 42 || !address.startsWith("0x")) {
    return new Response("Invalid address provided", {
      status: 400
    });
  }

  const settings = {
    apiKey: process.env.NEXT_ALCHEMY_API_KEY,
    network: config[chainId].network
  };

  const alchemy = new Alchemy(settings);

  const nftsForOwner = await alchemy.nft.getNftsForOwner(address);

  let possibleTokens = [];
  for (const nft of nftsForOwner.ownedNfts) {
    if (nft.tokenId) {
      possibleTokens.push({
        tokenId: nft.tokenId,
        tokenUri: nft.tokenUri,
        nftContractAddress: nft.contract.address.toLowerCase(),
        ownerAddress: address,
        name: nft.contract.name,
        symbol: nft.contract.symbol,
        balance: nft.balance,
        timeLastUpdated: nft.timeLastUpdated
      });
    }
  }

  const nftContracts = [...new Set(possibleTokens.map((token) => token.nftContractAddress))];
  const tokenIds = [
    ...new Set(possibleTokens.map((token) => `${token.nftContractAddress}-${token.tokenId}`))
  ];

  const result = await getOfferTokensFromNftContracts(chainId, nftContracts, tokenIds);

  if (!result) {
    return new Response("Invalid result", {
      status: 401
    });
  }

  return new Response(JSON.stringify(result, null, 4), {
    headers: {
      "content-type": "application/json"
    }
  });
}
