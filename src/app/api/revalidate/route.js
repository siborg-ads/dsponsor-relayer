import { getAddress } from "ethers";
import { revalidateTag } from "next/cache";
import { waitUntil } from "@vercel/functions";
import { getActivity, getAllOffers } from "@/queries/activity";
import { getProfile } from "@/queries/account";
import {
  //  unstable_after as
  after
} from "next/server";
import { getValidatedAds } from "@/queries/ads";
import { generateParcelle, uploadParcelle } from "@/utils/parcelles";

export async function POST(request) {
  const { tags } = await request.json();

  let revalidated = [];
  let updatedActivity = [];
  let updatedUser = [];

  const tagUpdate = (tag) => {
    revalidateTag(tag);
    revalidated.push(tag);
  };
  const activityUpdate = (tag, f) => {
    waitUntil(f);
    updatedActivity.push(tag);
  };
  const userUpdate = (tag, f) => {
    waitUntil(f);
    updatedUser.push(tag);
  };

  const allOffers = {};
  let allTags = [];

  if (tags?.length) {
    for (let tag of tags) {
      allTags.push(tag);
      const [chainId, item, id] = tag.split("-");

      if (chainId && item && id && item === "adOffer") {
        const allOffersForChainId = allOffers[chainId]
          ? allOffers[chainId]
          : await getAllOffers(chainId);
        allOffers[chainId] = allOffersForChainId;

        const [offer] = allOffersForChainId.filter((offer) => offer.id === id);
        if (offer?.nftContract?.id) {
          const nftContractAddress = offer.nftContract.id;
          allTags.push(`${chainId}-nftContract-${nftContractAddress}`);
        }

        allTags.push(`${chainId}-adOffers`);
      }

      if (chainId && item && id && item === "nftContract") {
        const allOffersForChainId = allOffers[chainId]
          ? allOffers[chainId]
          : await getAllOffers(chainId);
        allOffers[chainId] = allOffersForChainId;
        const offers = allOffersForChainId.filter((offer) => offer?.nftContract?.id === id);

        for (const offer of offers) {
          allTags.push(`${chainId}-adOffer-${offer.id}`);
        }

        allTags.push(`${chainId}-adOffers`);
      }
    }
  }

  if (allTags.length) {
    allTags = [...new Set(allTags)];

    // TAG UPDATE
    for (let tag of allTags) {
      try {
        const [chainId, item, id] = tag.split("-");

        if (chainId && item && id && item === "nftContract")
          tag = `${chainId}-nftContract-${getAddress(id)}`;
        if (chainId && item && id && item === "userAddress")
          tag = `${chainId}-userAddress-${getAddress(id)}`;

        tagUpdate(tag);
      } catch (e) {
        //
      }
    }

    // ACTIVITY UPDATE
    for (let tag of allTags) {
      const [chainId, item, id] = tag.split("-");

      if (chainId && item && item === "activity") {
        activityUpdate(tag, getActivity(chainId, null, null, null, null, { populate: true }));
      }

      if (chainId && item && id && item === "adOffer") {
        //
      }

      if (chainId && item && id && item === "nftContract") {
        //
      }

      if (chainId && item && id && item === "userAddress") {
        try {
          activityUpdate(tag, getActivity(chainId, null, null, getAddress(id), null));
          userUpdate(tag, getProfile(chainId, getAddress(id)));
        } catch (e) {
          //;
        }
      }
    }
  }

  const parcelleTag = tags?.find(
    (tag) => tag === "11155111-adOffer-70" || tag === "8453-adOffer-37"
  );
  if (parcelleTag) {
    const [chainId, , adOfferId] = parcelleTag.split("-");
    console.log("revalidate parcelle", { chainId, adOfferId });
    after(async () => {
      console.log("revalidate parcelle after", { chainId, adOfferId });
      const ads = await getValidatedAds({
        chainId,
        adOfferId,
        options: {
          populate: false
        }
      });

      console.log("before generateParcelle");
      const parcelle = await generateParcelle(ads);

      console.log("parcelle updated", parcelle);

      await uploadParcelle(parcelle, chainId, adOfferId);
      console.log("parcelle uploaded");
    });
  }

  return Response.json({
    revalidateDate: new Date(),
    revalidated,
    revalidatedNb: revalidated.length,
    updatedActivity,
    updatedActivityNb: updatedActivity.length,
    updatedUser,
    updatedUserNb: updatedUser.length
  });
}
