/* eslint-disable @next/next/no-img-element */

"use client";
import React, { useState, useEffect, useRef } from "react";
import config from "@/config";
import { getDefaultImg } from "@/queries/ads";

const AdsGrid = ({
  ads,
  bgColor,
  chainId,
  ratio
  // lastUpdate
}) => {
  ratio = ratio?.length && /^\d+:\d+$/.test(ratio) ? ratio : "1:1";
  ads = ads?.length ? ads : [];
  bgColor = bgColor ? `#${bgColor}` : "#0d102d";

  const defaultImg = getDefaultImg({ chainId, type: "reserved", ratio });
  const gridContainerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({
    width: 0,
    height: 0
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
              className={`relative overflow-hidden rounded border border-blue-500 bg-[${bgColor}] text-black hover:border-[#9abffb] hover:bg-[#353f75]`}
              style={{ width: `100%`, height: `100%` }}
            >
              <a
                href={
                  ad.records.linkURL ??
                  `${config[chainId].appURL}/${chainId}/offer/${ad.offerId}/${ad.tokenId}`
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
          {/*
          <span className="pr-2 text-right text-[0.65em] text-purple-800 text-purple-800">
            <a href={config[chainId].creditsURL} target="_blank" rel="noreferrer">
              Last Update : {lastUpdate} - Powered by SiBorg Ads (DSponsor protocol)
            </a>
          </span>
          */}
        </div>
      </div>
    </div>
  );
};
export default AdsGrid;
