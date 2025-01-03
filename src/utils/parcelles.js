import { ImageResponse } from "next/og";
import sharp from "sharp";

async function isWebp(url) {
  const head = await fetch(url, { method: "HEAD", cache: "force-cache" });
  const contentType = head.headers.get("content-type") || "";
  return contentType.includes("image/webp");
}

async function fetchAndConvertIfWebp(url) {
  // If it’s WebP
  if (await isWebp(url)) {
    // Fetch and convert
    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());
    return await sharp(buffer).png().toBuffer();
  } else {
    // Just return the original data
    // const response = await fetch(url);
    // return Buffer.from(await response.arrayBuffer());
  }
}

export const runtime = "edge";
const imageID = "cryptoast-parcelle";
const width = 95;
const height = 95;

const LOOKUP_TABLE = [
  false,
  false,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  false,
  false,
  false,
  true,
  true,
  true,
  true,
  false,
  false,
  false,
  false,
  false,
  true,
  true,
  true,
  true,
  false,
  true,
  true,
  true,
  true,
  false,
  false,
  true,
  false,
  true,
  false,
  false,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  false,
  true,
  true,
  true,
  true,
  true,
  false,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  false,
  false,
  true,
  false,
  false,
  true,
  false,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  false,
  true,
  true,
  true,
  false,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  false,
  false,
  true,
  false,
  false,
  true,
  false,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  false,
  true,
  true,
  true,
  true,
  true,
  false,
  true,
  true,
  true,
  true,
  false,
  true,
  true,
  true,
  false,
  false,
  true,
  false,
  true,
  false,
  false,
  true,
  true,
  true,
  false,
  false,
  false,
  true,
  true,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  true,
  true,
  false,
  false
];

export async function generateParcelle(ads) {
  let current = 0;

  console.log("ready to convert");

  await Promise.all(
    Object.keys(ads).map(async (key) => {
      if (ads[key] && ads[key]["imageURL-1:1"]) {
        const data = ads[key]["imageURL-1:1"];
        if (data?.state === "CURRENT_ACCEPTED" && data.data) {
          const buffer = await fetchAndConvertIfWebp(data.data);
          ads[key]["imageURL-1:1"].imgData = buffer ? buffer.toString("base64") : null;
        }
      }
    })
  );

  console.log("converted");

  const stream = new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "1980px",
          display: "flex"
        }}
      >
        <img
          src="https://crdev.cryptoast.net/wp-content/uploads/2023/10/map-number.png"
          width="1980"
          style={{
            display: "block"
          }}
        />
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            position: "absolute",
            top: 230.6,
            left: 278,
            width: width * 15,
            height: height * 10
          }}
        >
          {Array.from({ length: 150 }).map((_, index) => {
            if (LOOKUP_TABLE[index]) {
              current++;

              const data = ads[current]["imageURL-1:1"];

              return (
                <div
                  key={index}
                  style={{
                    width,
                    height,
                    display: "flex"
                  }}
                >
                  {data.state === "CURRENT_ACCEPTED" && data.data ? (
                    <img
                      src={data.imgData ? `data:image/png;base64,${data.imgData}` : data.data}
                      style={{
                        width,
                        height,
                        objectFit: "cover"
                      }}
                    />
                  ) : data.state === "UNAVAILABLE" ? (
                    <div
                      style={{
                        display: "flex",
                        height: "100%",
                        width: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        backgroundImage: `linear-gradient(to bottom, #2A2833, #2A2833)`,
                        fontSize: `54px`,
                        letterSpacing: -2,
                        fontWeight: 900,
                        textAlign: "center"
                      }}
                    >
                      <div
                        style={{
                          backgroundImage: `linear-gradient(90deg, #FFFFFF,#FFFFFF)`,
                          backgroundClip: "text",
                          "-webkit-background-clip": "text",
                          color: "transparent"
                        }}
                      >
                        {current.toString()}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            } else {
              return (
                <div
                  key={index}
                  style={{
                    width,
                    height,
                    display: "flex"
                  }}
                />
              );
            }
          })}
        </div>
      </div>
    ),
    {
      width: 1980,
      height: 1412
    }
  ).blob();

  console.log("parcelle ready");
  const blob = await stream;
  console.log("blob generated");
  return blob;
}

export async function uploadParcelle(blob, chainId, adOfferId) {
  const imgName = `${imageID}-${chainId}-${adOfferId}`;
  const clouflare_ID = process.env.CLOUDFLARE_ID;
  const clouflare_API_KEY = process.env.CLOUDFLARE_API_KEY;
  try {
    await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${clouflare_ID}/images/v1/${imgName}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${clouflare_API_KEY}`
        }
      }
    );
  } catch (e) {
    console.log(e);
  }

  const formData = new FormData();
  formData.append("file", blob, "image.png");
  formData.append("id", imgName);

  console.log("parcelle ready to upload", formData);

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${clouflare_ID}/images/v1`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clouflare_API_KEY}`
      },
      body: formData
    }
  );

  if (!response.ok) {
    throw new Error("Failed to upload image", response.statusText);
  }
}
