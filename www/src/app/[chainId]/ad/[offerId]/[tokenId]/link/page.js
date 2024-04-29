'use client';

import {useEffect, useState} from "react";
import fetchLinkUrlActions from "@/app/[chainId]/ad/[offerId]/[tokenId]/link/fetchLinkUrlActions";

const ImagePage = ({ params }) => {
    const { offerId, tokenId, chainId } = params;

    let [url, setUrl] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const url = await fetchLinkUrlActions(chainId, offerId, tokenId);
            setUrl(url);
        }
        fetchData();

    }, []);

    if(!url){
        return <div></div>
    }

    // redirect to the link
    window.location.href = url;
}
export default ImagePage;
