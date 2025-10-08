import axios from "axios";
import { protectedApi } from "./api";
import { emailSyncPayload } from "@/types";

type transactionEditPayload = {
  amount?: number;
  transactionType?: string;
  TransactionDate?: string;
  merchant?: string;
};

export const transactionService = {
  syncTransactions: (payload: emailSyncPayload) => {
    return protectedApi.post(import.meta.env.VITE_API_EMAIL_SYNC_URL, payload);
  },
  getPastTransactions: () => {
    return protectedApi.get(import.meta.env.VITE_API_TRANSACTION_URL);
  },
  getTransactions: (queryString: string) => {
    return protectedApi.get(
      import.meta.env.VITE_API_TRANSACTIONAL_PAGINATION + queryString || ""
    );
  },
  editTransaction: (transactionId: string, data: transactionEditPayload) => {
    return protectedApi.put(
      import.meta.env.VITE_API_TRANSACTION_EDIT_DELETE + transactionId,
      data
    );
  },
  deleteTransaction: (transactionId: string) => {
    return protectedApi.delete(
      import.meta.env.VITE_API_TRANSACTION_EDIT_DELETE + transactionId
    );
  },
  addTransaction: (data: object) => {
    return protectedApi.post(
      import.meta.env.VITE_API_TRANSACTION_EDIT_DELETE,
      data
    );
  },
};
