"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ChevronRight, 
  Home,
  Package,
  Tag,
  FileText,
  Layout,
  ShoppingCart,
  Users,
  BarChart3,
  MegaphoneIcon,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { JSX } from "react";

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  
  // Skip if not in admin section
  if (!pathname?.includes('/admin')) {
    return null;
  }
  
  // Split path into segments
  const segments = pathname.split('/').filter(Boolean);
  
  // Map segments to readable names and icons
  const segmentMap: Record<string, { label: string; icon: JSX.Element }> = {
    home: { label: 'Home', icon: <Home className="h-4 w-4" /> },
    admin: { label: 'Admin', icon: <Settings className="h-4 w-4" /> },
    products: { label: 'Products', icon: <Package className="h-4 w-4" /> },
    categories: { label: 'Categories', icon: <Tag className="h-4 w-4" /> },
    coupons: { label: 'Coupons', icon: <FileText className="h-4 w-4" /> },
    campaigns: { label: 'Campaigns', icon: <MegaphoneIcon className="h-4 w-4" /> },
    content: { label: 'Content', icon: <Layout className="h-4 w-4" /> },
    orders: { label: 'Orders', icon: <ShoppingCart className="h-4 w-4" /> },
    users: { label: 'Users', icon: <Users className="h-4 w-4" /> },
    analytics: { label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
  };
  
  // Generate breadcrumb items with proper links
  const breadcrumbItems = segments.map((segment, index) => {
    // Build the href for this breadcrumb
    const href = `/${segments.slice(0, index + 1).join('/')}`;
    
    // Get label and icon or use segment as fallback
    const segmentInfo = segmentMap[segment] || { 
      label: segment.charAt(0).toUpperCase() + segment.slice(1), 
      icon: null
    };
    
    return {
      href,
      label: segmentInfo.label,
      icon: segmentInfo.icon,
      isLast: index === segments.length - 1
    };
  });
  
  return (
    <nav aria-label="Breadcrumb" className="mb-4 py-2">
      <ol className="flex items-center flex-wrap">
        {breadcrumbItems.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
            )}
            
            <Link
              href={item.href}
              className={cn(
                "flex items-center text-sm hover:text-blue-600 transition-colors",
                item.isLast 
                  ? "font-semibold text-foreground" 
                  : "text-muted-foreground hover:underline"
              )}
              aria-current={item.isLast ? "page" : undefined}
            >
              {item.icon && (
                <span className="mr-1.5">{item.icon}</span>
              )}
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
} 