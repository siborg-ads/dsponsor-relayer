import {DSponsorSDK} from "@dsponsor/sdk";
import queryBuilder from "@/app/api/[chainId]/graph/query/queryBuilder";
import {cacheExchange, createClient, fetchExchange} from "urql";

export async function GET(
    request,
    context,
) {
    const {
        chainId,
        address
    } = context.params

    if (!chainId) {
        return new Response('No chainId provided', {
            status: 400
        })
    }

    if (!address || address.length !== 42 || !address.startsWith("0x")) {
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
                alchemyAPIKey: process.env.NEXT_ALCHEMY_API_KEY
            },
        });
    } catch (e) {
        error = e?.message
    }

    let data = null;
    let tokens = [];
    let response = [];
    let client;

    if (sdk && sdk?.chain.graphApiUrl) {
        const url = sdk.chain.graphApiUrl;
        client = createClient({
            url,
            exchanges: [cacheExchange, fetchExchange]
        });
    }

    if (sdk && sdk?.chain?.alchemy) {
        try {
            const nftsForOwner = await sdk.chain.alchemy.nft.getNftsForOwner(address);

            let possibleTokens = [];
            for (let nft of nftsForOwner.ownedNfts) {
                if (nft.tokenId) {
                    // console.log(nft);
                    possibleTokens.push({
                        tokenId: nft.tokenId,
                        tokenUri: nft.tokenUri,
                        nftContractAddress: nft.contract.address.toLowerCase(),
                        ownerAddress: address,
                        name: nft.contract.name,
                        symbol: nft.contract.symbol,
                        balance: nft.balance,
                        timeLastUpdated: nft.timeLastUpdated,
                    });

                    // If we have a tokenUri, we can fetch the metadata

                }
            }

            // Using tokenId and nftContractAddress
            const queryParams = {
                where: {
                    nftContract_in: possibleTokens.map(({nftContractAddress}) => nftContractAddress),
                }
            };

            // Debug: only show the last token
            //For every token, we can fetch the metadata
            const computedQuery = queryBuilder(queryParams)

            if (client?.query) {
                const queryRequest = await client.query(computedQuery).toPromise()

                if (queryRequest?.data) {
                    if (queryRequest.data?.adOffers) {
                        for (let adOffer of queryRequest.data.adOffers) {
                            const nftContractAddress = adOffer.nftContract.id.toLowerCase();
                            const nftTokens = adOffer.nftContract.tokens;
                            // We only keep the tokens that match the possibleTokens
                            const tokensForContract = nftTokens.filter(token => {
                                return possibleTokens.find(possibleToken => {
                                    return possibleToken.tokenId === token.tokenId && possibleToken.nftContractAddress === nftContractAddress;
                                });
                            });
                            adOffer.nftContract.tokens = tokensForContract;
                            response.push(adOffer);
                        }
                    }
                }
            }
        } catch (e) {
            error = e?.message
        }
    }

    if(error) {
        console.trace("GET /api/graph/[chainId]", {
            error,
        });
        return new Response(JSON.stringify({
            error: error?.message,
        }, null, 4), {
            headers: {
                "content-type": "application/json",
            },
        });
    }

    return new Response(JSON.stringify(response, null, 4), {
        headers: {
            "content-type": "application/json",
        },
    });

}
