import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MapPin, 
  Truck, 
  Store, 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  ArrowRightLeft,
  Gift,
  Search,
  ChevronDown,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  {
    name: 'Management',
    icon: MapPin,
    children: [
      { name: 'Regional', href: '/management/regional' },
      { name: 'Territory', href: '/management/territory' },
      { name: 'Area', href: '/management/area' },
    ]
  },
  { name: 'Suppliers', href: '/suppliers', icon: Truck },
  { name: 'Stores', href: '/stores', icon: Store },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Purchases', href: '/purchases', icon: ShoppingCart },
  { name: 'Sales', href: '/sales', icon: TrendingUp },
  { name: 'Stock Transfers', href: '/stock-transfers', icon: ArrowRightLeft },
  { name: 'Rewards', href: '/rewards', icon: Gift },
  { name: 'Product Locate', href: '/product-locate', icon: Search },
];

export function Sidebar() {
  const { sidebarCollapsed, mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Management']);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupName) 
        ? prev.filter(name => name !== groupName)
        : [...prev, groupName]
    );
  };

  const sidebarContent = (
    <div className="h-full bg-primary text-white flex flex-col">
      {/* Mobile header */}
      <div className="md:hidden p-4 border-b border-primary-hover flex items-center justify-between">
        <span className="font-semibold">Navigation</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileMenuOpen(false)}
          className="text-white hover:bg-primary-hover"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          if (item.children) {
            const isExpanded = expandedGroups.includes(item.name);
            return (
              <div key={item.name}>
                <Button
                  variant="ghost"
                  onClick={() => toggleGroup(item.name)}
                  className={cn(
                    "w-full justify-start text-white hover:bg-primary-hover",
                    sidebarCollapsed && "justify-center"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {!sidebarCollapsed && (
                    <>
                      <span className="ml-3">{item.name}</span>
                      <ChevronDown 
                        className={cn(
                          "h-4 w-4 ml-auto transition-transform",
                          isExpanded && "rotate-180"
                        )} 
                      />
                    </>
                  )}
                </Button>
                
                {isExpanded && !sidebarCollapsed && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.href}
                        to={child.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            "block px-3 py-2 text-sm rounded-md transition-colors",
                            isActive
                              ? "admin-nav-active text-white"
                              : "text-white/80 hover:bg-primary-hover hover:text-white"
                          )
                        }
                      >
                        {child.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2 rounded-md text-white transition-colors",
                  isActive
                    ? "admin-nav-active"
                    : "hover:bg-primary-hover",
                  sidebarCollapsed && "justify-center"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {!sidebarCollapsed && <span className="ml-3">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );

  if (mobileMenuOpen) {
    return (
      <div className="md:hidden fixed inset-0 z-50 bg-black/50">
        <div className="w-64 h-full">
          {sidebarContent}
        </div>
      </div>
    );
  }

  return (
    <aside className={cn(
      "hidden md:flex flex-col bg-primary transition-all duration-300",
      sidebarCollapsed ? "w-16" : "w-64"
    )}>
      {sidebarContent}
    </aside>
  );
}