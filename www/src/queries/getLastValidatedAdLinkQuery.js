export default function getLastValidatedAdLinkQuery({offerId, tokenId}) {
    return `
    query {
         adProposals(
            first:1,
            where:{
                adOffer_:{id:"${offerId}"},
                token_:{
                  tokenId:"${tokenId}"
                }
                status: CURRENT_ACCEPTED,
                adParameter_:{base: "linkURL"}
            },
            orderBy: creationTimestamp,
            orderDirection: desc
        ) {
        id
        data
        token {
          tokenId
        }
        adOffer {
          id 
        }
        
         adParameter {
          id
          base
          variants
        }
        
        data
        status
        rejectReason
        creationTimestamp
        lastUpdateTimestamp
       
        status
        }
    }`;
}
