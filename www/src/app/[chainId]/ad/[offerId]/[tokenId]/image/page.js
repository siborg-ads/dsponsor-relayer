'use client';

import Image from "next/image";
import {useEffect, useState} from "react";
import fetchImageUrlActions from "@/app/[chainId]/ad/[offerId]/[tokenId]/image/fetchImageUrlActions";

const ImagePage = ({ params }) => {
    const { offerId, tokenId, chainId } = params;

    let [url, setUrl] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const url = await fetchImageUrlActions(chainId, offerId, tokenId);
            setUrl(url);
        }
        fetchData();

    }, []);


    if(!url){
        return <div>Loading...</div>
    }
    return (
        <Image
            src={url}
            width={500}
            height={500}
            alt="Ad Image"
        />
    );
}
export default ImagePage;
