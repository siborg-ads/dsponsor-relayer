import { executeQuery } from "@/queries/subgraph";

const getOfferTokensFromNftContractQuery = /* GraphQL */ `
  query getOfferTokensFromNftContract($nftContract: String, $tokenIds: [BigInt!]) {
    adOffers(where: { nftContract: $nftContract }) {
      ...AdOfferSelectedTokensFragment
    }
  }
`;

export async function getOfferTokensFromNftContract(chainId, nftContract, tokenIds) {
  const variables = {
    nftContract,
    tokenIds
  };

  const graphResult = await executeQuery(chainId, getOfferTokensFromNftContractQuery, variables);

  if (!graphResult || !graphResult.data || !graphResult.data.adOffers[0]) {
    return null;
  }

  return graphResult.data.adOffers[0];
}
