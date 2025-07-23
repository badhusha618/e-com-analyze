import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";
import type { Customer } from "@shared/schema";

interface CustomerWithMetrics extends Customer {
  lastPurchaseDate?: string;
  segment: string;
  recencyScore: number;
  frequencyScore: number;
  monetaryScore: number;
}

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [sortBy, setSortBy] = useState<string>("totalSpent");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data: customers = [], isLoading, error } = useQuery<CustomerWithMetrics[]>({
    queryKey: ["/api/customers"],
  });

  // Calculate customer segments and RFM scores
  const customersWithRFM = customers.map(customer => {
    // Calculate recency score (0-100, higher is better)
    const daysSinceLastPurchase = customer.lastPurchaseDate 
      ? Math.floor((Date.now() - new Date(customer.lastPurchaseDate).getTime()) / (1000 * 60 * 60 * 24))
      : 365;
    const recencyScore = Math.max(0, 100 - (daysSinceLastPurchase / 3.65));

    // Calculate frequency score (based on order count)
    const frequencyScore = Math.min(100, (customer.orderCount || 0) * 10);

    // Calculate monetary score (based on total spent)
    const monetaryScore = Math.min(100, parseFloat(customer.totalSpent || "0") / 10);

    // Determine segment based on RFM scores
    let segment = "new";
    const avgScore = (recencyScore + frequencyScore + monetaryScore) / 3;
    
    if (avgScore >= 70) segment = "champions";
    else if (avgScore >= 50) segment = "loyal_customers";
    else if (recencyScore >= 60 && frequencyScore < 30) segment = "new_customers";
    else if (recencyScore < 30) segment = "at_risk";
    else segment = "potential_loyalists";

    return {
      ...customer,
      segment,
      recencyScore: Math.round(recencyScore),
      frequencyScore: Math.round(frequencyScore),
      monetaryScore: Math.round(monetaryScore),
    };
  });

  // Filter and sort customers
  const filteredCustomers = customersWithRFM
    .filter(customer => {
      const matchesSearch = 
        customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSegment = segmentFilter === "all" || customer.segment === segmentFilter;
      
      return matchesSearch && matchesSegment;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "totalSpent":
          aValue = parseFloat(a.totalSpent || "0");
          bValue = parseFloat(b.totalSpent || "0");
          break;
        case "orderCount":
          aValue = a.orderCount || 0;
          bValue = b.orderCount || 0;
          break;
        case "registrationDate":
          aValue = new Date(a.registrationDate || 0).getTime();
          bValue = new Date(b.registrationDate || 0).getTime();
          break;
        case "rfmScore":
          aValue = (a.recencyScore + a.frequencyScore + a.monetaryScore) / 3;
          bValue = (b.recencyScore + b.frequencyScore + b.monetaryScore) / 3;
          break;
        default:
          aValue = a.firstName;
          bValue = b.firstName;
      }
      
      if (sortOrder === "desc") {
        return aValue > bValue ? -1 : 1;
      }
      return aValue < bValue ? -1 : 1;
    });

  const getSegmentBadge = (segment: string) => {
    const variants = {
      champions: "default",
      loyal_customers: "secondary",
      potential_loyalists: "outline",
      new_customers: "default",
      at_risk: "destructive",
      new: "outline"
    } as const;

    const labels = {
      champions: "Champions",
      loyal_customers: "Loyal",
      potential_loyalists: "Potential",
      new_customers: "New",
      at_risk: "At Risk",
      new: "New"
    };

    return (
      <Badge variant={variants[segment as keyof typeof variants] || "outline"}>
        {labels[segment as keyof typeof labels] || segment}
      </Badge>
    );
  };

  const getRFMColor = (score: number) => {
    if (score >= 70) return "text-green-600 dark:text-green-400";
    if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  // Calculate summary metrics
  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + parseFloat(c.totalSpent || "0"), 0);
  const averageOrderValue = totalRevenue / Math.max(1, customers.reduce((sum, c) => sum + (c.orderCount || 0), 0));
  const segmentCounts = customersWithRFM.reduce((acc, c) => {
    acc[c.segment] = (acc[c.segment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (error) {
    return (
      <AppLayout title="Customers">
        <div className="p-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-red-600 dark:text-red-400">Failed to load customer data</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Customers" loading={isLoading}>
      <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">Manage customer relationships and analyze segments</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageOrderValue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Champions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{segmentCounts.champions || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={segmentFilter} onValueChange={setSegmentFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by segment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Segments</SelectItem>
                <SelectItem value="champions">Champions</SelectItem>
                <SelectItem value="loyal_customers">Loyal Customers</SelectItem>
                <SelectItem value="potential_loyalists">Potential Loyalists</SelectItem>
                <SelectItem value="new_customers">New Customers</SelectItem>
                <SelectItem value="at_risk">At Risk</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="totalSpent">Total Spent</SelectItem>
                <SelectItem value="orderCount">Order Count</SelectItem>
                <SelectItem value="registrationDate">Registration Date</SelectItem>
                <SelectItem value="rfmScore">RFM Score</SelectItem>
                <SelectItem value="firstName">Name</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer List ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Segment</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Registration</TableHead>
                  <TableHead>RFM Scores</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.firstName} {customer.lastName}
                    </TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{getSegmentBadge(customer.segment)}</TableCell>
                    <TableCell>{customer.orderCount || 0}</TableCell>
                    <TableCell>${parseFloat(customer.totalSpent || "0").toFixed(2)}</TableCell>
                    <TableCell>
                      {customer.registrationDate 
                        ? format(new Date(customer.registrationDate), "MMM d, yyyy")
                        : "N/A"
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 text-sm">
                        <span className={`font-medium ${getRFMColor(customer.recencyScore)}`}>
                          R:{customer.recencyScore}
                        </span>
                        <span className={`font-medium ${getRFMColor(customer.frequencyScore)}`}>
                          F:{customer.frequencyScore}
                        </span>
                        <span className={`font-medium ${getRFMColor(customer.monetaryScore)}`}>
                          M:{customer.monetaryScore}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </div>
    </AppLayout>
  );
}