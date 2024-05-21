const queryBuilder = require("./queryBuilder");
const { createClient, cacheExchange, fetchExchange } = require("urql");

const queryParams = {
  limit: 10
};

const APIURL = "https://api.studio.thegraph.com/proxy/65744/dsponsor-sepolia/version/latest/";
const client = createClient({
  url: APIURL,
  exchanges: [cacheExchange, fetchExchange]
});

const data = client.query(queryBuilder(queryParams)).toPromise();

data.then((result) => {
  console.log(result);
});
