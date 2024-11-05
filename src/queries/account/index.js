import { getAddress } from "ethers";
import { Alchemy, Network } from "alchemy-sdk";
import { executeQuery } from "@/queries/subgraph";

export async function getHoldingsFromAlchemy(chainId, userAddress) {
  let ownedNfts = [];

  const network =
    Number(chainId) === 8453
      ? Network.BASE_MAINNET
      : Number(chainId) === 11155111
        ? Network.ETH_SEPOLIA
        : undefined;

  if (network) {
    const config = {
      apiKey: process.env.ALCHEMY_API_KEY,
      network
    };
    const alchemy = new Alchemy(config);

    let pageKey = null;
    do {
      const result = await alchemy.nft.getNftsForOwner(userAddress, {
        pageKey,
        omitMetadata: true
      });
      pageKey = result.pageKey;
      ownedNfts = ownedNfts.concat(result.ownedNfts);
    } while (pageKey);
  }

  const nftIds = {};
  for (const { contractAddress, tokenId } of ownedNfts) {
    nftIds[`${contractAddress}-${tokenId}`.toLowerCase()] = true;
  }
  return nftIds;
}

export async function getProfile(chainId, userAddress) {
  const holdings = await getHoldingsFromAlchemy(chainId, userAddress);

  const tokenNftIds = Object.keys(holdings);

  const {
    offerIds
    // lastUpdate
  } = await getProfileOfferIds(chainId, userAddress, tokenNftIds);
  const getOffersProfileQuery = /* GraphQL */ `
    query getOffersProfile($offerIds: [String!], $userAddress: Bytes) {
      adOffers(
        first: 1000
        where: {
          or: [
            { id_in: $offerIds }
            { admins_contains: [$userAddress] }
            { validators_contains: [$userAddress] }
          ]
        }
        orderBy: name
        orderDirection: asc
      ) {
        ...AdOfferFragment
      }
    }
  `;

  const tags = [`${chainId}-userAddress-${getAddress(userAddress)}`];
  for (const offerId of offerIds) {
    tags.push(`${chainId}-adOffer-${offerId}`);
  }

  const options = {
    populate: true,
    next: { tags }
  };

  const result = await executeQuery(
    chainId,
    getOffersProfileQuery,
    { offerIds, userAddress },
    options
  );

  if (result?.data?.adOffers) {
    for (let i = 0; i < result.data.adOffers.length; i++) {
      if (result.data.adOffers[i]?.nftContract?.tokens?.length) {
        for (let j = 0; j < result.data.adOffers[i].nftContract.tokens.length; j++) {
          if (holdings[result.data.adOffers[i].nftContract.tokens[j].id.toLowerCase()]) {
            result.data.adOffers[i].nftContract.tokens[j].owner = userAddress;
          }
        }
      }
    }
  }
  return result;
}

async function getProfileOfferIds(chainId, userAddress, tokenNftIds) {
  tokenNftIds = Array.isArray(tokenNftIds) ? tokenNftIds : [];

  const relatedProfileOfferIdsQuery = /* GraphQL */ `
    query relatedProfileOfferIds($userAddress: Bytes, $tokenNftIds: [String!]) {
      tokens(
        first: 1000
        where: {
          or: [
            { id_in: $tokenNftIds }
            { owner: $userAddress }
            { user_: { user: $userAddress } }
            { marketplaceListings_: { and: [{ lister: $userAddress }, { status: CREATED }] } }
          ]
        }
      ) {
        nftContract {
          adOffers {
            id
          }
        }
      }
      marketplaceListings(first: 1000, where: { and: [{ bids_: { bidder: $userAddress } }] }) {
        token {
          nftContract {
            adOffers {
              id
            }
          }
        }
      }
    }
  `;

  const options = {
    populate: false,
    next: { tags: [`${chainId}-userAddress-${getAddress(userAddress)}`] }
  };

  const q = await executeQuery(
    chainId,
    relatedProfileOfferIdsQuery,
    { userAddress, tokenNftIds },
    options
  );

  const {
    data: {
      tokens,
      marketplaceListings,
      _meta: {
        block: { timestamp }
      }
    }
  } = q;

  const offerIds = new Set();

  tokens.forEach(({ nftContract: { adOffers } }) => {
    adOffers.forEach(({ id }) => offerIds.add(id));
  });

  marketplaceListings.forEach(
    ({
      token: {
        nftContract: { adOffers }
      }
    }) => {
      adOffers.forEach(({ id }) => offerIds.add(id));
    }
  );

  return { offerIds: Array.from(offerIds), lastUpdate: timestamp };
}
