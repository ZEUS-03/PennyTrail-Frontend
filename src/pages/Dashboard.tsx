import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  IndianRupeeIcon,
  LayoutGrid,
  Mail,
  Plus,
  Menu,
  Bell,
  Calendar,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  LogOut,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { transactionService } from "@/services/transaction";
import { PastMonthTransactions, TypeStat, weekDataType } from "@/types";
import { CATEGORIES, CATEGORY_COLORS } from "@/constants";
import { isEmpty, mapLocalStorageData, routeUserToHome } from "@/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { format } from "date-fns";
import TransactionModal from "@/components/ui/dialogue";
import {
  setTransactions,
  syncTransactions,
} from "@/store/slices/transactionSlice";
import { toast } from "@/hooks/use-toast";
import DashboardShimmer from "@/components/DashboardShimmer";
import Footer from "@/components/Footer";
import Modal from "@/components/ui/Modal";
import { setGuest } from "@/store/slices/authSlice";

const Dashboard = () => {
  const [pastMonthTransactions, setPastMonthsTransactions] =
    useState<PastMonthTransactions>({
      lastMonthStats: [],
      monthlyStats: [],
      totalStats: [],
      typeStats: [],
      weekData: [],
      year: null,
    });
  const [allTransactions, setAllTransactions] = useState([]);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [apiCallsLoading, setApiCallsLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dispatch = useAppDispatch();

  const { user, isGuest } = useAppSelector((state) => state.auth);
  const { transactions, loading, error } = useAppSelector(
    (state) => state.transactions
  );

  const weeklyData = [
    { day: "Mon", amount: 0 },
    { day: "Tue", amount: 0 },
    { day: "Wed", amount: 0 },
    { day: "Thu", amount: 0 },
    { day: "Fri", amount: 0 },
    { day: "Sat", amount: 0 },
    { day: "Sun", amount: 0 },
  ];

  pastMonthTransactions?.weekData?.forEach((item: weekDataType, idx) => {
    if (item) {
      const index = new Date(item._id).getDay();
      weeklyData[index].amount = item?.totalAmount;
    }
  });

  const handleSyncEmail = async () => {
    const lastSyncDate = user.lastSyncDate
      ? user?.lastSyncDate?.split("T")[0]
      : "";
    const date = new Date();

    const response = await dispatch(
      syncTransactions({
        maxResults: 50,
        syncAll: false,
      })
    );
    const payload = response.payload as {
      transactionCount: number | { message?: string };
    };
    if (payload.transactionCount) {
      toast({
        title: "Email Sync Successful",
        description:
          typeof payload.transactionCount === "object" &&
          "message" in payload.transactionCount
            ? payload.transactionCount.message
            : `Fetched ${payload.transactionCount} new transactions.`,
        variant: "success",
      });
    }
  };

  const fetchDashboardData = async () => {
    try {
      setApiCallsLoading(true);
      const pastTxnRes = await transactionService.getPastTransactions();
      setPastMonthsTransactions(pastTxnRes.data);

      const txnRes = await transactionService.getTransactions("");
      setAllTransactions(txnRes?.data?.transactions || []);
    } catch (error) {
      routeUserToHome(error, dispatch);
      toast({
        title: "Failed to fetch data",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setApiCallsLoading(false);
    }
  };

  useEffect(() => {
    if (!isGuest) {
      fetchDashboardData();
    } else {
      const existingTransactions = localStorage.getItem("transactions");
      const transactions = existingTransactions
        ? JSON.parse(existingTransactions)
        : [];
      setAllTransactions(transactions);
      setApiCallsLoading(false);
      mapLocalStorageData(setPastMonthsTransactions);
    }
  }, [transactions]);

  const monthlyData = pastMonthTransactions?.monthlyStats.map((item) => {
    const currentYear = new Date().getFullYear();
    const date = new Date(currentYear, item._id.month - 1);
    return {
      month: format(date, "MMM yyyy"),
      amount: item?.totalAmount,
      type: item._id.type,
    };
  });

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
          await fetchDashboardData();
        }
      } else {
        const existingTransactions = localStorage.getItem("transactions");
        formData._id = `guest-${Date.now()}`;
        const transactions = existingTransactions
          ? JSON.parse(existingTransactions)
          : [];
        transactions.push(formData);
        setAllTransactions(transactions);
        localStorage.setItem("transactions", JSON.stringify(transactions));
        mapLocalStorageData(setPastMonthsTransactions);
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

  const totalSpent = pastMonthTransactions?.totalStats[0]?.totalAmount || 0;
  const thisMonthSpent =
    pastMonthTransactions?.lastMonthStats[0]?.totalAmount || 0;
  const lastMonthSpent =
    (pastMonthTransactions?.monthlyStats?.length &&
      pastMonthTransactions?.monthlyStats?.find(
        (stat) => stat._id?.month === new Date().getMonth()
      )?.totalAmount) ||
    0;

  const percentageChange =
    ((thisMonthSpent - lastMonthSpent) / lastMonthSpent) * 100;
  const dailySpendAverage = thisMonthSpent / new Date().getDate();
  const categoriesCount = pastMonthTransactions?.typeStats?.length || 0;

  let categoryData = [];

  if (categoriesCount !== 0) {
    const categories = pastMonthTransactions?.typeStats?.map(
      (stat) => stat._id
    );
    categoryData = categories?.map((category) => ({
      name: CATEGORIES[category],
      value:
        (pastMonthTransactions?.typeStats as TypeStat[])?.find(
          (stat) => stat._id === category
        )?.totalAmount || 0,
      color: CATEGORY_COLORS[category],
    }));
  }

  if (apiCallsLoading) {
    return <DashboardShimmer />;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.05),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(16,185,129,0.05),transparent_50%)]" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-teal-400/20 to-transparent rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-emerald-400/20 to-transparent rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 right-1/4 w-64 h-64 bg-gradient-to-br from-cyan-400/15 to-transparent rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "4s" }}
        />

        <header className="border-b border-slate-200/50 bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
          <div className="mobile-container py-4 sm:py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden hover:bg-teal-50"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                    Expense Dashboard
                  </h1>
                  <p className="text-sm text-slate-600 hidden sm:block mt-0.5">
                    Welcome back! Here's your financial overview.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3">
                {!isGuest && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex border-teal-200 hover:bg-teal-50 hover:border-teal-300 transition-all"
                    onClick={handleSyncEmail}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div
                          className="spinner"
                          style={{ marginRight: "8px" }}
                        ></div>
                        <span className="hidden lg:inline">Syncing...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 sm:mr-2 text-teal-600" />
                        <span className="hidden lg:inline">Sync Email</span>
                      </>
                    )}
                  </Button>
                )}
                <Button
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
                  size="sm"
                  onClick={() => setOpenEditModal(true)}
                >
                  <Plus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Add Expense</span>
                </Button>
                {isGuest && (
                  <Button
                    className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
                    size="sm"
                    onClick={() => setShowLogoutModal(true)}
                  >
                    <LogOut className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Exit Guest Mode</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="mobile-container py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <Card className="relative overflow-hidden bg-gradient-to-br from-white to-teal-50/50 border-teal-100 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-400/10 to-transparent rounded-full blur-2xl" />
              <div className="p-5 sm:p-6 relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <IndianRupeeIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="bg-teal-100 text-teal-700 text-xs font-semibold px-2 py-1 rounded-full">
                    Total
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-1">Total Spent</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                  ₹{totalSpent.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-2">All time expenses</p>
              </div>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-white to-emerald-50/50 border-emerald-100 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-transparent rounded-full blur-2xl" />
              <div className="p-5 sm:p-6 relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-1 rounded-full">
                    Current
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-1">This Month</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                  ₹{thisMonthSpent.toLocaleString()}
                </p>
                {lastMonthSpent > 0 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    {percentageChange > 0 ? (
                      <>
                        <ArrowUpRight className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-semibold text-red-500">
                          {Math.abs(percentageChange).toFixed(1)}%
                        </span>
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-semibold text-green-500">
                          {Math.abs(percentageChange).toFixed(1)}%
                        </span>
                      </>
                    )}
                    <span className="text-xs text-slate-500">
                      vs last month
                    </span>
                  </div>
                )}
              </div>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-white to-cyan-50/50 border-cyan-100 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full blur-2xl" />
              <div className="p-5 sm:p-6 relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div className="bg-cyan-100 text-cyan-700 text-xs font-semibold px-2 py-1 rounded-full">
                    Avg
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-1">Daily Average</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                  ₹{dailySpendAverage.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Per day this month
                </p>
              </div>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-white to-violet-50/50 border-violet-100 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-400/10 to-transparent rounded-full blur-2xl" />
              <div className="p-5 sm:p-6 relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <LayoutGrid className="w-6 h-6 text-white" />
                  </div>
                  <div className="bg-violet-100 text-violet-700 text-xs font-semibold px-2 py-1 rounded-full">
                    Active
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-1">Categories</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {categoriesCount}/{Object.keys(CATEGORIES).length}
                </p>
                <p className="text-xs text-slate-500 mt-2">Used categories</p>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all">
              <div className="p-5 sm:p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Spending by Category
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Distribution of expenses (current month)
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <LayoutGrid className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
              <div className="p-5 sm:p-6">
                {!isEmpty(categoryData) ? (
                  <>
                    <div className="h-72 sm:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={window.innerWidth < 640 ? 50 : 70}
                            outerRadius={window.innerWidth < 640 ? 90 : 120}
                            dataKey="value"
                            paddingAngle={2}
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [
                              `₹${value.toLocaleString()}`,
                              "Amount",
                            ]}
                            contentStyle={{
                              backgroundColor: "rgba(255, 255, 255, 0.95)",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-6">
                      {categoryData.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg"
                        >
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                            style={{ backgroundColor: item.color }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              ₹{item.value.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-80 flex flex-col items-center justify-center text-slate-400">
                    <PieChart className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-lg font-medium">No transactions found</p>
                    <p className="text-sm mt-1">
                      Start adding expenses to see insights
                    </p>
                  </div>
                )}
              </div>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all">
              <div className="p-5 sm:p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Spending Timeline
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Track your expense trends
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <Tabs defaultValue="weekly" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-lg">
                    <TabsTrigger
                      value="weekly"
                      className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      This Week
                    </TabsTrigger>
                    <TabsTrigger
                      value="monthly"
                      className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      Past Months
                    </TabsTrigger>
                  </TabsList>
                  {!isEmpty(allTransactions) ? (
                    <>
                      <TabsContent value="weekly" className="h-72 sm:h-80 mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={weeklyData}>
                            <defs>
                              <linearGradient
                                id="barGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="0%"
                                  stopColor="#14b8a6"
                                  stopOpacity={0.8}
                                />
                                <stop
                                  offset="100%"
                                  stopColor="#10b981"
                                  stopOpacity={0.3}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#e2e8f0"
                            />
                            <XAxis
                              dataKey="day"
                              fontSize={12}
                              stroke="#64748b"
                            />
                            <YAxis fontSize={12} stroke="#64748b" />
                            <Tooltip
                              formatter={(value) => [
                                `₹${value.toLocaleString()}`,
                                "Amount",
                              ]}
                              contentStyle={{
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                              }}
                            />
                            <Bar
                              dataKey="amount"
                              fill="url(#barGradient)"
                              radius={[8, 8, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </TabsContent>
                      <TabsContent
                        value="monthly"
                        className="h-72 sm:h-80 mt-6"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={monthlyData}>
                            <defs>
                              <linearGradient
                                id="lineGradient"
                                x1="0"
                                y1="0"
                                x2="1"
                                y2="0"
                              >
                                <stop offset="0%" stopColor="#14b8a6" />
                                <stop offset="100%" stopColor="#10b981" />
                              </linearGradient>
                            </defs>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#e2e8f0"
                            />
                            <XAxis
                              dataKey="month"
                              fontSize={12}
                              stroke="#64748b"
                            />
                            <YAxis fontSize={12} stroke="#64748b" />
                            <Tooltip
                              formatter={(value) => [
                                `₹${value.toLocaleString()}`,
                                "Amount",
                              ]}
                              contentStyle={{
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="amount"
                              stroke="url(#lineGradient)"
                              strokeWidth={3}
                              dot={{ fill: "#14b8a6", strokeWidth: 2, r: 6 }}
                              activeDot={{ r: 8, strokeWidth: 0 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </TabsContent>
                    </>
                  ) : (
                    <div className="h-80 flex flex-col items-center justify-center text-slate-400 mt-6">
                      <BarChart className="w-16 h-16 mb-4 opacity-20" />
                      <p className="text-lg font-medium">
                        No transactions found
                      </p>
                      <p className="text-sm mt-1">
                        Start adding expenses to see trends
                      </p>
                    </div>
                  )}
                </Tabs>
              </div>
            </Card>
          </div>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
            <div className="p-5 sm:p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Recent Transactions
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Your latest expenses
                  </p>
                </div>
                {!isEmpty(allTransactions) && (
                  <Link to="/transactions">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-teal-200 text-teal-600 hover:bg-teal-50 hover:border-teal-300"
                    >
                      View All
                      <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            <div className="p-5 sm:p-6">
              {!isEmpty(allTransactions) ? (
                <div className="space-y-3">
                  {allTransactions.slice(0, 5).map((transaction) => {
                    const transaction_date = new Date(
                      transaction.transactionDate
                    ).toLocaleDateString();
                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-100 hover:shadow-md hover:border-teal-200 transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                            <IndianRupeeIcon className="w-6 h-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900 truncate text-base">
                              {transaction.merchant}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-slate-500">
                                {transaction.transactionType}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="text-sm text-slate-500">
                                {transaction_date}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-slate-900 text-lg">
                            ₹{transaction.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 flex flex-col items-center justify-center text-slate-400">
                  <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                    <IndianRupeeIcon className="w-10 h-10 text-slate-300" />
                  </div>
                  <p className="text-lg font-medium text-slate-600">
                    No recent transactions
                  </p>
                  <p className="text-sm mt-2 text-center max-w-md">
                    Start tracking your expenses by adding your first
                    transaction
                  </p>
                  <Button
                    className="mt-6 bg-gradient-to-r from-teal-600 to-emerald-600 text-white"
                    onClick={() => setOpenEditModal(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Expense
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Exit Guest Mode"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="destructive"
              onClick={() => setShowLogoutModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => {
                dispatch(setGuest(false));
                localStorage.removeItem("transactions");
              }}
            >
              Exit Guest Mode
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p>
            Are you sure you want to exit Guest Mode? Your locally stored
            transactions will be lost.
          </p>
        </div>
      </Modal>
      <TransactionModal
        open={openEditModal}
        onOpenChange={setOpenEditModal}
        onSubmit={handleAddTransaction}
      />
      <Footer />
    </>
  );
};

export default Dashboard;
