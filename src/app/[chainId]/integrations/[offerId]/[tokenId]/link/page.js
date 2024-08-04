"use client";

import { useEffect, useState } from "react";
import { getAdDataForToken } from "@/queries/ads";

const AdLink = ({ params, searchParams }) => {
  const adParameterId = searchParams.adParameterId;
  const defaultAdParameterKey = "linkURL";

  const { offerId, tokenId, chainId } = params;

  const [url, setUrl] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const url = await getAdDataForToken({
        chainId,
        adOfferId: offerId,
        tokenId,
        adParameterId,
        defaultAdParameterKey,
        options: {
          populate: false,
          next: { revalidate: 15 * 60 } // 15 minutes
        }
      });
      setUrl(url);
    };
    fetchData();
  }, [chainId, offerId, tokenId, adParameterId]);

  if (!url) {
    return <div></div>;
  }

  // redirect to the link
  window.location.href = url;
};
export default AdLink;
