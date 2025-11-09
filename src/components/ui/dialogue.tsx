import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { Button } from "./button";
import { CATEGORIES } from "@/constants";
import {
  X,
  Edit3,
  Mail,
  IndianRupee,
  Calendar,
  Store,
  Tag,
  Loader2,
} from "lucide-react";
import {
  classifyTransaction,
  extractTransaction,
} from "@/services/classification";
import { toast } from "./use-toast";

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
  emailContent: string;
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
  const [activeTab, setActiveTab] = useState<"manual" | "email">("manual");
  const [loading, setLoading] = useState(false);
  const [emailContent, setEmailContent] = useState("");
  const [error, setError] = useState<Error>({
    amount: "",
    transactionType: "",
    merchant: "",
    transactionDate: "",
    emailContent: "",
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
      setActiveTab("manual");
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
    setEmailContent("");
    setError({
      amount: "",
      transactionType: "",
      merchant: "",
      transactionDate: "",
      emailContent: "",
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

  const parseEmailContent = async () => {
    try {
      setLoading(true);
      if (!emailContent.trim()) {
        setError((prev) => ({
          ...prev,
          emailContent: "Please paste email content",
        }));
        return;
      }
      // Classify transaction
      const emailPayload = {
        subject: "",
        body: emailContent,
        from: "",
      };
      const { category } = await classifyTransaction(emailPayload);
      if (category === "transactional") {
        const payload = { email_text: emailContent, filters: {} };
        const data = await extractTransaction(payload);
        if (data && data.final_amount) {
          setFormData((prev) => ({
            ...prev,
            amount: data.final_amount,
            merchant: data.merchant,
            transactionDate: data.transaction_date,
          }));
          toast({
            title: "Details Extracted Successfully",
            description:
              "The transaction details have been extracted successfully. Please review and confirm.",
            variant: "success",
          });
          setActiveTab("manual");
        } else {
          setError((prev) => ({
            ...prev,
            emailContent:
              "Could not extract transaction details. Please check the email content or enter details manually.",
          }));
          toast({
            title: "Invalid Email Content",
            description:
              "The provided email content does not appear to be a transaction email. Please check and try again.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Invalid Email Content",
          description:
            "The provided email content does not appear to be a transaction email. Please check and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Extraction Failed",
        description:
          "An error occurred while extracting transaction details. Please try again.",
        variant: "destructive",
      });
      console.log(error);
    } finally {
      setLoading(false);
    }
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

    if (Object.keys(newErrors).length > 0) {
      setError((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    setError({
      amount: "",
      transactionType: "",
      merchant: "",
      transactionDate: "",
      emailContent: "",
    });

    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl z-50 animate-in fade-in zoom-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-5 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-xl font-bold text-white flex items-center gap-2">
                {defaultValues ? (
                  <>
                    <Edit3 className="w-5 h-5" />
                    Edit Transaction
                  </>
                ) : (
                  <>
                    <IndianRupee className="w-5 h-5" />
                    Add New Transaction
                  </>
                )}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-white/80 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {!defaultValues && (
            <div className="flex border-b border-slate-200 bg-slate-50">
              <button
                type="button"
                onClick={() => setActiveTab("manual")}
                className={`flex-1 px-6 py-4 font-semibold transition-all relative ${
                  activeTab === "manual"
                    ? "text-teal-600 bg-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  <span>Manual Entry</span>
                </div>
                {activeTab === "manual" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-600 to-emerald-600" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("email")}
                className={`flex-1 px-6 py-4 font-semibold transition-all relative ${
                  activeTab === "email"
                    ? "text-teal-600 bg-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>From Email</span>
                </div>
                {activeTab === "email" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-600 to-emerald-600" />
                )}
              </button>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="p-6">
            {/* Manual Entry Tab */}
            {activeTab === "manual" && (
              <div className="space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <IndianRupee className="w-4 h-4 text-teal-600" />
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">
                      ₹
                    </span>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full border-2 border-slate-200 pl-8 pr-4 py-3 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all outline-none"
                    />
                  </div>
                  {error.amount && (
                    <p className="text-sm text-red-500 mt-1.5 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full" />
                      {error.amount}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Tag className="w-4 h-4 text-teal-600" />
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.transactionType}
                    onChange={handleTransactionTypeChange}
                    className="w-full border-2 border-slate-200 px-4 py-3 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all outline-none bg-white"
                  >
                    {Object.entries(CATEGORIES).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                  {error.transactionType && (
                    <p className="text-sm text-red-500 mt-1.5 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full" />
                      {error.transactionType}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Store className="w-4 h-4 text-teal-600" />
                    Merchant <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="merchant"
                    value={formData.merchant}
                    onChange={handleChange}
                    placeholder="e.g., Amazon, Swiggy, etc."
                    className="w-full border-2 border-slate-200 px-4 py-3 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all outline-none"
                  />
                  {error.merchant && (
                    <p className="text-sm text-red-500 mt-1.5 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full" />
                      {error.merchant}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    Transaction Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="transactionDate"
                    value={formData.transactionDate}
                    onChange={handleChange}
                    className="w-full border-2 border-slate-200 px-4 py-3 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all outline-none"
                  />
                  {error.transactionDate && (
                    <p className="text-sm text-red-500 mt-1.5 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full" />
                      {error.transactionDate}
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "email" && (
              <div className="space-y-5">
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-4">
                  <div className="flex gap-3">
                    <Mail className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-teal-800">
                      <p className="font-semibold mb-1">How it works:</p>
                      <ul className="space-y-1 text-teal-700">
                        <li>• Copy transaction email content</li>
                        <li>• Paste it in the box below</li>
                        <li>• We'll extract the details automatically</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Mail className="w-4 h-4 text-teal-600" />
                    Email Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    placeholder="Paste your transaction email content here..."
                    rows={8}
                    className="w-full border-2 border-slate-200 px-4 py-3 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all outline-none resize-none font-mono text-sm"
                  />
                  {error.emailContent && (
                    <p className="text-sm text-red-500 mt-1.5 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full" />
                      {error.emailContent}
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={parseEmailContent}
                  className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white py-3 rounded-lg font-semibold transition-all"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2
                      className="mr-2 h-5 w-5 animate-spin"
                      style={{ marginRight: "8px" }}
                    ></Loader2>
                  ) : (
                    "Extract Transaction Details"
                  )}
                </Button>
              </div>
            )}

            {activeTab === "manual" && (
              <div className="flex gap-3 pt-6 mt-6 border-t border-slate-200">
                <Dialog.Close asChild>
                  <Button
                    type="button"
                    className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-all"
                  >
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  {defaultValues ? "Update Transaction" : "Add Transaction"}
                </Button>
              </div>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
