function formDefaultQuery(method, formedQueryParts) {
    const query = `
      query {
          ${method}(
            ${formedQueryParts}
          ) {
            id
          }
    }`;

    return query;
}

export default formDefaultQuery;
