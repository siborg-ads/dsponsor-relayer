import { ImageResponse } from "next/og";
import { getValidatedAds } from "@/queries/ads";

export async function GET(request, context) {
  const { chainId, offerId } = await context.params;
  const requestUrl = new URL(`${request.url}`);
  const searchParams = requestUrl.searchParams;
  let includeAvailable = searchParams.get("includeAvailable") === "false" ? false : true;
  let includeReserved = searchParams.get("includeReserved") === "false" ? false : true;

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

  const lookupTable = [
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
  let current = 0;
  const width = 95;
  const height = 95;

  return new ImageResponse(
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
            if (lookupTable[index]) {
              current++;

              const data = ads[current]["imageURL-1:1"];
              const image =
                data.state === "CURRENT_ACCEPTED" ||
                (includeReserved && data.state === "UNAVAILABLE") ||
                (includeAvailable && (data.state === "BUY_MINT" || data.state === "BUY_MARKET"))
                  ? data.data
                  : null;

              return (
                <div
                  key={index}
                  style={{
                    width,
                    height,
                    display: "flex"
                  }}
                >
                  {image ? (
                    <img
                      src={image}
                      style={{
                        width,
                        height,
                        objectFit: "cover"
                      }}
                    />
                  ) : // <img
                  //   src="https://picsum.photos/200"
                  //   style={{
                  //     width,
                  //     height,
                  //     objectFit: "cover",
                  //   }}
                  // />
                  null}
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
  );
}
