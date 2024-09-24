import { getAddress } from "ethers";
import { executeQuery } from "@/queries/subgraph";

export async function getProfile(chainId, userAddress) {
  const {
    offerIds
    // lastUpdate
  } = await getProfileOfferIds(chainId, userAddress);
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
  return executeQuery(chainId, getOffersProfileQuery, { offerIds, userAddress }, options);
}

async function getProfileOfferIds(chainId, userAddress) {
  const relatedProfileOfferIdsQuery = /* GraphQL */ `
    query relatedProfileOfferIds($userAddress: Bytes) {
      tokens(
        first: 1000
        where: {
          or: [
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
  const {
    data: {
      tokens,
      marketplaceListings,
      _meta: {
        block: { timestamp }
      }
    }
  } = await executeQuery(chainId, relatedProfileOfferIdsQuery, { userAddress }, options);

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
