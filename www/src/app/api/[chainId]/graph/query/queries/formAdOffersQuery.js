function formAdOffersQuery(formedQueryParts) {
  const query = `
    query {
      adOffers(
        ${formedQueryParts}
      ) {
        id
        disable
        metadataURL
        name
        initialCreator
        validators
        admins
        creationTimestamp
        adParameters(where: { enable: true }) {
            adParameter {  
                id 
                base
                variants
            }
        }
        nftContract {
          id
          maxSupply
          prices(where: { enabled: true }) {
            currency
            amount
            enabled
          }
          tokens {
            tokenId
            setInAllowList
            mint {
              to
              blockTimestamp
              tokenData
            }
            currentProposals {
              token {
                tokenId
              }
              adParameter {
                id
                variants
                base
              }
              acceptedProposal {
                id
                data
              }
              pendingProposal {
                id
                data
              }
              rejectedProposal {
                id
                data
                rejectReason
              }
            }
            allProposals(orderBy: creationTimestamp, orderDirection: desc) {
              token {
                tokenId
              }
              adParameter {
                id
                variants
                base
              }
              data
              status
              rejectReason
              creationTimestamp
              lastUpdateTimestamp
            }
          }
        }
      }
    }
  `

  return query
}

export default formAdOffersQuery