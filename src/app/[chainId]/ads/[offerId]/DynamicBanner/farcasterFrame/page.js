import { fetchMetadata } from "frames.js/next";

export async function generateMetadata({ params, searchParams }) {
  const { chainId, offerId } = params;
  const { tokenIds } = searchParams;

  let queryParams = "";

  if (tokenIds) {
    queryParams += `tokenIds=${tokenIds}`;
  }

  if (queryParams) {
    queryParams = `?${queryParams}`;
  }

  return {
    title: "DSponsor Frame",

    other: await fetchMetadata(
      new URL(
        `/api/${chainId}/ads/${offerId}/frames${queryParams}`,
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"
      )
    )
  };
}

export default function FarcasterFramePage() {
  return <span>DSponsor Frame</span>;
}
