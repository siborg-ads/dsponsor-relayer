import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get("text") || "Hello, World!";
  let ratio = searchParams.get("ratio");
  ratio = ratio?.length && /^\d+:\d+$/.test(ratio) ? ratio : "1:1";

  let [width, height] = ratio.split(":").map(Number);

  // Calculate the scaling factor to ensure the largest dimension is 1000
  const scaleFactor = Math.min(1000 / width, 1000 / height);

  width = Math.round(width * scaleFactor);
  height = Math.round(height * scaleFactor);

  // Calculate the font size dynamically based on the dimensions
  const baseFontSize = 100; // Base font size for scaling
  const fontSize = Math.min((width / text.length) * 1.5, height / 3, baseFontSize);

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
          fontSize: `${fontSize}px`,
          letterSpacing: -2,
          // fontWeight: 700,
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
      width,
      height
    }
  );
}

export const dynamic = "force-cache";
