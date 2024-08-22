import { getAddress } from "ethers";
import { executeQuery } from "@/queries/subgraph";

const getOfferTokensFromNftContractQuery = /* GraphQL */ `
  query getOfferTokensFromNftContract($nftContract: String, $tokenIds: [BigInt!]) {
    adOffers(where: { nftContract: $nftContract }) {
      ...AdOfferSelectedTokensFragment
    }
  }
`;

export async function getOfferTokensFromNftContract(chainId, nftContract, tokenIds, options) {
  const variables = {
    nftContract,
    tokenIds
  };

  const baseOptions = {
    populate: true,
    next: { tags: [`${chainId}-nftContract-${getAddress(nftContract)}`] }
  };
  options = options ? { ...baseOptions, ...options } : baseOptions;

  const graphResult = await executeQuery(
    chainId,
    getOfferTokensFromNftContractQuery,
    variables,
    options
  );

  if (!graphResult || !graphResult.data || !graphResult.data.adOffers[0]) {
    return null;
  }

  console.log(graphResult);

  return {
    _lastUpdate: new Date(Number(graphResult?.data?._meta?.block?.timestamp) * 1000).toJSON(),
    ...graphResult.data.adOffers[0]
  };
}

const getOfferTokensFromNftContractsQuery = /* GraphQL */ `
  query getOfferTokensFromNftContracts($nftContracts: [String!], $tokenIds: [String!]) {
    adOffers(where: { nftContract_in: $nftContracts }) {
      ...AdOfferSelectedNftTokensFragment
    }
  }
`;

export async function getOfferTokensFromNftContracts(chainId, nftContracts, tokenIds, options) {
  const variables = {
    nftContracts,
    tokenIds
  };

  const baseOptions = {
    populate: false,
    next: {
      tags: nftContracts.map((nftContract) => `${chainId}-nftContract-${getAddress(nftContract)}`)
    }
  };
  options = options ? { ...baseOptions, ...options } : baseOptions;
  const graphResult = await executeQuery(
    chainId,
    getOfferTokensFromNftContractsQuery,
    variables,
    options
  );

  if (!graphResult || !graphResult.data || !graphResult.data.adOffers) {
    return null;
  }

  return graphResult.data.adOffers;
}
