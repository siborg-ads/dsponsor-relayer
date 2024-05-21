export default async function executeQuery(url, query, variables) {
  const request = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 180 }
  });
  const result = await request.json();
  if (result.data) {
    return result.data;
  }

  return result;
}
