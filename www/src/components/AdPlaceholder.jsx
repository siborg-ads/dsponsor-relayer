import React from "react";

const AdPlaceholder = () => {
    return (
        <div
            className="aspect-square w-full border border-blue-500 overflow-hidden flex justify-center items-center bg-[#00143e] text-black rounded hover:bg-[#353f75] hover:border-[#9abffb]">
            <a href="#" target="_blank">
                <img src="/available.webp" alt="Ad image" className="object-contain w-full h-full"/>
            </a>
        </div>
    );
};

export default AdPlaceholder;
