"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UserPlus, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-[#0f1623] flex-col text-white z-50">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#0f1623] flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">HR</div>
          <span className="font-semibold text-white text-sm tracking-wide">HRIS Оценка</span>
        </div>
        <button onClick={() => setOpen(true)} className="text-white/70 hover:text-white p-1">
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="relative w-64 bg-[#0f1623] flex flex-col text-white h-full shadow-xl">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">
              <X size={20} />
            </button>
            <SidebarContent pathname={pathname} onNav={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0f1623] border-t border-white/10 flex z-50">
        <BottomNavLink href="/" icon={<LayoutDashboard size={20} />} label="Табло" active={pathname === "/"} />
        <BottomNavLink href="/candidates/new" icon={<UserPlus size={20} />} label="Нов кандидат" active={pathname === "/candidates/new"} />
      </nav>
    </>
  );
}

function SidebarContent({ pathname, onNav }: { pathname: string; onNav?: () => void }) {
  return (
    <>
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">HR</div>
        <span className="font-semibold text-base tracking-wide">HRIS Оценка</span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 px-3 pt-2 pb-1">Меню</p>
        <NavLink href="/" icon={<LayoutDashboard size={16} />} label="Табло" active={pathname === "/"} onClick={onNav} />
        <NavLink href="/candidates/new" icon={<UserPlus size={16} />} label="Нов кандидат" active={pathname === "/candidates/new"} onClick={onNav} />
      </nav>
      <div className="px-6 py-4 border-t border-white/10 text-xs text-white/30">
        Система за оценка · v1.0
      </div>
    </>
  );
}

function NavLink({ href, icon, label, active, onClick }: { href: string; icon: React.ReactNode; label: string; active: boolean; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function BottomNavLink({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors ${
        active ? "text-white" : "text-white/50"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
