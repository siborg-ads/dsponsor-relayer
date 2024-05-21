export default function formAdParametersQuery(formedQueryParts) {
  const query = `
    query {
      adParameters(
        ${formedQueryParts}
      ) {
        id
        base
        variants
        adOffers {
          adOffer {
            id
          }
          enable
        }
      }
    }`;

  return query;
}
