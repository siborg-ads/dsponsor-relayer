/* eslint-disable @next/next/no-img-element */
import React from "react";

const AdPlaceholder = () => {
  return (
    <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded border border-blue-500 bg-[#00143e] text-black hover:border-[#9abffb] hover:bg-[#353f75]">
      <a href="#" target="_blank">
        <img src="/available.webp" alt="Ad image" className="h-full w-full object-contain" />
      </a>
    </div>
  );
};

export default AdPlaceholder;
