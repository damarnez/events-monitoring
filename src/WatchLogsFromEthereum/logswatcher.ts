import axios from "axios";
import { Block } from "../utils/types";

class LogsWatcher {
  private URLS: string[];
  private node: number = 0;
  private diff: number = 15;

  constructor(urlNode: string[], diff: number) {
    this.URLS = urlNode;
    this.diff = diff;
  }
  private async calculateFromBlock(actualBlock: number, blockNumber: number) {
    let next = actualBlock - this.diff;
    if (blockNumber === 0) return next;
    if (next < blockNumber) return -1;
    return blockNumber;
  }
  private async calculateToBlock(actualBlock: number, fromBlock: number) {
    if (fromBlock < 0) return fromBlock;
    const currentDiff = actualBlock - fromBlock;
    // If the different is bigger than 5 blocks
    if (currentDiff > this.diff + 5) {
      // Sync data
      console.log("SYNC BLOCKS : from ", fromBlock, " to ", fromBlock + 5);
      return fromBlock + 5;
    } else {
      return fromBlock;
    }
  }
  public async getLatestBlockNumber(): Promise<number> {
    try {
      const response = await axios.post(
        this.URLS[this.node],
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
    } catch (error) {
      if (error?.response?.status === 429) {
        console.log("Limit reached switch the token ");
        if (this.node === 0) this.node = 1;
        else this.node = 0;
        return await this.getLatestBlockNumber();
      }
      throw error;
    }
  }
  private async getLogs(filterOptions: {
    fromBlock: string;
    toBlock: string;
  }): Promise<Block[]> {
    try {
      const response = await axios.post(
        this.URLS[this.node],
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
          console.error("[getLogs]", response.data);
          return [];
      }
    } catch (error) {
      if (error?.response?.status === 429) {
        console.log("API : Limit reached switch the token ");
        if (this.node === 0) this.node = 1;
        else this.node = 0;
        return await this.getLogs(filterOptions);
      }
      throw error;
    }
  }

  public async pollingLogs(blockNumber: number) {
    const actualBlock = await this.getLatestBlockNumber();

    const fromBlock = await this.calculateFromBlock(actualBlock, blockNumber);
    const toBlock = await this.calculateToBlock(actualBlock, fromBlock);

    let listLogs = [];
    if (fromBlock > -1) {
      listLogs = await this.getLogs({
        fromBlock: `0x${fromBlock.toString(16)}`,
        toBlock: `0x${toBlock.toString(16)}`,
      });
    }
    return {
      block: toBlock,
      logs: listLogs,
    };
  }
}

export default LogsWatcher;
