"use client";

import { useState } from "react";
import { useFinance } from "@/contexts/finance-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/finance-utils";
import { 
  Receipt, 
  Search, 
  Calendar, 
  Filter, 
  TrendingDown,
  TrendingUp,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ArrowDownLeft,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { InputSection } from "@/components/dashboard/input-section";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const categoryColors: Record<string, string> = {
  Entertainment: "bg-chart-1/10 text-chart-1",
  Food: "bg-chart-2/10 text-chart-2",
  Travel: "bg-chart-3/10 text-chart-3",
  Shopping: "bg-chart-4/10 text-chart-4",
  Utilities: "bg-chart-5/10 text-chart-5",
  Health: "bg-primary/10 text-primary",
  Education: "bg-accent/10 text-accent",
  Others: "bg-muted text-muted-foreground",
};

export default function ExpensesPage() {
  const { transactions, categoryBreakdown, summary, hasData } = useFinance();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showAddExpense, setShowAddExpense] = useState(false);

  if (!hasData) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
          <p className="mt-1 text-muted-foreground">
            Track and analyze your spending
          </p>
        </div>
        <div className="mx-auto max-w-2xl">
          <InputSection />
        </div>
      </div>
    );
  }

  // Get unique categories
  const categories = [...new Set(transactions.map((t) => t.category || "Others"))];

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || transaction.category === categoryFilter;
    const matchesType = 
      typeFilter === "all" || transaction.type === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });
  
  // Calculate separate totals for display
  const totalCredits = transactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = transactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + t.amount, 0);

  // Sort by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Prepare chart data
  const chartData = categoryBreakdown?.map((item, index) => ({
    name: item.name,
    value: item.value,
    fill: COLORS[index % COLORS.length],
  })) || [];

  // Monthly trend data (mock for visualization)
  const monthlyTrendData = [
    { month: "Jan", amount: (summary?.totalSpend || 0) * 0.85 },
    { month: "Feb", amount: (summary?.totalSpend || 0) * 0.92 },
    { month: "Mar", amount: (summary?.totalSpend || 0) * 1.1 },
    { month: "Apr", amount: (summary?.totalSpend || 0) * 0.95 },
    { month: "May", amount: (summary?.totalSpend || 0) * 1.05 },
    { month: "Jun", amount: summary?.totalSpend || 0 },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
          <p className="mt-1 text-muted-foreground">
            Track and analyze your spending patterns
          </p>
        </div>
        <Button onClick={() => setShowAddExpense(!showAddExpense)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Add Expense Form */}
      {showAddExpense && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add New Expense</CardTitle>
            <CardDescription>Enter your expense details below</CardDescription>
          </CardHeader>
          <CardContent>
            <InputSection />
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">
              +{formatCurrency(totalCredits)}
            </div>
            <p className="mt-1 flex items-center text-xs text-muted-foreground">
              <ArrowDownLeft className="mr-1 h-3 w-3 text-chart-1" />
              Money received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Debits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              -{formatCurrency(totalDebits)}
            </div>
            <p className="mt-1 flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="mr-1 h-3 w-3 text-destructive" />
              Money spent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalCredits - totalDebits >= 0 ? "text-chart-1" : "text-destructive"}`}>
              {totalCredits - totalDebits >= 0 ? "+" : ""}{formatCurrency(totalCredits - totalDebits)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Credits - Debits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {transactions.length}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {transactions.filter(t => t.type === "credit").length} credits, {transactions.filter(t => t.type === "debit").length} debits
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="mb-8 grid gap-8 lg:grid-cols-2">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expense by Category</CardTitle>
            <CardDescription>
              Distribution of your spending across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {categoryBreakdown?.slice(0, 5).map((category, index) => {
                const percentage = summary
                  ? ((category.value / summary.totalSpend) * 100).toFixed(1)
                  : "0";
                return (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-foreground">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatCurrency(category.value)}</span>
                      <span className="text-xs text-muted-foreground">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
            <CardDescription>
              Your spending pattern over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <Receipt className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>
                  {filteredTransactions.length} transactions found
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="credit">Credits Only</SelectItem>
                <SelectItem value="debit">Debits Only</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Transaction list */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {sortedTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      transaction.type === "credit" ? "bg-chart-1/10" : "bg-destructive/10"
                    }`}>
                      {transaction.type === "credit" ? (
                        <TrendingUp className="h-5 w-5 text-chart-1" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {transaction.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(transaction.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        <Badge variant="outline" className="text-xs">
                          {transaction.type === "credit" ? "Credit" : "Debit"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant="secondary"
                      className={
                        categoryColors[transaction.category || "Others"] ||
                        categoryColors.Others
                      }
                    >
                      {transaction.category || "Others"}
                    </Badge>
                    <span className={`min-w-[100px] text-right text-lg font-semibold ${
                      transaction.type === "credit" ? "text-chart-1" : "text-destructive"
                    }`}>
                      {transaction.type === "credit" ? "+" : "-"}{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
