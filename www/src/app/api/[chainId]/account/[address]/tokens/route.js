import {DSponsorSDK} from "@dsponsor/sdk";

export async function GET(
    request,
    context,
) {
    const {
        chainId,
        address
    } = context.params

    if(!chainId) {
        return new Response('No chainId provided', {
            status: 400
        })
    }

    if(!address || address.length !== 42 || !address.startsWith("0x")) {
        return new Response('Invalid address provided', {
            status: 400
        })
    }


    let sdk;
    let error;
    try {
        sdk = new DSponsorSDK({
            chain: {
                chainId,
                alchemyAPIKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
            },
        });
    } catch (e) {
        error = e?.message
    }

    let data = null;
    if(sdk && sdk?.chain?.alchemy){
        try {
            const nftsForOwner = await sdk.chain.alchemy.nft.getNftsForOwner(address);

            let possibleTokens = [];
            for (let nft of nftsForOwner.ownedNfts) {
                if (nft.tokenId) {
                    possibleTokens.push({
                        tokenId: nft.tokenId,
                        tokenUri: nft.tokenUri,
                        nftContractAddress: nft.contract.address,
                        ownerAddress: address,
                        name: nft.contract.name,
                        symbol: nft.contract.symbol,
                        balance: nft.balance,
                        timeLastUpdated: nft.timeLastUpdated,
                    });
                }
            }

            data = possibleTokens;
        } catch (e){
            error = e?.message
        }
    }

    return new Response(JSON.stringify({
        ...data,
        error,
    }, null, 4), {
        headers: {
            "content-type": "application/json",
        },
    });
}
