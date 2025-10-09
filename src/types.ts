import { CATEGORIES } from "./constants";

export type emailSyncPayload = {
  maxResults: number;
  syncAll: boolean;
};

export type Transaction = {
  _id: string;
  merchant: string;
  amount: number;
  transactionType: string;
  transactionDate: string;
  userId: string;
  currency: string;
};

export type TypeStat = {
  _id: keyof typeof CATEGORIES; // or just string if you're unsure
  totalAmount: number;
  count: number;
};

export type weekDataType = {
  _id: string;
  totalAmount: number;
};

export type User = {
  id: string;
  email: string;
  name: string;
  picture: string;
  totalEmails: number;
  transactionalEmails: number;
  lastSyncDate: string;
  syncInProgress: boolean;
};

export interface PastMonthTransactions {
  lastMonthStats:
    | [
        {
          _id: string | null;
          totalAmount: number;
          transactions: Array<Transaction>;
        }
      ]
    | [];
  monthlyStats:
    | [
        {
          _id: {
            month: number;
            type: string;
          };
          totalAmount: number;
          count: number;
        }
      ]
    | [];
  totalStats:
    | [
        {
          _id: string;
          totalAmount: number;
          count: number;
        }
      ]
    | [];
  typeStats: [TypeStat] | [];
  weekData: [weekDataType] | [];
  year: number | null;
}
