import { getFrameMetadata } from "frog/next";
import { config } from "process";

export async function generateMetadata({ params, searchParams }) {
  const { chainId, offerId } = params;
  const { tokenIds, tokenDatas, ratio, tokenDataInput } = searchParams;

  let queryParams = `?time=${Date.now()}`;

  if (tokenIds) {
    queryParams += `&tokenIds=${tokenIds}`;
  }

  if (tokenDatas) {
    queryParams += `&tokenDatas=${tokenDatas}`;
  }

  if (tokenDataInput) {
    queryParams += `&tokenDataInput=${tokenDataInput}`;
  }

  if (ratio) {
    queryParams += `&ratio=${ratio}`;
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

export const dynamic = "force-dynamic";
