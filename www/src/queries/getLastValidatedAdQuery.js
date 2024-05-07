export default function getLastValidatedAdQuery({offerId, tokenId}) {
    return `
    query {
         adProposals(
            where:{
                adOffer_:{id:"${offerId}"},
                token_:{
                  tokenId:"${tokenId}"
                }
                status: CURRENT_ACCEPTED,
                adParameter_:{base_in:["imageURL", "linkURL"]}
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
