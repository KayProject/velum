import { RpcProvider } from "starknet";
import { env } from "../lib/env.ts";

const config = env();
const provider = new RpcProvider({ nodeUrl: config.nodeUrl });
const velumAddress = process.env.MAINNET_VELUM_ADDRESS!;

async function main() {
  const classHash = await provider.getClassHashAt(velumAddress);
  console.log("class hash:", classHash);
  const contractClass = await provider.getClassByHash(classHash);
  const abi = typeof contractClass.abi === "string" ? JSON.parse(contractClass.abi) : contractClass.abi;
  for (const entry of abi) {
    if (entry.type === "interface") {
      for (const item of entry.items) {
        if (item.name === "privacy_invoke_with_computation" || item.name === "privacy_compute") {
          console.log(JSON.stringify(item, null, 2));
        }
      }
    }
  }
}

main();
