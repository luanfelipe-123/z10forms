"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Calendar,
  Blocks,
  Settings,
  Bell,
  LogOut,
} from "lucide-react";

interface Props {
  user: any;
}

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Formulários", href: "/dashboard/forms", icon: FileText },
  { name: "Leads", href: "/dashboard/leads", icon: Users },
  { name: "Agenda", href: "/dashboard/agenda", icon: Calendar },
  { name: "Integrações", href: "/dashboard/integrations", icon: Blocks },
  { name: "Configurações", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar({ user }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-white flex flex-col h-full">
      {/* Logo & Header */}
      <div className="p-6 border-b flex items-center justify-between">
        <div className="font-bold text-xl text-blue-600">FormBuilder</div>
        <div className="flex items-center gap-3 text-gray-500">
          <button className="hover:text-gray-900 transition-colors">
            <Bell size={18} />
          </button>
        </div>
      </div>

      {/* User Info (simulated minimal version) */}
      <div className="px-6 py-4 border-b flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
          {user?.email?.charAt(0).toUpperCase() || "U"}
        </div>
        <div className="text-sm font-medium truncate flex-1">
          {user?.email}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut size={18} />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
