import { ImageResponse } from "next/og";
import sharp from "sharp";

async function isWebp(url) {
  const head = await fetch(url, { method: "HEAD", cache: "force-cache" });
  const contentType = head.headers.get("content-type") || "";
  return contentType.includes("image/webp");
}

async function fetchAndConvertIfWebp(url) {
  if (await isWebp(url)) {
    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());
    return await sharp(buffer).png().toBuffer();
  } else {
    // If it's not WebP, you can just return null or the original data
    // const response = await fetch(url);
    // return Buffer.from(await response.arrayBuffer());
  }
}

export const runtime = "edge";
const imageID = "cryptoast-parcelle";

const multiplier = 4;

// Double the original tile dimensions
const tileWidth = Math.round(95 * multiplier);
const tileHeight = Math.round(95 * multiplier);

// Adjust these if you want to position them differently
const offsetTop = Math.round(230.6 * multiplier);
const offsetLeft = Math.round(278 * multiplier);

// Main canvas size is now doubled
const canvasWidth = Math.round(1980 * multiplier);
const canvasHeight = Math.round(1412 * multiplier);

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

  const stream = new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: `${canvasWidth}px`,
          display: "flex"
        }}
      >
        {/* 
          If your background image is only 1980 wide, scaling it up will stretch it. 
          If you have a larger image, swap it here or let it stretch. 
        */}
        <img
          src="https://crdev.cryptoast.net/wp-content/uploads/2023/10/map-number.png"
          width={canvasWidth}
          style={{
            display: "block"
          }}
        />
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            position: "absolute",
            top: offsetTop,
            left: offsetLeft,
            width: tileWidth * 15,
            height: tileHeight * 10
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
                    width: tileWidth,
                    height: tileHeight,
                    display: "flex"
                  }}
                >
                  {data.state === "CURRENT_ACCEPTED" && data.data ? (
                    <img
                      src={data.imgData ? `data:image/png;base64,${data.imgData}` : data.data}
                      style={{
                        width: tileWidth,
                        height: tileHeight,
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
                        fontSize: 54 * multiplier,
                        letterSpacing: -2,
                        fontWeight: 900,
                        textAlign: "center"
                      }}
                    >
                      <div
                        style={{
                          backgroundImage: `linear-gradient(90deg, #FFFFFF,#FFFFFF)`,
                          backgroundClip: "text",
                          WebkitBackgroundClip: "text",
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
                    width: tileWidth,
                    height: tileHeight,
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
      width: canvasWidth,
      height: canvasHeight
    }
  ).blob();

  const rawBlob = await stream;

  const arrayBuffer = await rawBlob.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);

  // Set actual 300 DPI
  const finalBuffer = await sharp(inputBuffer)
    .withMetadata({ density: 300 }) // set 300 DPI in metadata
    .png()
    .toBuffer();

  const finalBlob = new Blob([finalBuffer], { type: "image/png" });
  return finalBlob;

  // return rawBlob;
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
