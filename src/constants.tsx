import { Check, Mail, Shield, User } from "lucide-react";
import { googleOAuth } from "./utils";
import { Button } from "./components/ui/button";
import { Progress } from "./components/ui/progress";

export const CATEGORIES = {
  bill_payment: "Bill Payment",
  entertainment: "Entertainment",
  fuel: "Fuel",
  transfer: "Transfer",
  purchase: "Purchase",
  other: "Other",
  subscription: "Subscription",
  refund: "Refund",
};

export const CATEGORY_COLORS = {
  bill_payment: "#dc2626", // Red-600 — urgency, bills, attention
  // food: "#22c55e", // Green-500 — fresh, natural, food
  entertainment: "#facc15", // Yellow-400 — fun, lively
  fuel: "#f97316", // Orange-500 — energy, gas
  transfer: "#3b82f6", // Blue-500 — trust, banks, financial transfers
  purchase: "#8b5cf6", // Purple-500 — shopping, style, ecommerce
  other: "#6b7280", // Gray-500 — neutral category
  subscription: "#10b981", // Emerald-500 — recurring payments, subscriptions
  refund: "#14b8a6", // Teal-500 — returns, refunds
};

export const getSteps = ({ onGoogleOAuth, onContinueGuest }) => [
  {
    title: "Welcome to PennyTrail!",
    description: "Let's get you set up in just a few simple steps",
    content: (
      <div className="space-y-6 text-center">
        <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
          <Check className="w-12 h-12 text-primary-foreground" />
        </div>
        <p className="text-lg text-muted-foreground">
          We'll help you connect your email and start tracking expenses
          automatically
        </p>
      </div>
    ),
  },
  {
    title: "Connect Your Email",
    description: "We'll scan for transaction confirmations and receipts",
    content: (
      <div className="space-y-6">
        <div className="bg-accent/20 p-6 rounded-lg border border-accent/30">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-primary mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Your Privacy is Protected</h3>
              <p className="text-sm text-muted-foreground">
                We only read transaction-related emails. Your personal emails
                remain completely private.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            variant="hero"
            className="w-full"
            onClick={() => onGoogleOAuth()}
            // disabled={}
          >
            <Mail className="w-4 h-4 mr-2" />
            {"Connect Gmail Account"}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={onContinueGuest}
          >
            <User className="w-4 h-4 mr-2" />
            Continue as Guest (No login)
          </Button>
        </div>
      </div>
    ),
  },
  {
    title: "Email Sync in Progress",
    description: "We're analyzing your past 3 months of transactions",
    content: (
      <div className="space-y-6 text-center">
        <div className="w-24 h-24 bg-gradient-success rounded-full flex items-center justify-center mx-auto animate-pulse">
          <Mail className="w-12 h-12 text-success-foreground" />
        </div>
        <div className="space-y-3">
          <Progress value={75} className="w-full" />
          <p className="text-sm text-muted-foreground">
            Categorizing expenses...
          </p>
        </div>
        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm">
            This usually takes 1-2 minutes. We're being thorough to ensure
            accuracy.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Setup Complete!",
    description: "Your expense tracker is ready to use",
    content: (
      <div className="space-y-6 text-center">
        <div className="w-24 h-24 bg-gradient-success rounded-full flex items-center justify-center mx-auto">
          <Check className="w-12 h-12 text-success-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold text-success">All Set!</h3>
          <p className="text-muted-foreground">
            We've found and categorized your transactions. Let's explore your
            dashboard.
          </p>
        </div>
      </div>
    ),
  },
];
