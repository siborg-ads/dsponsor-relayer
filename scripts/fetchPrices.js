async function fetchHistoricalPrices(coingeckoId) {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/${coingeckoId}/market_chart?vs_currency=usd&days=90&interval=daily&precision=6`,
    {
      headers: {
        method: "GET",
        "Content-Type": "application/json",
        "x-cg-demo-api-key": process.env.COINGECKO_API_KEY
      }
    }
  );
  const json = await res.json();

  const pricesPerDate = { [coingeckoId]: {} };

  json.prices.forEach((price) => {
    const date = new Date(price[0]);
    const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const priceValue = price[1];
    pricesPerDate[coingeckoId][formattedDate] = priceValue;
  });

  console.log(JSON.stringify(pricesPerDate, null, 2));
}
// COINGECKO_API_KEY=CG-xxxxxxxxxxx node scripts/fetchPrices.js > usdPrices.json
fetchHistoricalPrices("weth").catch((e) => console.error("error ", e));
