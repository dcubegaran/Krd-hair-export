"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  DollarSign,
  LogOut,
  Settings,
  Bell,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  Calendar,
  User,
  Mail,
} from "lucide-react";
import { useAuth } from "@/lib/auth_context";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminAuthGuard } from "@/components/admin_auth_guard";
import { AddProductModal } from "@/components/add_product_modal";
import { QuoteService } from "@/lib/services/quoteService";
import { ProductService } from "@/lib/services/productService";
import { AdminService } from "@/lib/services/adminService";
import { QuoteRequest, Product } from "@/lib/types/database";

export default function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    revenue: 0,
    totalQuotes: 0,
    submittedQuotes: 0,
    quotedQuotes: 0,
    approvedQuotes: 0,
  });

  // Fetch data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch products
        const fetchedProducts = await ProductService.getAllProducts();
        setProducts(fetchedProducts);

        // Fetch quotes
        const fetchedQuotes = await QuoteService.getAllQuotes();
        setQuotes(fetchedQuotes);

        // Fetch dashboard stats
        const dashboardStats = await AdminService.getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSignOut = async () => {
    try {
      // Clear test admin data from localStorage
      localStorage.removeItem("testAdminUser");
      localStorage.removeItem("testAdminRole");

      // Sign out from Firebase if authenticated
      await signOut(auth);

      // Force page reload to clear all states
      window.location.href = "/krd_panel";
    } catch (error) {
      console.error("Error signing out:", error);
      // Even if Firebase signout fails, clear local storage and reload
      localStorage.removeItem("testAdminUser");
      localStorage.removeItem("testAdminRole");
      window.location.href = "/krd_panel";
    }
  };

  const handleProductAdded = (newProduct: Product) => {
    // Add the new product to the products list
    setProducts((prev) => [...prev, newProduct]);

    // Update stats
    setStats((prev) => ({
      ...prev,
      totalProducts: prev.totalProducts + 1,
    }));
  };

  const recentOrders = [
    {
      id: "ORD-001",
      customer: "Sarah Johnson",
      amount: 1250,
      status: "Processing",
      date: "2024-01-15",
    },
    {
      id: "ORD-002",
      customer: "Mike Chen",
      amount: 890,
      status: "Shipped",
      date: "2024-01-14",
    },
    {
      id: "ORD-003",
      customer: "Emma Davis",
      amount: 2100,
      status: "Delivered",
      date: "2024-01-13",
    },
  ];

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">
                KRD Admin Panel
              </h1>
              <Badge variant="secondary">v2.0</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Welcome, {user?.displayName || "Admin"}
                </span>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 border-r bg-muted/10 min-h-[calc(100vh-4rem)]">
            <nav className="p-4 space-y-2">
              <Button
                variant={activeTab === "dashboard" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("dashboard")}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant={activeTab === "products" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("products")}
              >
                <Package className="mr-2 h-4 w-4" />
                Products
              </Button>
              <Button
                variant={activeTab === "orders" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("orders")}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Orders
              </Button>
              <Button
                variant={activeTab === "customers" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("customers")}
              >
                <Users className="mr-2 h-4 w-4" />
                Customers
              </Button>
              <Button
                variant={activeTab === "quotes" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("quotes")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Quotes
              </Button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">
                    Dashboard
                  </h2>
                  <p className="text-muted-foreground">
                    Overview of your business performance
                  </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Products
                      </CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.totalProducts}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        +12% from last month
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Orders
                      </CardTitle>
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.totalOrders}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        +8% from last month
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Customers
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.totalCustomers}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        +15% from last month
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Revenue
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ${stats.revenue.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        +22% from last month
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Orders */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>
                      Latest customer orders and their status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentOrders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{order.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.customer}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${order.amount}</p>
                            <Badge
                              variant={
                                order.status === "Delivered"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "products" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                      Products
                    </h2>
                    <p className="text-muted-foreground">
                      Manage your hair product inventory
                    </p>
                  </div>
                  <Button onClick={() => setIsAddProductModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </div>

                {/* Search and Filter */}
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search products..." className="pl-10" />
                  </div>
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="low-stock">Low Stock</SelectItem>
                      <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Products Table */}
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b">
                          <tr>
                            <th className="text-left p-4 font-medium">
                              Product
                            </th>
                            <th className="text-left p-4 font-medium">SKU</th>
                            <th className="text-left p-4 font-medium">Stock</th>
                            <th className="text-left p-4 font-medium">Price</th>
                            <th className="text-left p-4 font-medium">
                              Status
                            </th>
                            <th className="text-left p-4 font-medium">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((product) => (
                            <tr key={product.id} className="border-b">
                              <td className="p-4 font-medium">
                                {product.name}
                              </td>
                              <td className="p-4 text-muted-foreground">
                                {product.sku}
                              </td>
                              <td className="p-4">
                                <Badge
                                  variant={
                                    product.stock < 20
                                      ? "destructive"
                                      : "secondary"
                                  }
                                >
                                  {product.stock}
                                </Badge>
                              </td>
                              <td className="p-4">${product.price}</td>
                              <td className="p-4">
                                <Badge
                                  variant={
                                    product.status === "Active"
                                      ? "default"
                                      : "destructive"
                                  }
                                >
                                  {product.status}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center space-x-2">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
                  <p className="text-muted-foreground">
                    Manage customer orders and fulfillment
                  </p>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">
                      Order management interface coming soon...
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "customers" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">
                    Customers
                  </h2>
                  <p className="text-muted-foreground">
                    Manage customer relationships and data
                  </p>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">
                      Customer management interface coming soon...
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "quotes" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                      Quote Requests
                    </h2>
                    <p className="text-muted-foreground">
                      Manage customer quote requests and responses
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {quotes.length} Total Quotes
                  </Badge>
                </div>

                {/* Quote Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Submitted
                      </CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.submittedQuotes}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Awaiting response
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Quoted
                      </CardTitle>
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.quotedQuotes}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Response sent
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Approved
                      </CardTitle>
                      <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.approvedQuotes}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Converted to orders
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Value
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        $
                        {stats.totalQuotes > 0
                          ? (
                              quotes.reduce(
                                (sum, quote) => sum + (quote.totalValue || 0),
                                0
                              ) / stats.totalQuotes
                            ).toFixed(0)
                          : "0"}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Average per quote
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Quotes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Quote Requests</CardTitle>
                    <CardDescription>
                      Latest customer quote submissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <p className="text-center text-muted-foreground">
                        Loading quotes...
                      </p>
                    ) : quotes.length === 0 ? (
                      <p className="text-center text-muted-foreground">
                        No quotes found
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {quotes.map((quote) => (
                          <div
                            key={quote.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">
                                  {quote.customerName}
                                </p>
                                <Badge
                                  variant={
                                    quote.status === "submitted"
                                      ? "default"
                                      : quote.status === "quoted"
                                      ? "secondary"
                                      : "outline"
                                  }
                                >
                                  {quote.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {quote.companyName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {quote.email}
                              </p>
                            </div>
                            <div className="text-right space-y-1">
                              <p className="font-medium">
                                ${quote.totalValue?.toLocaleString()}{" "}
                                {quote.currency}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {quote.createdAt
                                  ? new Date(
                                      quote.createdAt as any
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </p>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>

        {/* Add Product Modal */}
        <AddProductModal
          isOpen={isAddProductModalOpen}
          onClose={() => setIsAddProductModalOpen(false)}
          onProductAdded={handleProductAdded}
        />
      </div>
    </AdminAuthGuard>
  );
}
