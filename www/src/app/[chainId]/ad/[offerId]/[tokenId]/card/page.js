'use server';
import Image from "next/image";
import fetchCardUrlActions from "@/app/[chainId]/ad/[offerId]/[tokenId]/card/fetchCardUrlActions";

const ImagePage = async ({ params }) => {
    const { offerId, tokenId, chainId } = params;
    const response = await fetchCardUrlActions(chainId, offerId, tokenId);

    const url = response.find(ad => ad.adParameter.base === 'linkURL').data
    const imageSrc = response.find(ad => ad.adParameter.base === 'imageURL').data

    if(!url){
        return <div>Loading...</div>
    }
    return (
        <a
            href={url}
            >
            <Image
                src={imageSrc}
                width={500}
                height={500}
                alt="Ad Image"
            />
        </a>
    );
}
export default ImagePage;
