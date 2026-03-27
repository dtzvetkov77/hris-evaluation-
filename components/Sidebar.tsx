"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UserPlus } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#0f1623] flex flex-col text-white z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">HR</div>
        <span className="font-semibold text-base tracking-wide">HRIS Оценка</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 px-3 pt-2 pb-1">Меню</p>
        <NavLink href="/" icon={<LayoutDashboard size={16} />} label="Табло" active={pathname === "/"} />
        <NavLink href="/candidates/new" icon={<UserPlus size={16} />} label="Нов кандидат" active={pathname === "/candidates/new"} />
      </nav>

      <div className="px-6 py-4 border-t border-white/10 text-xs text-white/30">
        Система за оценка · v1.0
      </div>
    </aside>
  );
}

function NavLink({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
