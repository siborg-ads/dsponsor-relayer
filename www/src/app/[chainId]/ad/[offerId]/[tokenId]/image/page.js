'use server';

import Image from "next/image";
import fetchImageUrlActions from "@/app/[chainId]/ad/[offerId]/[tokenId]/image/fetchImageUrlActions";

const ImagePage = async ({ params }) => {
    const { offerId, tokenId, chainId } = params;
    const url = await fetchImageUrlActions(chainId, offerId, tokenId);

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
