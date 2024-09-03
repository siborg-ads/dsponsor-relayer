import { getFrameMetadata } from "frog/next";
import config from "@/config";

export async function generateMetadata({ params, searchParams }) {
  const { chainId, offerId } = params;
  const { items, ratio, tokenIds, tokenDataInput, tokenDatas } = searchParams;

  let queryParams = `?chainId=${chainId}`;

  if (items) {
    queryParams += `&items=${items}`;
  }

  if (ratio) {
    queryParams += `&ratio=${ratio}`;
  }

  if (tokenIds) {
    queryParams += `&tokenIds=${tokenIds}`;
  }

  if (tokenDataInput) {
    queryParams += `&tokenDataInput=${tokenDataInput}`;
  }

  if (tokenDatas) {
    queryParams += `&tokenDatas=${tokenDatas}`;
  }

  let url = config[chainId].relayerURL;
  url = `${url}/api/${chainId}/ads/${offerId}/frames${queryParams}`;
  const frameMetadata = await getFrameMetadata(url);

  return {
    title: "DSponsor Frame",
    other: frameMetadata
  };
}

export default function FarcasterFramePage() {
  return <span>DSponsor Frame</span>;
}
