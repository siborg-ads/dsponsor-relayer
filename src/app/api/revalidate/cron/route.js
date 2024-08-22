import { revalidateTag } from "next/cache";

export async function GET() {
  revalidateTag("cron");
  return Response.json({ cronExec: new Date() });
}
