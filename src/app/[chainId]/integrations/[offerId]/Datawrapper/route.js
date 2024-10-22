import config from "@/config";

export async function GET(request, context) {
  const { chainId, offerId } = (await context.params);
  const requestUrl = new URL(`${request.url}`);
  const searchParams = requestUrl.searchParams;

  const type = searchParams.get("type") || "grid";
  const adParameterIds = searchParams.get("adParameterIds")?.length
    ? searchParams.get("adParameterIds")
    : "imageURL-16:9,linkURL";
  const includeAvailable = searchParams.get("includeAvailable") === "false" ? false : true;
  const includeReserved = searchParams.get("includeReserved") === "false" ? false : true;

  const title = `${chainId}-${offerId}-${type}-${adParameterIds}-${includeAvailable}-${includeReserved}`;

  const chartFetch = await fetch(
    `https://api.datawrapper.de/v3/charts?order=DESC&orderBy=createdAt&limit=1000&offset=0&expand=false&search=${title}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.DATAWRAPPER_API_KEY}`
      }
    }
  );

  let {
    list: [chart]
  } = (await chartFetch.json()) || { list: [] };

  if (!chart) {
    const copyPOST = await fetch(
      `https://api.datawrapper.de/v3/charts/${process.env.DATAWRAPPER_TEMPLATE_ID}/copy`,

      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.DATAWRAPPER_API_KEY}`
        }
      }
    );

    const { id: chartId } = await copyPOST.json();

    const externalData = `${config[chainId].relayerURL}/api/${chainId}/ads/${offerId}/csv?type=${type}&adParameterIds=${adParameterIds}&includeAvailable=${includeAvailable}&includeReserved=${includeReserved}`;

    await fetch(`https://api.datawrapper.de/v3/charts/${chartId}`, {
      method: "PATCH",
      headers: {
        accept: "*/*",
        "content-type": "application/json",
        Authorization: `Bearer ${process.env.DATAWRAPPER_API_KEY}`
      },
      body: JSON.stringify({
        title,
        externalData
      })
    });

    const copyPUBLISH = await fetch(`https://api.datawrapper.de/v3/charts/${chartId}/publish`, {
      method: "POST",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${process.env.DATAWRAPPER_API_KEY}`
      }
    });

    const chartPUBLISH = await copyPUBLISH.json();

    chart = chartPUBLISH.data;
  }

  const { publicId, publicUrl, createdAt, lastModifiedAt } = chart;

  return new Response(
    JSON.stringify({ title, publicId, publicUrl, createdAt, lastModifiedAt }, null, 2),
    {
      headers: {
        "content-type": "application/json"
      }
    }
  );
}
