import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get("text") || "Hello, World!";
  let ratio = searchParams.get("ratio");
  ratio = ratio?.length && /^\d+:\d+$/.test(ratio) ? ratio : "1:1";

  const [width, height] = ratio.split(":").map(Number);

  const textColor = searchParams.get("textColor") ? `#${searchParams.get("textColor")}` : "#8A4CEF";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          backgroundImage: `linear-gradient(to bottom, #2A2833, #2A2833)`,
          fontSize: 40 * width,
          letterSpacing: -2,
          fontWeight: 700,
          textAlign: "center"
          //  lineHeight: "300px"
        }}
      >
        <div
          style={{
            backgroundImage: `linear-gradient(90deg, #FFFFFF,${textColor})`,
            backgroundClip: "text",
            "-webkit-background-clip": "text",
            color: "transparent"
          }}
        >
          {text}
        </div>
      </div>
    ),
    {
      width: 400 * width,
      height: 400 * height
    }
  );
}

export const dynamic = "force-cache";
