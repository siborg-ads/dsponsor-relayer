function formAdProposalsQuery(formedQueryParts) {
    const query = `
    query {
      adProposals(
        ${formedQueryParts}
      ) {
        id
        data
        status
        rejectReason
        creationTimestamp
        lastUpdateTimestamp
        token {
          tokenId
        }
        adParameter {
          id
          base
          variants
        }
      
        status
    }
    }`;

    return query;
}

export default formAdProposalsQuery;
