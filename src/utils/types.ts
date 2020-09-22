export interface Block {
  address: string;
  blockHash: string;
  blockNumber: string;
  data: string;
  logIndex: string;
  removed: boolean;
  topics: string[];
  transactionHash: string;
  transactionIndex: string;
}

export interface Match {
  address: string;
  blockHash: string;
  blockNumber: string;
  watcher: string[];
}
