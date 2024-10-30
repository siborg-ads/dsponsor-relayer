/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { headers } from "next/headers";
import { ImageResponse } from "next/og";
import { getValidatedAds } from "@/queries/ads";
import { memoize } from "nextjs-better-unstable-cache";

export const runtime = "edge";
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

function generateSimpleETag(data) {
  const jsonString = JSON.stringify(data);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(jsonString);

  let checksum = 0;
  for (let i = 0; i < dataBuffer.length; i++) {
    checksum = (checksum + dataBuffer[i]) % 65536;
  }

  return checksum.toString(16).padStart(4, "0");
}

async function _GET(includeAvailable, includeReserved, ads) {
  let current = 0;

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
                      src={data.data}
                      style={{
                        width,
                        height,
                        objectFit: "cover"
                      }}
                    />
                  ) : includeReserved && data.state === "UNAVAILABLE" ? (
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
                  ) : includeAvailable &&
                    (data.state === "BUY_MINT" || data.state === "BUY_MARKET") ? (
                    <div
                      style={{
                        display: "flex",
                        height: "100%",
                        width: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        backgroundImage: `linear-gradient(to bottom, green, green)`,
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
  ).body;

  // Transform the stream into a string
  const reader = stream.getReader();
  let data = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    data += value;
  }

  return data;
}

export const memoized = memoize(_GET, {
  revalidateTags: ["cryptoast-parcelles"],
  log: process.env.NEXT_CACHE_LOGS ? process.env.NEXT_CACHE_LOGS.split(",") : []
});

export async function GET(request, context) {
  const { chainId, offerId } = await context.params;

  const ads = await getValidatedAds({
    chainId,
    adOfferId: offerId,
    options: {
      populate: false
    }
  });

  if (!ads) {
    return new Response("No offer found", {
      status: 401
    });
  }

  const etag = generateSimpleETag(ads);

  const headersList = await headers();
  const ifNoneMatch = headersList.get("If-None-Match");

  // In case the ETag matches, we return a 304
  if (ifNoneMatch === etag) {
    return new Response(null, { status: 304 });
  }

  const searchParams = request.nextUrl.searchParams;
  const includeAvailable = searchParams.get("includeAvailable") === "false" ? false : true;
  const includeReserved = searchParams.get("includeReserved") === "false" ? false : true;

  // Get the data string memoized
  const dataString = await memoized(includeAvailable, includeReserved, ads);

  // Transform the string into a buffer
  const buffer = new Uint8Array(dataString.split(",").map((char) => parseInt(char)));

  // Return the response
  return new Response(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, no-cache",
      Etag: etag
    }
  });
}
