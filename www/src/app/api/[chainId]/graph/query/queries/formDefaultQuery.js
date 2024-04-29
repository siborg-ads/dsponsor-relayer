function formDefaultQuery(method, formedQueryParts, formedReturnParts) {
    const query = `
      query {
          ${method}(
            ${formedQueryParts}
          ) {
            ${formedReturnParts}
          }
    }`;

    return query;
}

export default formDefaultQuery;
