import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Plus,
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  IndianRupee,
  Package,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { transactionService } from "@/services/transaction";
import { filterTransactions, routeUserToHome } from "@/utils";
import { useAppDispatch } from "@/store/hooks";
import { CATEGORIES, CATEGORY_COLORS } from "@/constants";
import { useAppSelector } from "@/store/hooks";
import {
  getThisWeekRange,
  getThisMonthRange,
  getThisQuarterRange,
} from "@/utils";
import TransactionModal from "@/components/ui/dialogue";
import { toast } from "@/hooks/use-toast";

const Transactions = () => {
  const { isGuest } = useAppSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState("all");
  const [transactions, setTransactions] = useState([]);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [paginationDetails, setPaginationDetails] = useState({
    hasNextPage: false,
    currentPage: 0,
    totalPages: 0,
    totalTransactions: 0,
    hasPrevPage: false,
  });

  const dispatch = useAppDispatch();

  const getTransactions = useCallback(
    async (query: string = "") => {
      try {
        const response = await transactionService.getTransactions(query);
        const txns = response.data.transactions;
        setPaginationDetails((prev) => ({
          ...prev,
          currentPage: response.data.pagination.currentPage,
          totalPages: response.data.pagination.totalPages,
          totalTransactions: response.data.pagination.totalTransactions,
          hasNextPage: response.data.pagination.hasNextPage,
          hasPrevPage: response.data.pagination.hasPrevPage,
        }));
        return txns;
      } catch (error) {
        toast({
          title: "Failed to fetch data",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
        routeUserToHome(error, dispatch);
      }
    },
    [paginationDetails, transactions]
  );

  useLayoutEffect(() => {
    const getTrxns = async () => {
      const txns = await getTransactions();
      if (Array.isArray(txns) && txns.length !== 0) {
        setTransactions((prev) => [...prev, ...txns]);
      }
    };
    if (!isGuest) {
      getTrxns();
    } else {
      const existingTransactions = localStorage.getItem("transactions");
      const transactions = existingTransactions
        ? JSON.parse(existingTransactions)
        : [];
      setTransactions(transactions);
    }
  }, []);

  const handleTransactionAddEdit = async (formData) => {
    if (formData._id) {
      handleTransactionEdit(formData);
    } else {
      handleAddTransaction(formData);
    }
  };

  useEffect(() => {
    if (!openEditModal) {
      setSelectedTransaction(null);
    }
  }, [openEditModal]);

  const handleAddTransaction = async (formData) => {
    try {
      if (!isGuest) {
        const response = await transactionService.addTransaction(formData);
        if (response.status === 200 || response.status === 201) {
          setOpenEditModal(false);
          toast({
            title: "Transaction Added",
            description: "The transaction has been added successfully.",
            variant: "success",
          });
          const txns = await getTransactions();
          if (Array.isArray(txns) && txns.length !== 0) {
            setTransactions(txns);
          }
        }
      } else {
        formData._id = `guest-${Date.now()}`;
        const existingTransactions = JSON.parse(
          localStorage.getItem("transactions") || "[]"
        );
        existingTransactions.push(formData);
        localStorage.setItem(
          "transactions",
          JSON.stringify(existingTransactions)
        );
        setTransactions(existingTransactions);
        setOpenEditModal(false);
      }
    } catch (error) {
      toast({
        title: "Failed to Add Transaction",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      console.log(error);
    }
  };

  const handleTransactionEdit = async (formData) => {
    try {
      if (!isGuest) {
        const response = await transactionService.editTransaction(
          formData._id,
          formData
        );
        if (response.status === 200) {
          setOpenEditModal(false);
          toast({
            title: "Transaction Updated",
            description: "The transaction has been updated successfully.",
            variant: "success",
          });
          const txns = await getTransactions();
          if (Array.isArray(txns) && txns.length !== 0) {
            setTransactions(txns);
          }
        }
      } else {
        const existingTransactions = JSON.parse(
          localStorage.getItem("transactions") || "[]"
        );
        const currentIndex = existingTransactions.findIndex(
          (txn) => txn._id === selectedTransaction._id
        );
        existingTransactions[currentIndex] = {
          ...existingTransactions[currentIndex],
          ...formData,
        };
        localStorage.setItem(
          "transactions",
          JSON.stringify(existingTransactions)
        );
        setOpenEditModal(false);
        setTransactions(existingTransactions);
        toast({
          title: "Transaction Updated",
          description: "The transaction has been updated successfully.",
          variant: "success",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to Update Transaction",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      console.log(error);
    }
  };

  const buildEditQueryString = () => {
    let query = "?";
    if (searchQuery) {
      query += `merchant=${searchQuery}`;
    }
    if (selectedCategory !== "all") {
      query += `&type=${selectedCategory}`;
    }
    if (selectedTimeRange !== "all") {
      if (selectedTimeRange === "week") {
        const { startDate, endDate } = getThisWeekRange();
        query += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      } else if (selectedTimeRange === "month") {
        const { startDate, endDate } = getThisMonthRange();
        query += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      } else if (selectedTimeRange === "quarter") {
        const { startDate, endDate } = getThisQuarterRange();
        query += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      }
    }
    return query;
  };

  const buildQueryString = () => {
    let query = "";
    query = `?page=${paginationDetails.currentPage + 1}&limit=10`;
    return query;
  };

  const loadMoreTransactions = async () => {
    const query = buildQueryString();
    const txns = await getTransactions(query);
    if (Array.isArray(txns) && txns.length !== 0) {
      setTransactions((prev) => [...prev, ...txns]);
    }
  };

  const handleSearch = async () => {
    try {
      if (!isGuest) {
        const query = buildEditQueryString();
        const txns = await getTransactions(query);
        if (Array.isArray(txns) && txns.length !== 0) {
          setTransactions(txns);
        } else {
          setTransactions([]);
        }
      } else {
        const existingTransactions = JSON.parse(
          localStorage.getItem("transactions") || "[]"
        );
        const filteredTransactions = filterTransactions(existingTransactions, {
          selectedTimeRange,
          selectedCategory,
          searchQuery,
        });
        setTransactions(filteredTransactions);
      }
    } catch (error) {
      toast({
        title: "Failed to Search Transactions",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const categories = Object.values(CATEGORIES);

  const deleteTransaction = async (id: string) => {
    try {
      if (!isGuest) {
        const response = await transactionService.deleteTransaction(id);
        if (response.status === 200) {
          toast({
            title: "Transaction Deleted",
            description: "The transaction has been deleted successfully.",
            variant: "success",
          });
          const txns = await getTransactions();
          if (Array.isArray(txns) && txns.length !== 0) {
            setTransactions(txns);
          }
        }
      } else {
        const existingTransactions = JSON.parse(
          localStorage.getItem("transactions") || "[]"
        );
        const updatedTransactions = existingTransactions.filter(
          (txn) => txn._id !== id
        );
        localStorage.setItem(
          "transactions",
          JSON.stringify(updatedTransactions)
        );
        setTransactions(updatedTransactions);
      }
    } catch (error) {
      toast({
        title: "Failed to Delete Transaction",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      console.log(error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      transfer: "bg-blue-50 text-blue-700 border-blue-200",
      purchase: "bg-purple-50 text-purple-700 border-purple-200",
      bill_payment: "bg-red-50 text-red-700 border-red-200",
      other: "bg-gray-50 text-gray-700 border-gray-200",
      entertainment: "bg-pink-50 text-pink-700 border-pink-200",
      fuel: "bg-orange-50 text-orange-700 border-orange-200",
      subscription: "bg-emerald-50 text-emerald-700 border-emerald-200",
      refund: "bg-teal-50 text-teal-700 border-teal-200",
    };
    return colors[category] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getSourceBadge = (source: string) => {
    return source === "email" ? (
      <Badge
        variant="outline"
        className="text-xs bg-teal-50 text-teal-700 border-teal-200"
      >
        Auto
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className="text-xs bg-amber-50 text-amber-700 border-amber-200"
      >
        Manual
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.05),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(16,185,129,0.05),transparent_50%)]" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-teal-400/20 to-transparent rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-emerald-400/20 to-transparent rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      />

      {/* Header */}
      <header className="border-b border-slate-200/50 bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-teal-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  All Transactions
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Package className="w-4 h-4 text-slate-500" />
                  <p className="text-sm text-slate-600">
                    {isGuest
                      ? transactions.length
                      : paginationDetails.totalTransactions}{" "}
                    transactions found
                  </p>
                </div>
              </div>
            </div>
            <Button
              className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
              size="sm"
              onClick={() => setOpenEditModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Filters */}
        <Card className="p-6 mb-8 bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search by merchant name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.trim())}
                  className="pl-10 h-11 bg-white border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px] h-11 bg-white border-slate-200">
                  <Filter className="w-4 h-4 mr-2 text-slate-500" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem
                      key={category}
                      value={category.toLowerCase().replace(" ", "_")}
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedTimeRange}
                onValueChange={setSelectedTimeRange}
              >
                <SelectTrigger className="w-[150px] h-11 bg-white border-slate-200">
                  <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>

              <Button
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white h-11"
                onClick={handleSearch}
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </Card>

        {/* Transactions List */}
        {transactions && transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((transaction) => {
              const transactionDate = new Date(transaction.transactionDate);
              const transaction_date = transactionDate.toLocaleDateString();

              return (
                <Card
                  key={transaction.id}
                  className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="relative">
                          <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <span className="text-white font-bold text-xl">
                              {transaction.merchant.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                            <IndianRupee className="w-3 h-3 text-teal-600" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg text-slate-900 truncate">
                              {transaction.merchant}
                            </h3>
                            {getSourceBadge(transaction.source)}
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                              <Calendar className="w-4 h-4" />
                              <span>{transaction_date}</span>
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-xs font-medium ${getCategoryColor(
                                transaction?.transactionType
                              )}`}
                            >
                              {CATEGORIES[transaction?.transactionType]}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                            ₹{transaction.amount.toLocaleString()}
                          </p>
                        </div>

                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-teal-50 hover:text-teal-600 transition-colors"
                            onClick={() => {
                              setOpenEditModal(true);
                              setSelectedTransaction(transaction);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-red-50 hover:text-red-600 transition-colors"
                            onClick={() => deleteTransaction(transaction._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
              <Package className="w-12 h-12 text-slate-300" />
            </div>
            <p className="text-xl font-semibold text-slate-600 mb-2">
              No transactions found
            </p>
            <p className="text-sm text-slate-500 mb-6 max-w-md text-center">
              {searchQuery ||
              selectedCategory !== "all" ||
              selectedTimeRange !== "all"
                ? "Try adjusting your filters to find what you're looking for"
                : "Start tracking your expenses by adding your first transaction"}
            </p>
            <Button
              className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white"
              onClick={() => setOpenEditModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Transaction
            </Button>
          </div>
        )}

        {paginationDetails?.hasNextPage && (
          <div className="text-center mt-10">
            <Button
              variant="outline"
              className="px-8 border-teal-200 text-teal-600 hover:bg-teal-50 hover:border-teal-300 transition-all"
              onClick={loadMoreTransactions}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Load More Transactions
            </Button>
          </div>
        )}
      </div>

      <TransactionModal
        open={openEditModal}
        onOpenChange={setOpenEditModal}
        onSubmit={handleTransactionAddEdit}
        defaultValues={selectedTransaction}
      />
    </div>
  );
};

export default Transactions;
