export default function getValidatedAdProposalsQuery({offerId}) {
    return `
    query {
         adProposals(
            first:1,
            where:{
                adOffer_:{id:"${offerId}"},
                status: CURRENT_ACCEPTED,
                adParameter_:{base: "imageURL"}
            },
            orderBy: creationTimestamp,
            orderDirection: desc
        ) {
        id
        
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
