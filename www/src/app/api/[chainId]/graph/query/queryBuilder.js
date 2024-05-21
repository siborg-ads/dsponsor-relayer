import formRawQuery from "@/app/api/[chainId]/graph/query/queries/formRawQuery";

function queryBuilder(queryParams) {
  const method = queryParams?.method || "raw";
  if (method === "raw") {
    delete queryParams.method;
    return formRawQuery(queryParams.query);
  }

  return false;
}

export default queryBuilder;
