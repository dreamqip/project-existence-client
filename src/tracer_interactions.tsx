import { Transaction, TransactionResponse } from "ethers";
import { AddressLike } from "ethers/types/address";
import { NETWORK } from "./config";
import { getProvider, getReadOnlyProvider } from "./contract_interactions";

export let TRACER_LINK: string | null;
switch (NETWORK) {
  case "mainnet":
    TRACER_LINK = "https://rpcapi-tracing.fantom.network/"
    break;
  case "testnet":
    TRACER_LINK = "https://rpcapi-tracing.testnet.fantom.network/"
    break;
  case "fakenet":
    TRACER_LINK = null;
    break;
}

export type TracerError = {
  error: string;
  code?: number;
  message?: string;
}
export type TracerTransaction = {
  functionSelector: string;
  from: string,
  to: string
  timestamp: number,
  rawInput: string,
}

let requestId = 1;
export async function getActivityTransactions(to: string, blocks = 10000, fromBlock?: number) {
  if (blocks < 1) throw new Error("blocks less than 1");
  if (TRACER_LINK == null) return { error: "no tracer" } as TracerError;
  if (to == "") return { error: "no address" } as TracerError;
  if (!to.startsWith("0x")) to = "0x" + to;
  to = to.toLowerCase();
  if (fromBlock == undefined) {
    fromBlock = await getReadOnlyProvider().getBlockNumber() - blocks
  }
  try {
    let response = await fetch(TRACER_LINK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        method: "trace_filter",
        params: [{
          fromBlock: "0x" + (fromBlock).toString(16),
          toBlock: "0x" + (fromBlock + blocks).toString(16),
          toAddress: [to],
        }],
        id: requestId,
        jsonrpc: "2.0"
      }),
    })
    requestId++;
    let responseBody = await response.json();
    if (responseBody.error) {
      if (responseBody.error.code && responseBody.error.message) {
        return { error: "rpc-api error", code: responseBody.error.code, message: responseBody.error.message } as TracerError;
      }
      return { error: "error" } as TracerError;
    } else if (responseBody.result) {
      let txs: Array<TracerTransaction> = await Promise.all((responseBody.result as Array<any>).filter((item, index) => {
        if (item.action?.callType != "call") return false;
        return true;
      }).map(async (item, index) => {
        return {
          from: item.action.from,
          to: item.action.to,
          functionSelector: item.action.input.slice(2, 10),
          timestamp: (await getReadOnlyProvider()?.getBlock(item.blockHash))?.timestamp,
          rawInput: item.action.input,
        } as TracerTransaction;
      }));
      return { error: null, transactions: txs }
    } else {
      return { error: "error" } as TracerError;
    }
  } catch (error: any) {
    return { error: "error" } as TracerError;
  }
}