import formAdProposalsQuery from "@/app/api/[chainId]/graph/query/queries/formAdProposalsQuery";
import formDefaultQuery from "@/app/api/[chainId]/graph/query/queries/formDefaultQuery";
import formAdOffersQuery from "@/app/api/[chainId]/graph/query/queries/formAdOffersQuery";
import createQueryPart from "@/app/api/[chainId]/graph/query/queries/createQueryPart";
import formAdParametersQuery from "@/app/api/[chainId]/graph/query/queries/formAdParametersQuery";

function queryBuilder(queryParams) {
    const method = queryParams?.method || 'adOffers';
    delete queryParams.method;
    const queryKeys = ['first', 'skip', 'orderDirection', 'block', 'where', 'orderBy']
    let queryParts = queryKeys
        .filter(key => queryParams[key])
        .map(key => createQueryPart(key, queryParams[key]));

    if (queryParts.length === 0) {
        queryParts.push('first: 10');
    }

    switch (method) {
        case 'adOffers':
            return formAdOffersQuery(queryParts.join(',\n'));
        case 'adProposals':
            return formAdProposalsQuery(queryParts.join(',\n'));
        case 'adParameters':
            return formAdParametersQuery(queryParts.join(',\n'));
        default:
            return formDefaultQuery(method, queryParts.join(',\n'));
    }

}

export default queryBuilder;
