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
  DollarSign,
  PiggyBank,
  Mail,
  Plus,
  Menu,
  Bell,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { transactionService } from "@/services/transaction";
import { PastMonthTransactions, TypeStat, weekDataType } from "@/types";
import { CATEGORIES, CATEGORY_COLORS } from "@/constants";
import { routeUserToHome } from "@/utils";
import { useAppDispatch } from "@/store/hooks";
import { format } from "date-fns";
import TransactionModal from "@/components/ui/dialogue";

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
  const [transactions, setTransactions] = useState([]);
  const [openEditModal, setOpenEditModal] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dispatch = useAppDispatch();

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
      const index = new Date(item._id).getDay() - 1;
      weeklyData[index].amount = item.totalAmount;
    }
  });

  const fetchDashboardData = async () => {
    try {
      const pastTxnRes = await transactionService.getPastTransactions();
      setPastMonthsTransactions(pastTxnRes.data);

      const txnRes = await transactionService.getTransactions("");
      setTransactions(txnRes?.data?.transactions || []);
    } catch (error) {
      routeUserToHome(error, dispatch);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const monthlyData = pastMonthTransactions?.monthlyStats.map((item) => {
    const currentYear = new Date().getFullYear();
    const date = new Date(currentYear, item._id.month - 1); // JS months are 0-indexed
    return {
      month: format(date, "MMM yyyy"), // "Sep 2025"
      amount: item.totalAmount,
      type: item._id.type,
    };
  });

  const handleAddTransaction = async (formData) => {
    try {
      const response = await transactionService.addTransaction(formData);
      if (response.status === 200 || response.status === 201) {
        setOpenEditModal(false);
        // toast.success("Transaction updated successfully");
        await fetchDashboardData();
      }
    } catch (error) {
      // toast.error("Something went wrong");
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

  // Category data for showing in the chart
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

  return (
    <>
      <div className="min-h-screen bg-gradient-background relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern-dots opacity-30 animate-pulse" />
        <div
          className="absolute top-0 left-0 w-96 h-96 bg-gradient-accent rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-primary rounded-full blur-3xl opacity-10 animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-success rounded-full blur-2xl opacity-15 animate-pulse"
          style={{ animationDelay: "4s" }}
        />

        {/* Header */}
        <header className="border-b bg-card/80 backdrop-blur-lg sticky top-0 z-50 shadow-soft">
          <div className="mobile-container py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">
                    Expense Dashboard
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                    Welcome back! Here's your financial overview.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3">
                {/* <Button variant="ghost" size="sm" className="hidden sm:flex">
                  <Bell className="w-4 h-4 mr-2" />
                  <span className="hidden lg:inline">Alerts</span>
                </Button> */}
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="hidden lg:inline">Sync Email</span>
                </Button>
                {/* <Link to="/transactions/add"> */}
                <Button
                  variant="financial"
                  size="sm"
                  onClick={() => setOpenEditModal(true)}
                >
                  <Plus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Add Expense</span>
                </Button>
                {/* </Link> */}
              </div>
            </div>
          </div>
        </header>

        <div className="mobile-container py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8 relative z-10">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <Card className="p-3 sm:p-4 lg:p-6 bg-gradient-card border-0 shadow-colorful hover:shadow-glow transition-all duration-300 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Total Spent
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">
                    ₹{totalSpent.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
            </Card>

            <Card className="p-3 sm:p-4 lg:p-6 bg-gradient-card border-0 shadow-colorful hover:shadow-glow transition-all duration-300 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    This Month
                  </p>
                  <>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold">
                      ₹{thisMonthSpent.toLocaleString()}
                    </p>
                    {lastMonthSpent > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        {percentageChange > 0 ? (
                          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-destructive" />
                        ) : (
                          <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
                        )}
                        <span
                          className={`text-xs sm:text-sm ${
                            percentageChange > 0
                              ? "text-destructive"
                              : "text-success"
                          }`}
                        >
                          {Math.abs(percentageChange).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </>
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4 lg:p-6 bg-gradient-card border-0 shadow-colorful hover:shadow-glow transition-all duration-300 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Avg Daily
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">
                    ₹{dailySpendAverage.toLocaleString()}
                  </p>
                </div>
                <PiggyBank className="w-6 h-6 sm:w-8 sm:h-8 text-success" />
              </div>
            </Card>

            <Card className="p-3 sm:p-4 lg:p-6 bg-gradient-card border-0 shadow-colorful hover:shadow-glow transition-all duration-300 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Categories
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {categoriesCount.toLocaleString()}
                  </p>
                </div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-xs sm:text-sm font-bold">
                    {Object.keys(CATEGORIES).length}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* Spending by Category */}
            <Card className="p-4 sm:p-6 bg-gradient-card border-0 shadow-colorful backdrop-blur-sm">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
                Spending by Category
              </h3>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={window.innerWidth < 640 ? 40 : 60}
                      outerRadius={window.innerWidth < 640 ? 80 : 120}
                      dataKey="value"
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
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                {categoryData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-xs sm:text-sm"
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground truncate">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Spending Timeline */}
            <Card className="p-4 sm:p-6 bg-gradient-card border-0 shadow-colorful backdrop-blur-sm">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
                Spending Timeline
              </h3>
              <Tabs defaultValue="weekly" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="weekly" className="text-xs sm:text-sm">
                    This Week
                  </TabsTrigger>
                  <TabsTrigger value="monthly" className="text-xs sm:text-sm">
                    6 Months
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="weekly" className="h-64 sm:h-80 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={weeklyData}
                      margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="day" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip
                        formatter={(value) => [
                          `₹${value.toLocaleString()}`,
                          "Amount",
                        ]}
                      />
                      <Bar
                        dataKey="amount"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>
                <TabsContent value="monthly" className="h-64 sm:h-80 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlyData}
                      margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="month" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip
                        formatter={(value) => [
                          `₹${value.toLocaleString()}`,
                          "Amount",
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={{
                          fill: "hsl(var(--primary))",
                          strokeWidth: 2,
                          r: 6,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card className="p-4 sm:p-6 bg-gradient-card border-0 shadow-colorful backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold">
                Recent Transactions
              </h3>
              <Link to="/transactions">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  View All
                </Button>
              </Link>
            </div>
            {transactions && (
              <div className="space-y-3 sm:space-y-4">
                {transactions.map((transaction) => {
                  const transaction_date = new Date(
                    transaction.transactionDate
                  ).toLocaleDateString();
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 sm:p-4 bg-background/50 rounded-lg border hover:shadow-soft transition-all duration-200 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm sm:text-base truncate">
                            {transaction.merchant}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {transaction.transactionType} • {transaction_date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-sm sm:text-base">
                          ₹{transaction.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
      <TransactionModal
        open={openEditModal}
        onOpenChange={setOpenEditModal}
        onSubmit={handleAddTransaction}
        // defaultValues={selectedTransaction}
      />
    </>
  );
};

export default Dashboard;
