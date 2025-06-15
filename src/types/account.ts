export interface Account {
  accountId: string;
  name: string;
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewAccount {
  name: string;
  initialBalance: number;
  currency: string;
} 