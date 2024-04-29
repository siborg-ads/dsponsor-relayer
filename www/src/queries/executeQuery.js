// Execute graphql query
// import {cacheExchange, createClient, fetchExchange} from "urql";
import {gql} from "@apollo/client/core/core.cjs";


export default async function executeQuery(url, query, variables) {
    // const client = createClient({
    //     url,
    //     exchanges: [cacheExchange, fetchExchange]
    // })
    //
    // const result = await client.query(query, variables).toPromise();
    // if(result.data) {
    //     return result.data;
    // }

    const request = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({query: query, variables: variables}),
    });
    const result = await request.json();
    console.log("result", result);
    if(result.data) {
        return result.data;
    }

    console.error(result);

    return result;
}
