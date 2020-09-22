import axios from "axios";
import { Block } from "../utils/types";

class LogsWatcher {
  private URL: string;
  private blockNumber: number = 0;

  constructor(urlNode: string) {
    this.URL = urlNode;
  }
  private async getNextBlockNumber(diff: number) {
    const nBlock = await this.getLatestBlockNumber();
    let next = nBlock - diff;
    if (next === this.blockNumber) return next;
    if (this.blockNumber !== 0) {
      next = this.blockNumber + 1;
    }
    return next;
  }
  private async getLatestBlockNumber(): Promise<number> {
    const response = await axios.post(
      this.URL,
      {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_blockNumber",
        params: ["latest", false],
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return parseInt(response.data.result, 16);
  }
  private async getLogs(filterOptions: {
    fromBlock: string;
    toBlock: string;
  }): Promise<Block[]> {
    const response = await axios.post(
      this.URL,
      {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getLogs",
        params: [filterOptions],
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    switch (response.status) {
      case 200:
        return response.data.result;
      default:
        // ERROR FROM INFURA
        console.error(response.data);
        return [];
    }
  }

  public pollingLogs(diff: number, callback) {
    const checkLogs = async () => {
      const initBlock = await this.getNextBlockNumber(diff);

      if (initBlock !== this.blockNumber) {
        const listLogs = await this.getLogs({
          fromBlock: `0x${initBlock.toString(16)}`,
          toBlock: `0x${(initBlock + 1).toString(16)}`,
        });
        // Update the last block check
        this.blockNumber = initBlock;
        callback(listLogs, initBlock);
      }
      // start to check again
      setTimeout(checkLogs, 1000);
    };
    setTimeout(checkLogs, 1000);
  }
}

export default LogsWatcher;
