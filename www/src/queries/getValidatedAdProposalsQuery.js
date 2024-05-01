export default function getValidatedAdForOfferQuery({offerId}) {
    return `
    query {
           adOffers(where: { id: "${parseInt(offerId)}" }) {
            metadataURL
            initialCreator
            creationTimestamp
            adParameters(where: { enable: true }) {
              enable
              adParameter {
                id 
                base
                variants
              }
            }
        
            nftContract {
              id 
              maxSupply
              
              name
              contractURI
              
              allowList 
              royaltyBps
              prices(where: { enabled: true }) {
                currency # ERC20 smart contract
                amount # wei, mind decimals() function to transform in human readable value !
                enabled
              }
        
              # to replace by $tokenId
              tokens { 
                tokenId
                mint {
                  transactionHash 
                  to
                  tokenData
                }
                setInAllowList 
                currentProposals {
                  adParameter {
                    id
                    base
                    variants
                  }
                  acceptedProposal {
                    data
                  }
                  pendingProposal {
                    id
                    data
                  }
                  rejectedProposal {
                    data
                    rejectReason
                  }
                }
        
                # proposal submissions history
                allProposals(orderBy: creationTimestamp, orderDirection: desc) {
                  adParameter {
                    id
                  }
                  status
                  data
                  rejectReason
                  creationTimestamp
                  lastUpdateTimestamp
                }
              }
            }
        }
    }`;
}
