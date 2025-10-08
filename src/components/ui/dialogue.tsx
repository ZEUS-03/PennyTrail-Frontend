// components/TransactionModal.tsx

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { Button } from "./button";
import { CATEGORIES } from "@/constants";

type Transaction = {
  _id?: string;
  amount: number;
  currency: string;
  transactionType: string;
  merchant: string;
  transactionDate: string;
  verified: boolean;
  tags?: string[];
};

type Error = {
  amount: string;
  transactionType: string;
  merchant: string;
  transactionDate: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Transaction) => void;
  defaultValues?: Transaction;
};

export default function TransactionModal({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: Props) {
  const [error, setError] = useState<Error>({
    amount: "",
    transactionType: "",
    merchant: "",
    transactionDate: "",
  });
  const [formData, setFormData] = useState<Transaction>({
    amount: 0,
    currency: "INR",
    transactionType: "bill_payment",
    merchant: "",
    transactionDate: new Date().toISOString().split("T")[0],
    verified: false,
    tags: [],
  });

  useEffect(() => {
    if (defaultValues) {
      defaultValues.transactionDate = new Date(defaultValues.transactionDate)
        .toISOString()
        .split("T")[0];
    }
    setFormData(
      defaultValues || {
        amount: 0,
        currency: "INR",
        transactionType: "bill_payment",
        merchant: "",
        transactionDate: new Date().toISOString().split("T")[0],
        verified: false,
        tags: [],
      }
    );
    setError({
      amount: "",
      transactionType: "",
      merchant: "",
      transactionDate: "",
    });
  }, [defaultValues, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTransactionTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      transactionType: e.target.value,
    }));
  };
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors["amount"] = "Amount must be greater than 0.";
    }

    if (!formData.transactionType) {
      newErrors["transactionType"] = "Transaction type is required.";
    }

    if (!formData.merchant) {
      newErrors["merchant"] = "Merchant is required.";
    }

    if (!formData.transactionDate) {
      newErrors["transactionDate"] = "Transaction date is required.";
    }

    // If any error exists, stop submission
    if (Object.keys(newErrors).length > 0) {
      setError((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    setError({
      amount: "",
      transactionType: "",
      merchant: "",
      transactionDate: "",
    });

    console.log(formData, "formData");
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg z-50">
          <Dialog.Title className="text-lg font-semibold mb-4">
            {defaultValues ? "Edit Transaction" : "Create Transaction"}
          </Dialog.Title>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                className="w-full border px-2 py-1 rounded"
              />
              {error.amount && (
                <p className="text-sm text-red-500 mt-1">{error.amount}</p>
              )}
            </div>

            {/* <div>
              <label className="block text-sm font-medium">Currency</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full border px-2 py-1 rounded"
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div> */}

            <div>
              <label className="block text-sm font-medium">
                Transaction Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.transactionType}
                onChange={handleTransactionTypeChange}
                className="w-full border px-2 py-1 rounded"
              >
                {Object.entries(CATEGORIES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              {error.transactionType && (
                <p className="text-sm text-red-500 mt-1">
                  {error.transactionType}
                </p>
              )}

              {/* <label className="block text-sm font-medium">
                Transaction Type
              </label>
              <input
                type="text"
                name="transactionType"
                value={formData.transactionType}
                onChange={handleChange}
                placeholder="e.g., bill_payment"
                required
                className="w-full border px-2 py-1 rounded"
              /> */}
            </div>

            <div>
              <label className="block text-sm font-medium">
                Merchant <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="merchant"
                value={formData.merchant}
                onChange={handleChange}
                className="w-full border px-2 py-1 rounded"
              />
              {error.merchant && (
                <p className="text-sm text-red-500 mt-1">{error.merchant}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">
                Transaction Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="transactionDate"
                value={formData.transactionDate}
                onChange={handleChange}
                className="w-full border px-2 py-1 rounded"
              />
              {error.transactionDate && (
                <p className="text-sm text-red-500 mt-1">
                  {error.transactionDate}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  className="px-4 py-1 bg-red-600 hover:bg-red-500 rounded"
                >
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" className="px-4 py-1  text-white rounded">
                Save
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
