import { isArrayBuffer } from "util/types";
import { toast } from "./hooks/use-toast";
import { authService } from "./services/auth";
import { logout } from "./store/slices/authSlice";
import { format } from "date-fns";
import { PastMonthTransactions } from "./types";

export const googleOAuth = async () => {
  try {
    const response = await authService.getGoogleAuthUrl();
    const { authUrl } = response.data;
    window.location.href = authUrl;
  } catch (error) {
    toast({
      title: "Failed to Login",
      description: "Something went wrong. Please try again.",
      variant: "destructive",
    });
    console.log(error);
  }
};

export const routeUserToHome = (error, dispatch) => {
  if (error.response && error.response.status === 401) {
    dispatch(logout());
    window.location.href = "/";
    toast({
      title: "Session expired",
      description: "Your session has expired. Please log in again.",
      variant: "destructive",
    });
  }
};

export function getPastMonths(count: number): string[] {
  try {
    const months = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(format(d, "MMM yyyy"));
    }
    return months;
  } catch (error) {
    toast({
      title: "Failed to fetch data",
      description: "Something went wrong. Please try again.",
      variant: "destructive",
    });
    console.log(error);
  }
}

export function getThisWeekRange() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)

  const start = new Date(today);
  start.setDate(today.getDate() - dayOfWeek); // Sunday

  const end = new Date(start);
  end.setDate(start.getDate() + 6); // Saturday

  return { startDate: start, endDate: end };
}

export function getThisMonthRange() {
  const today = new Date();

  const start = new Date(today.getFullYear(), today.getMonth(), 1); // 1st of the month
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0); // last day of the month

  return { startDate: start, endDate: end };
}

export function getThisQuarterRange() {
  const today = new Date();
  const currentMonth = today.getMonth(); // 0 = Jan, 11 = Dec

  const quarterStartMonth = Math.floor(currentMonth / 3) * 3;

  const start = new Date(today.getFullYear(), quarterStartMonth, 1);
  const end = new Date(today.getFullYear(), quarterStartMonth + 3, 0); // last day of the quarter

  return { startDate: start, endDate: end };
}

export function isEmpty(obj: object) {
  if (Array.isArray(obj)) {
    return obj.length === 0;
  }
  return Object.keys(obj).length === 0;
}

const isDateInCurrentWeek = (date) => {
  const now = new Date();
  const startOfWeek = new Date(now);
  const endOfWeek = new Date(now);
  // Adjust according to your week's start (here: Monday)
  startOfWeek.setDate(now.getDate() - now.getDay() + 1);
  startOfWeek.setHours(0, 0, 0, 0);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return date >= startOfWeek && date <= endOfWeek;
};

export function mapLocalStorageData(stateSetter) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const dashboardData: PastMonthTransactions = {
    lastMonthStats: [],
    monthlyStats: [],
    totalStats: [],
    typeStats: [],
    weekData: [],
    year: null,
  };

  const storedData = JSON.parse(localStorage.getItem("transactions") || "[]");
  const lastMonthStats = [
    {
      _id: null,
      totalAmount: 0,
      transactions: [],
    },
  ];
  const monthlyStats = [];
  const totalStats = [];
  let typeStats = [];
  for (const item of storedData) {
    const itemMonth = new Date(item.transactionDate).getMonth();
    const itemYear = new Date(item.transactionDate).getFullYear();
    const monthlyStatsIndex = monthlyStats.findIndex(
      (stat) => stat._id.month === itemMonth + 1
    );
    if (
      item.transactionDate &&
      itemMonth === currentMonth &&
      itemYear === currentYear
    ) {
      lastMonthStats[0].transactions.push(item);
      lastMonthStats[0].totalAmount += Number(item.amount);
    }
    if (monthlyStats && monthlyStatsIndex !== -1) {
      monthlyStats[monthlyStatsIndex].totalAmount += Number(item.amount);
      monthlyStats[monthlyStatsIndex].count++;
    } else {
      monthlyStats.push({
        _id: {
          month: itemMonth + 1,
        },
        totalAmount: Number(item.amount),
        count: 1,
      });
    }
    if (totalStats.length) {
      totalStats[0].totalAmount += Number(item.amount);
      totalStats[0].count++;
    } else {
      totalStats.push({
        _id: item.currency,
        totalAmount: Number(item.amount),
        count: 1,
      });
    }
  }
  if (lastMonthStats.length && lastMonthStats[0].transactions.length) {
    typeStats = Object.values(
      lastMonthStats[0].transactions.reduce((acc, txn) => {
        const key = txn.transactionType;
        if (!acc[key]) {
          acc[key] = { _id: key, totalAmount: 0, count: 0 };
        }
        acc[key].totalAmount += Number(txn.amount);
        acc[key].count += 1;
        return acc;
      }, {})
    );
  }
  const allTransactions = lastMonthStats.flatMap((item) => item.transactions);

  // Filtering only current week's
  const thisWeeksTxns = allTransactions.filter((txn) =>
    isDateInCurrentWeek(new Date(txn.transactionDate))
  );

  const weekData = Object.values(
    thisWeeksTxns.reduce((acc, txn) => {
      const dateKey = new Date(txn.transactionDate).toISOString().split("T")[0]; // YYYY-MM-DD
      if (!acc[dateKey]) acc[dateKey] = { _id: dateKey, totalAmount: 0 };
      acc[dateKey].totalAmount += Number(txn.amount);
      return acc;
    }, {})
  );

  stateSetter({
    lastMonthStats,
    monthlyStats,
    totalStats,
    typeStats,
    weekData,
    year: currentYear,
  });
}

export function isDateInCurrentMonth(date) {
  const current = new Date();
  return (
    date.getMonth() === current.getMonth() &&
    date.getFullYear() === current.getFullYear()
  );
}

export function isDateInCurrentQuarter(date) {
  const current = new Date();
  const currentQuarter = Math.floor(current.getMonth() / 3);
  const dateQuarter = Math.floor(date.getMonth() / 3);
  return (
    dateQuarter === currentQuarter &&
    date.getFullYear() === current.getFullYear()
  );
}

export function filterTransactionsByDateRange(transactions, rangeType) {
  const rangeChecks = {
    week: isDateInCurrentWeek,
    month: isDateInCurrentMonth,
    quarter: isDateInCurrentQuarter,
  };

  const checkFn = rangeChecks[rangeType];
  if (!checkFn) return transactions;

  return transactions.filter((txn) => checkFn(new Date(txn.transactionDate)));
}

export function filterTransactions(
  transactions,
  { selectedTimeRange, selectedCategory, searchQuery }
) {
  let filteredTransactions = filterTransactionsByDateRange(
    transactions,
    selectedTimeRange
  );

  if (selectedCategory && selectedCategory !== "all") {
    filteredTransactions = filteredTransactions.filter(
      (txn) => txn.transactionType === selectedCategory
    );
  }
  if (searchQuery) {
    filteredTransactions = filteredTransactions.filter((txn) =>
      txn.merchant.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return filteredTransactions;
}
