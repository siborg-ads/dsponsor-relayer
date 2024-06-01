/* eslint-disable @next/next/no-img-element */

"use client";
import React, { useState, useEffect, useRef } from "react";
import config from "@/config";
import { getDefaultImg } from "@/queries/ads";
const AdsGrid = ({ ads, chainId, ratio }) => {
  ratio = ratio?.length && /^\d+:\d+$/.test(ratio) ? ratio : "1:1";
  ads = ads?.length ? ads : [];

  const defaultImg = getDefaultImg({ chainId, type: "reserved", ratio });
  const gridContainerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({
    width: window.innerWidth || 0,
    height: window.innerHeight || 0
  });
  useEffect(() => {
    const handleResize = () => {
      if (gridContainerRef.current) {
        setContainerSize({
          width: gridContainerRef.current.clientWidth,
          height: gridContainerRef.current.clientHeight
        });
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // Call at initial render too
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const calculateLayout = () => {
    const [widthRatio, heightRatio] = ratio.split(":").map(Number);

    const padding = 30; // Added padding for clear layout margins
    const effectiveHeight = containerSize.height - padding;
    // Calculating the ideal number of columns based on aspect ratio and container width
    let columnWidth = Math.sqrt(
      (containerSize.width * effectiveHeight) / ads.length / (widthRatio / heightRatio)
    );
    let numColumns = Math.max(1, Math.floor(containerSize.width / columnWidth));
    let numRows = Math.ceil(ads.length / numColumns);
    let rowHeight = columnWidth * (heightRatio / widthRatio);

    // case 1 ad
    if (ads.length === 1) {
      // Calculate dimensions based on the aspect ratio and the maximum size that can fit
      const maxPossibleWidth = containerSize.width;
      const maxPossibleHeight = containerSize.width * (heightRatio / widthRatio);
      numColumns = 1;
      if (maxPossibleHeight <= effectiveHeight) {
        columnWidth = maxPossibleWidth;
        rowHeight = maxPossibleHeight;
      } else {
        rowHeight = effectiveHeight;
        columnWidth = effectiveHeight * (widthRatio / heightRatio);
      }
      // case multi ads
    } else {
      while (rowHeight * numRows + rowHeight < effectiveHeight && numColumns > 1) {
        numColumns -= 1;
        numRows = Math.ceil(ads.length / numColumns);
        columnWidth = containerSize.width / numColumns;
        rowHeight = columnWidth * (heightRatio / widthRatio);
      }
      while (rowHeight * numRows > effectiveHeight && numRows > 1) {
        numColumns = Math.min(ads.length, numColumns + 1);
        numRows = Math.ceil(ads.length / numColumns);
        columnWidth = containerSize.width / numColumns;
        rowHeight = columnWidth * (heightRatio / widthRatio);
      }
    }

    return { numColumns, rowHeight, columnWidth };
  };
  const { numColumns, rowHeight, columnWidth } = calculateLayout();

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        boxSizing: "border-box",
        justifyContent: "center"
      }}
    >
      <div ref={gridContainerRef} className="w-screen h-screen">
        <div
          className="grid grid-flow-row-dense place-items-center gap-1"
          style={{
            gridTemplateColumns: `repeat(${numColumns}, calc(${columnWidth}px - 4px))`,
            gridAutoRows: `calc(${rowHeight}px - 4px)`,
            overflow: "hidden",
            justifyContent: "center"
          }}
        >
          {ads.map((ad, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded border border-blue-500 bg-[#00143e] text-black hover:border-[#9abffb] hover:bg-[#353f75]"
              style={{ width: `100%`, height: `100%` }}
            >
              <a
                href={
                  ad.records.linkURL ??
                  `${config[chainId].appURL}/${config[chainId].chainName}/offer/${ad.offerId}/${ad.tokenId}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 flex items-center justify-center no-underline"
              >
                <img
                  src={ad.records.imageURL ?? defaultImg}
                  alt="Ad image"
                  className="h-full w-full object-contain"
                />
              </a>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-2">
          <span className="pr-2 text-right text-[0.65em] text-orange-300 hover:text-orange-500">
            <a href={config[chainId].creditsURL} target="_blank" rel="noreferrer">
              Powered by DSponsor
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};
export default AdsGrid;

/* 
"use client";
import React from "react";
import config from "@/config";
import { getDefaultImg } from "@/queries/ads";

const AdsGrid = async ({ ads, chainId, colSizes, ratio }) => {
  colSizes = colSizes?.length === 5 ? colSizes : [100, 100, 125, 175, 200];
  ads = ads?.length ? ads : [];
  ratio = ratio?.length && /^\d+:\d+$/.test(ratio) ? ratio : "1:1";

  const defaultImg = await getDefaultImg({ chainId, type: "reserved", ratio });

 
  // const classes = `
  //              grid grid-flow-row-dense
  //              gap-1 grow place-items-center
  //              grid-cols-[repeat(auto-fill,minmax(${colSizes[0]}px,1fr))]
  //              sm:grid-cols-[repeat(auto-fill,minmax(${colSizes[1]}px,1fr))]
  //              md:grid-cols-[repeat(auto-fill,minmax(${colSizes[2]}px,1fr))]
  //              lg:grid-cols-[repeat(auto-fill,minmax(${colSizes[3]}px,1fr))]
  //              xl:grid-cols-[repeat(auto-fill,minmax(${colSizes[4]}px,1fr))]
  //              `;


  // We would have loved using above classes
  // But tailwindcss does not support programmatic dynamic arbitrary value
  // It's probably hackable (was tried the mode: 'jit') but was deemed not worth the effort
  const inlinedStyles = {
    "@media (minWidth: 1280px)": {
      gridTemplateColumns: `repeat(auto-fill, minmax(${colSizes[4]}px, 1fr))`
    },
    "@media (minWidth:: 1024px)": {
      gridTemplateColumns: `repeat(auto-fill, minmax(${colSizes[3]}px, 1fr))`
    },
    "@media (minWidth: 768px)": {
      gridTemplateColumns: `repeat(auto-fill, minmax(${colSizes[2]}px, 1fr))`
    },
    "@media (minWidth: 640px)": {
      gridTemplateColumns: `repeat(auto-fill, minmax(${colSizes[1]}px, 1fr))`
    },
    gridTemplateColumns: `repeat(auto-fill, minmax(${colSizes[0]}px, 1fr))`
  };

  // Convert the aspect ratio to padding-top percentage
  const [width, height] = ratio.split(":").map(Number);
  const paddingTop = (height / width) * 100;

  return (
    <div className="w-screen max-w-full">
      <div
        className={`
                grid grow
                grid-flow-row-dense gap-1
                `}
        style={inlinedStyles}
      >
        {ads.map((ad, index) => (
          <div
            key={index}
            className="flex w-full min-w-[50px] max-w-[300px] items-center justify-center overflow-hidden rounded border border-blue-500 bg-[#00143e] text-black hover:border-[#9abffb] hover:bg-[#353f75]"
          >
            <a
              href={
                ad.records.linkURL ??
                `${config[chainId].appURL}/${config[chainId].chainName}/offer/${ad.offerId}/${ad.tokenId}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center text-black no-underline"
              style={{ position: "relative", width: "100%", paddingTop: `${paddingTop}%` }}
            >
              <img
                src={ad.records.imageURL ?? defaultImg}
                alt="Ad image"
                className="absolute top-0 left-0 h-full w-full object-contain"
                style={{ position: "absolute", top: 0, left: 0 }}
              />
            </a>
          </div>
        ))}
      </div>
      <div className="flex mt-2">
        <span className="pr-2 text-right text-[0.65em] text-orange-300 hover:text-orange-500">
          <a href={config[chainId].creditsURL} target="_blank" rel="noreferrer">
            Powered by DSponsor
          </a>
        </span>
      </div>
    </div>
  );
};

export default AdsGrid;
*/
