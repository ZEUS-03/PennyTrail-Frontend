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
  Download,
  Plus,
  ArrowLeft,
  Edit,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { transactionService } from "@/services/transaction";
import { routeUserToHome } from "@/utils";
import { useAppDispatch } from "@/store/hooks";
import { CATEGORIES, CATEGORY_COLORS } from "@/constants";
import {
  getThisWeekRange,
  getThisMonthRange,
  getThisQuarterRange,
} from "@/utils";
import TransactionModal from "@/components/ui/dialogue";
import { toast } from "@/hooks/use-toast";

const Transactions = () => {
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
    getTrxns();
  }, []);

  const handleTransactionAddEdit = async (formData) => {
    if (formData.id) {
      handleTransactionEdit(formData);
    } else {
      handleAddTransaction(formData);
    }
  };

  const handleAddTransaction = async (formData) => {
    try {
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
    } catch (error) {
      // toast.error("Something went wrong");
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
      const query = buildEditQueryString();
      const txns = await getTransactions(query);
      if (Array.isArray(txns) && txns.length !== 0) {
        setTransactions(txns);
      } else {
        setTransactions([]);
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

  // const filteredTransactions = transactions.filter((transaction) => {
  //   const matchesSearch = transaction.merchant
  //     .toLowerCase()
  //     .includes(searchQuery.toLowerCase());
  //   const matchesCategory =
  //     selectedCategory === "all" ||
  //     transaction.transactionType === selectedCategory;
  //   return matchesSearch && matchesCategory;
  // });

  const deleteTransaction = async (id: string) => {
    try {
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
      // food: "bg-green-100 text-green-800 border-green-200",
      transfer: "bg-blue-100 text-blue-800 border-blue-200",
      purchase: "bg-purple-100 text-purple-800 border-purple-200",
      bill_payment: "bg-red-100 text-red-800 border-red-200",
      other: "bg-grey-100 text-grey-800 border-grey-200",
      entertainment: "bg-pink-100 text-pink-800 border-pink-200",
      fuel: "bg-orange-100 text-orange-800 border-orange-200",
      subscription: "bg-emerald-100 text-emerald-800 border-emerald-200",
      refund: "bg-teal-100 text-teal-800 border-teal-200",
    };
    return colors[category] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getSourceBadge = (source: string) => {
    return source === "email" ? (
      <Badge
        variant="outline"
        className="text-xs bg-primary/10 text-primary border-primary/20"
      >
        Auto
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className="text-xs bg-gold/10 text-gold border-gold/20"
      >
        Manual
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">All Transactions</h1>
                <p className="text-muted-foreground">
                  {paginationDetails.totalTransactions} transactions found
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {/* <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button> */}
              {/* <Link to="/transactions/"> */}
              <Button
                variant="financial"
                size="sm"
                onClick={() => setOpenEditModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
              {/* </Link> */}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="p-6 mb-8 bg-gradient-card border-0 shadow-soft">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.trim())}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
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
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="financial" size="sm" onClick={handleSearch}>
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
        </Card>

        {/* Transactions List */}
        {transactions && (
          <div className="space-y-4">
            {transactions.map((transaction) => {
              const transaction_date = new Date(
                transaction.transactionDate
              ).toLocaleDateString();

              return (
                <Card
                  key={transaction.id}
                  className="p-6 bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {transaction.merchant.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-lg">
                            {transaction.merchant}
                          </h3>
                          {/* {getSourceBadge()} */}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{transaction_date}</span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getCategoryColor(
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
                        <p className="text-2xl font-bold">
                          ₹{transaction.amount.toLocaleString()}
                        </p>
                        {/* <p className="text-sm text-success capitalize">
                          {transaction.status}
                        </p> */}
                      </div>

                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
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
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteTransaction(transaction._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {!transactions || transactions.length === 0 ? (
          <div className="text-center text-muted-foreground mt-20">
            No transactions found.
          </div>
        ) : null}

        {/* Load More Button */}
        {paginationDetails?.hasNextPage && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              className="px-8"
              onClick={loadMoreTransactions}
            >
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
