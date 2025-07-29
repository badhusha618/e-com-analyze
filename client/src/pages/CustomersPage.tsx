import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectFilteredCustomers,
  selectCustomerMetrics,
  selectCustomerFilters,
  selectCustomersLoading,
  selectCustomersError,
} from "@/store/selectors";
import {
  fetchCustomers,
  fetchCustomerMetrics,
  setFilters,
  clearFilters,
} from "@/store/slices/customersSlice";
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
import { Search, Users, TrendingUp, Calendar, DollarSign, Filter, X } from "lucide-react";
import { format } from "date-fns";

export default function CustomersPage() {
  const dispatch = useAppDispatch();
  
  // Select state from Redux
  const customers = useAppSelector(selectFilteredCustomers);
  const metrics = useAppSelector(selectCustomerMetrics);
  const filters = useAppSelector(selectCustomerFilters);
  const isLoading = useAppSelector(selectCustomersLoading);
  const error = useAppSelector(selectCustomersError);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchCustomers());
    dispatch(fetchCustomerMetrics());
  }, [dispatch]);

  const handleFilterChange = (key: string, value: string) => {
    dispatch(setFilters({ [key]: value }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

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

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600 dark:text-red-400">Failed to load customer data: {error}</p>
            <Button 
              onClick={() => {
                dispatch(fetchCustomers());
                dispatch(fetchCustomerMetrics());
              }}
              className="mt-2"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
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
            <div className="text-2xl font-bold">
              {isLoading ? "..." : metrics?.totalCustomers?.toLocaleString() || customers.length.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${isLoading ? "..." : metrics?.totalRevenue?.toLocaleString() || 
                customers.reduce((sum, c) => sum + parseFloat(c.totalSpent || "0"), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${isLoading ? "..." : metrics?.averageOrderValue?.toFixed(2) || 
                (customers.reduce((sum, c) => sum + parseFloat(c.totalSpent || "0"), 0) / 
                 Math.max(1, customers.reduce((sum, c) => sum + (c.orderCount || 0), 0))).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Champions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : metrics?.segmentCounts?.champions || 
                customers.filter(c => c.segment === 'champions').length}
            </div>
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
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.segment} onValueChange={(value) => handleFilterChange('segment', value)}>
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
            
            <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
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
              onClick={() => handleFilterChange('sortOrder', filters.sortOrder === "asc" ? "desc" : "asc")}
            >
              {filters.sortOrder === "asc" ? "↑" : "↓"}
            </Button>

            {(filters.searchTerm || filters.segment !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer List ({customers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
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
                  {customers.map((customer) => (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}