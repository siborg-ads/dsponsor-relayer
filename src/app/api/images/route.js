import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get("text") || "Hello, World!";

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "1080px",
          height: "1080px",
          backgroundImage:
            "url('https://orange-elegant-swallow-161.mypinata.cloud/ipfs/QmdBodpqyrH6M8mYFrQNdokZMZArPfvY2cKoeHXKiSb4RQ')",
          backgroundSize: "cover",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "flex-end",
          padding: "40px",
          fontFamily: "Inter, sans-serif"
        }}
      >
        <div
          style={{
            fontSize: "60px",
            fontWeight: 700,
            lineHeight: "96.82px",
            color: "white",
            padding: "10px 20px",
            borderRadius: "10px"
          }}
        >
          {`${text}`}
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080
    }
  );
}

export const dynamic = "force-cache";
