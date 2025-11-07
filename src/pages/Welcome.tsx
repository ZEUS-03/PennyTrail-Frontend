import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Mail,
  Shield,
  TrendingUp,
  PieChart,
  BarChart3,
  ChevronRight,
  CheckCircle2,
  Target,
  Zap,
  ClockIcon,
} from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-dashboard.jpg";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useState } from "react";
import { getSelfCall, setGuest } from "@/store/slices/authSlice";
import { googleOAuth } from "@/utils";

const Welcome = () => {
  const dispatch = useAppDispatch();
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const { user, isAuthenticated, loading, error, isGuest } = useAppSelector(
    (state) => state.auth
  );
  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated && !loading && !initialCheckDone && !isGuest) {
        await dispatch(getSelfCall());
      }
      setInitialCheckDone(true);
    };
    checkAuth();
  }, []);

  if (user || isAuthenticated || isGuest) {
    return <Navigate to={"/dashboard"} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-emerald-50 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-teal-400 rounded-full blur-3xl opacity-20 animate-pulse" />
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400 rounded-full blur-3xl opacity-15 animate-pulse"
        style={{ animationDelay: "2s" }}
      />

      <section className="relative py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div className="space-y-4">
                <div className="inline-block">
                  <span className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    ✨ Smart Financial Management
                  </span>
                </div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-slate-900">
                  Penny
                  <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                    {" "}
                    Trail{" "}
                  </span>
                  Tracking
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed max-w-2xl">
                  Automatically extract transactions from your emails. Get
                  insights that help you save money and make better financial
                  decisions.
                </p>
              </div>

              <div className="flex flex-col  gap-4 justify-center lg:justify-start">
                <div className="flex sm:flex-row gap-4">
                  <Link to="/onboarding">
                    <button className="group bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                      Get Started
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                  <button
                    className="border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-lg font-semibold text-lg hover:border-teal-600 hover:text-teal-600 transition-all duration-300"
                    onClick={googleOAuth}
                  >
                    Sign In
                  </button>
                </div>
                <p className="ml-2">
                  Prefer not to sign in? <b>Continue as guest</b>
                </p>
                <div className="w-fit">
                  <Link to="/dashboard">
                    <button
                      className="group bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                      onClick={() => dispatch(setGuest(true))}
                    >
                      Continue as Guest
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 justify-center lg:justify-start pt-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-teal-600" />
                  <span className="font-medium">Free to use</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-teal-600" />
                  <span className="font-medium">No credit card</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-teal-600" />
                  <span className="font-medium">Privacy first</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-2xl blur-3xl opacity-20 animate-pulse" />
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg" />
                      <div>
                        <div className="font-semibold text-slate-900">
                          Dashboard
                        </div>
                        <div className="text-sm text-slate-500">
                          Financial Overview
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-4 rounded-lg">
                      <div className="text-sm text-slate-600 mb-1">
                        Total Expenses
                      </div>
                      <div className="text-3xl font-bold text-slate-900">
                        ₹45,230
                      </div>
                      <div className="text-sm text-emerald-600 mt-1">
                        ↓ 12% from last month
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <PieChart className="w-8 h-8 text-teal-600 mb-2" />
                        <div className="text-sm text-slate-600">Categories</div>
                        <div className="text-xl font-bold text-slate-900">
                          12
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <TrendingUp className="w-8 h-8 text-emerald-600 mb-2" />
                        <div className="text-sm text-slate-600">Saved</div>
                        <div className="text-xl font-bold text-slate-900">
                          ₹8,450
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Get started in three simple steps and take control of your
              finances
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-teal-300 via-emerald-300 to-teal-300" />

            {[
              {
                icon: Mail,
                step: "01",
                title: "Connect Your Email",
                description:
                  "Securely link your email account to automatically detect transaction receipts.",
              },
              {
                icon: Zap,
                step: "02",
                title: "Auto-Extract Data",
                description:
                  "Our smart system automatically reads and categorizes your expenses from email receipts.",
              },
              {
                icon: Target,
                step: "03",
                title: "Get Insights",
                description:
                  "View beautiful visualizations and get actionable insights to optimize your spending.",
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-100 relative z-10">
                  <div className="bg-gradient-to-br from-teal-500 to-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-5xl font-bold text-teal-100 mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Powerful features designed to make expense tracking effortless and
              insightful
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Mail,
                title: "Email Integration",
                description:
                  "Automatically extract transaction data from your email confirmations and receipts",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: PieChart,
                title: "Visual Insights",
                description:
                  "Beautiful charts and graphs that help you understand your spending patterns",
                color: "from-teal-500 to-emerald-500",
              },
              {
                icon: Shield,
                title: "Secure & Private",
                description:
                  "Bank-level security with end-to-end encryption for your financial data",
                color: "from-violet-500 to-purple-500",
              },
              {
                icon: TrendingUp,
                title: "Smart Analytics",
                description:
                  "AI-powered insights to help you identify savings opportunities",
                color: "from-emerald-500 to-green-500",
              },
              {
                icon: BarChart3,
                title: "Detailed Reports",
                description:
                  "Comprehensive spending reports with customizable date ranges and filters",
                color: "from-orange-500 to-red-500",
              },
              {
                icon: ClockIcon,
                title: "Real-time Updates",
                description:
                  "Get instant notifications and updates as new transactions are detected",
                color: "from-pink-500 to-rose-500",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:-translate-y-2"
              >
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/20 to-emerald-900/20" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Stop Manual Tracking
            </h2>
            <p className="text-xl text-slate-300">
              See how much time and effort you can save
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
              <div className="text-red-400 text-sm font-semibold mb-4">
                ❌ MANUAL TRACKING
              </div>
              <h3 className="text-2xl font-bold mb-6">The Old Way</h3>
              <ul className="space-y-4">
                {[
                  "Manually enter every expense",
                  "Search through emails for receipts",
                  "Calculate totals in spreadsheets",
                  "Create charts manually",
                  "Risk of missing transactions",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-400 text-xs">✕</span>
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-teal-600 to-emerald-600 rounded-2xl p-8 shadow-2xl">
              <div className="text-teal-100 text-sm font-semibold mb-4">
                ✓ SMART TRACKING
              </div>
              <h3 className="text-2xl font-bold mb-6">The Smart Way</h3>
              <ul className="space-y-4">
                {[
                  "Automatic expense detection",
                  "Instant email parsing",
                  "Auto-generated insights",
                  "Real-time visualizations",
                  "Never miss a transaction",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-teal-50">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-teal-600 to-emerald-600 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

            <div className="relative z-10 space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-3">
                Ready to Take Control of Your Finances?
              </h2>
              <p className="text-xl text-teal-50 max-w-2xl mx-auto pb-3">
                Start tracking your expenses smarter, not harder. Join today and
                see the difference.
              </p>
              <Link to="/onboarding">
                <button className="bg-white text-teal-600 px-10 py-5 rounded-xl font-bold text-lg hover:bg-teal-50 transition-all duration-300 hover:scale-105 shadow-xl inline-flex items-center gap-2 group">
                  Start Your Financial Journey
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <p className="text-teal-100 text-sm">
                No credit card required • Free forever
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Welcome;
