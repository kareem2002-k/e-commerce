'use client'

import { useState } from "react"
import Link from "next/link"
import { PlusCircle, Users, ShoppingCart, Package, Settings, BarChart3, FileText, Tag, Layout, ImageIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  // Navigation cards for different admin areas
  const adminNavItems = [
    {
      title: "Products",
      description: "Manage your product catalog",
      icon: <Package className="h-6 w-6" />,
      href: "/home/admin/products",
      color: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
      title: "Orders",
      description: "View and process customer orders",
      icon: <ShoppingCart className="h-6 w-6" />,
      href: "/home/admin/orders",
      color: "bg-green-100 dark:bg-green-900/20"
    },
    {
      title: "Users",
      description: "Manage user accounts",
      icon: <Users className="h-6 w-6" />,
      href: "/home/admin/users",
      color: "bg-yellow-100 dark:bg-yellow-900/20"
    },
    {
      title: "Analytics",
      description: "View store analytics and reports",
      icon: <BarChart3 className="h-6 w-6" />,
      href: "/home/admin/analytics",
      color: "bg-purple-100 dark:bg-purple-900/20"
    },
    {
      title: "Categories",
      description: "Manage product categories",
      icon: <Tag className="h-6 w-6" />,
      href: "/home/admin/categories",
      color: "bg-pink-100 dark:bg-pink-900/20"
    },
    {
      title: "Hero Section",
      description: "Customize the homepage hero section",
      icon: <Layout className="h-6 w-6" />,
      href: "/home/admin/content/hero",
      color: "bg-indigo-100 dark:bg-indigo-900/20"
    },
    {
      title: "Deals Banner",
      description: "Manage promotional banners",
      icon: <ImageIcon className="h-6 w-6" />,
      href: "/home/admin/content/deals-banner",
      color: "bg-red-100 dark:bg-red-900/20"
    },
    {
      title: "Reports",
      description: "Generate and view reports",
      icon: <FileText className="h-6 w-6" />,
      href: "/home/admin/reports",
      color: "bg-orange-100 dark:bg-orange-900/20"
    },
    {
      title: "Settings",
      description: "Configure store settings",
      icon: <Settings className="h-6 w-6" />,
      href: "/home/admin/settings",
      color: "bg-gray-100 dark:bg-gray-800/50"
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground">Manage your e-commerce platform in one place.</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => router.push('/home/admin/products/new')}>
          <PlusCircle className="h-4 w-4" />
          <span>New Product</span>
        </Button>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {adminNavItems.map((item, index) => (
              <Card key={index} className="overflow-hidden transition-all hover:shadow-md">
                <Link href={item.href} className="block h-full">
                  <CardHeader className={`${item.color} flex flex-row items-center gap-4`}>
                    <div className="bg-white rounded-md p-2 dark:bg-gray-800">
                      {item.icon}
                    </div>
                    <div>
                      <CardTitle>{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardDescription className="text-sm">{item.description}</CardDescription>
                  </CardContent>
                  <CardFooter className="bg-muted/30 p-4">
                    <span className="text-xs font-medium">Click to manage →</span>
                  </CardFooter>
                </Link>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>View detailed statistics about your store's performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border border-dashed rounded-md">
                <p className="text-muted-foreground">Analytics charts will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports Center</CardTitle>
              <CardDescription>Generate and download reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border border-dashed rounded-md">
                <p className="text-muted-foreground">Report templates will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>System and user notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border border-dashed rounded-md">
                <p className="text-muted-foreground">No new notifications</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Quick Actions</h3>
        <Separator className="my-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="h-20 flex flex-col gap-1"
            onClick={() => router.push('/home/admin/products/new')}
          >
            <Package className="h-5 w-5" />
            <span>Add Product</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col gap-1"
            onClick={() => router.push('/home/admin/categories/new')}
          >
            <Tag className="h-5 w-5" />
            <span>Add Category</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col gap-1"
            onClick={() => router.push('/home/admin/content/hero')}
          >
            <Layout className="h-5 w-5" />
            <span>Edit Hero</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col gap-1"
            onClick={() => router.push('/home/admin/content/deals-banner')}
          >
            <ImageIcon className="h-5 w-5" />
            <span>Edit Banner</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
