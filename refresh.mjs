import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseSignal } from "./parse-signal.mjs";

const source = "https://www.mql5.com/en/signals/2397535";
const destination = fileURLToPath(new URL("./public/live.json", import.meta.url));

export async function refreshAccount(output = destination, request = fetch) {
  const response = await request(source, {
    redirect: "error",
    signal: AbortSignal.timeout(25_000),
    headers: { Accept: "text/html", "Accept-Language": "en", "User-Agent": "OTS-Live-Account-Feed/1.0" },
  });
  if (!response.ok || !/^text\/html\b/i.test(response.headers.get("content-type") || "")) {
    throw new Error("MQL5 did not return its public HTML report (HTTP " + response.status + ")");
  }
  const metrics = parseSignal(await response.text());
  const record = { ...metrics, refreshedAt: new Date().toISOString(), sourceUrl: source };
  const temp = output + "." + process.pid + ".tmp";
  await mkdir(dirname(output), { recursive: true });
  await writeFile(temp, JSON.stringify(record, null, 2) + "\n", { flag: "wx" });
  await rename(temp, output);
  return record;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const record = await refreshAccount();
  console.log("Validated the public OTS account at " + record.refreshedAt);
}
