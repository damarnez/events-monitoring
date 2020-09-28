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

export interface Event {
  name: string;
  signature: string;
  counter: number;
}

export interface Watcher {
  id: string;
  token: string;
  email: string;
  address: string;
  event: Event;
  validated: boolean;
  timestamp: number;
}

export interface Historic {
  blockHash: string;
  blockNumber: string;
  address: string;
  timestamp: number;
  signature: string;
  condition: number;
  userId: string;
  email: string;
  id: string;
}

export type StoredData = Watcher | Historic;

export interface EventConfig {
  [key: string]: string[];
}
