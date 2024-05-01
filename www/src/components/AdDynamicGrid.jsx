'use client';
import React, {useEffect, useState} from "react";
import Ad from "@/components/Ad";

const AdDynamicGrid = async ({ads}) => {
    return (
        <div className="w-screen max-w-full">
            <div
                className="grid grid-flow-row-dense grid-cols-[repeat(auto-fill,minmax(175px,1fr))] gap-1 grow place-items-center">
                {ads.map((ad, index) => (
                    <Ad key={index} ad={ad}/>
                ))}
            </div>
            {/* Footer */}
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
