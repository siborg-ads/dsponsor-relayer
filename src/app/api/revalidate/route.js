import { revalidatePath } from "next/cache";

export async function GET() {
//  request
  // const tags = request.nextUrl.searchParams.get("tags");
  let revalidated = 0;

  /*
  if (tags?.split(",")?.length) {
    for (const tag of tags.split(",")) {
      revalidateTag(tag);
      revalidated++;
    }
  }
  */
  revalidatePath("/api/8453/graph");
  revalidated++;

  return Response.json({ revalidated, now: Date.now() });
}
