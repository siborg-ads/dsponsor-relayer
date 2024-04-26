function formAdProposalsQuery(formedQueryParts) {
  const query = `
    query {
      adProposals(
        ${formedQueryParts}
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
    }`

  return query
}

export default formAdProposalsQuery
