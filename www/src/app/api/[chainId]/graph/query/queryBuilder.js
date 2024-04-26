function createQueryPart(key, value) {
    if (key === 'block') {
        // Handle block number as a numerical value
        return `${key}: { number: ${parseInt(value, 10)} }`;
    } else if (key === 'orderDirection' || key === 'orderBy') {
        // Keep order-related strings
        return `${key}: "${value}"`;
    } else if (key === 'where') {
        // Special handling for 'where' clause
        try {
            const objValue = typeof value === 'string' ? JSON.parse(decodeURIComponent(value)) : value;
            const whereClause = JSON.stringify(objValue).replace(/"([^"]+)":/g, '$1:');
            return `${key}: ${whereClause}`;
        } catch (e) {
            console.error('Failed to parse where clause:', value);
            return `${key}: {}`; // Fallback to an empty object on failure
        }
    } else if (key === 'first' || key === 'skip') {
        // Ensure 'first' and 'skip' are treated as integers
        const numValue = parseInt(value, 10);
        if (isNaN(numValue)) {
            console.warn(`Expected a number for ${key}, but got: ${value}`);
            return `${key}: 0`; // Fallback to 0 if not a valid number
        }
        return `${key}: ${numValue}`;
    } else {
        // Handle booleans and arrays
        if (typeof value === 'boolean' || Array.isArray(value)) {
            return `${key}: ${JSON.stringify(value).replace(/"([^"]+)":/g, '$1:')}`;
        }

        // For all other cases, assume the value is a string
        return `${key}: "${value}"`;
    }
}
function queryBuilder(queryParams) {
    const queryKeys = ['first', 'skip', 'orderDirection', 'block', 'where', 'orderBy']
    let queryParts = queryKeys
        .filter(key => queryParams[key])
        .map(key => createQueryPart(key, queryParams[key]));

    if (queryParts.length === 0) {
        queryParts.push('first: 10');
    }

    const query = `
    query {
      adOffers(
        ${queryParts.join(',\n')}
      ) {
        id
        disable
        metadataURL
        name
        initialCreator
        validators
        admins
        creationTimestamp
        adParameters {
            adParameter {  
                id 
            }
        }
        nftContract {
          id
          maxSupply
          prices {
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
            allProposals {
              token {
                tokenId
              }
              adParameter {
                id
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
  `;

    return query;
}

export default queryBuilder;
