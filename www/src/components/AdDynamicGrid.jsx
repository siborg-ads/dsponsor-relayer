'use client';
import React, {useEffect, useState} from "react";
import Ad from "@/components/Ad";

const AdDynamicGrid = async ({ads, sizes}) => {

    let colSizes = [100, 100, 125, 175, 200];
    if(sizes && sizes.length === 5) {
        colSizes = sizes;
    }

    return (
        <div className="w-screen max-w-full">
            <div
                className={`
                grid grid-flow-row-dense
                gap-1 grow place-items-center
                grid-cols-[repeat(auto-fill,minmax(${colSizes[0]}px,1fr))]
                sm:grid-cols-[repeat(auto-fill,minmax(${colSizes[1]}px,1fr))]
                md:grid-cols-[repeat(auto-fill,minmax(${colSizes[2]}px,1fr))]
                lg:grid-cols-[repeat(auto-fill,minmax(${colSizes[3]}px,1fr))]
                xl:grid-cols-[repeat(auto-fill,minmax(${colSizes[4]}px,1fr))]
                `}>
                {ads.map((ad, index) => (
                    <Ad key={index} ad={ad}/>
                ))}
            </div>
            <div className="flex justify-end">
                    <span className="text-[0.65em] text-right pr-2 text-orange-300 hover:text-orange-500">
                        <a href="https://dsponsor.com" target="_blank" rel="noreferrer">
                            Powered by DSponsor
                        </a>
                    </span>
            </div>
        </div>
    );
};

export default AdDynamicGrid;
