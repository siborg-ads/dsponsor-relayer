import { unstable_after as after } from "next/server";
import { revalidateTag } from "next/cache";
import config from "@/config";
import { getCurrencyInfos } from "@/utils";

export async function GET() {
  revalidateTag("cron");

  after(() =>
    Promise.all(
      Object.keys(config).map(async (chainId) => {
        const { smartContracts } = config[chainId];

        await Promise.all(
          Object.keys(smartContracts).map(async (contract) => {
            const { address, symbol } = smartContracts[contract];
            if (symbol) await getCurrencyInfos(chainId, address);
          })
        );
      })
    )
  );

  return Response.json({ cronExec: new Date() });
}
