import { ChevronDown, Search, Bell, Home, CheckCircle2, Plus, MoreHorizontal } from "lucide-react";

const DashboardPreview = () => {
  return (
    <div className="w-full rounded-xl overflow-hidden bg-background border border-border text-[11px] select-none pointer-events-none flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-foreground text-primary-foreground flex items-center justify-center text-[10px] font-semibold">N</div>
          <span className="font-semibold text-foreground">Nexora</span>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </div>
        <div className="hidden md:flex items-center gap-2 flex-1 max-w-[200px] mx-4">
          <div className="flex items-center gap-1.5 w-full rounded-md border border-border px-2 py-1 text-muted-foreground">
            <Search className="w-3 h-3" />
            <span className="flex-1">Search...</span>
            <span className="text-[9px] bg-secondary px-1 rounded">⌘K</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:block rounded-full bg-accent text-accent-foreground px-2.5 py-1 text-[10px] font-medium">Move Money</div>
          <Bell className="w-3.5 h-3.5 text-muted-foreground" />
          <div className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-[9px] font-semibold">JB</div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-40 border-r border-border py-2 px-2 gap-0.5 shrink-0">
          {[
            { label: "Home", active: true },
            { label: "Tasks", badge: "10" },
            { label: "Transactions" },
            { label: "Payments", chevron: true },
            { label: "Cards" },
            { label: "Capital" },
            { label: "Accounts", chevron: true },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex items-center justify-between px-2 py-1.5 rounded-md ${item.active ? "bg-secondary font-medium text-foreground" : "text-muted-foreground"}`}
            >
              <div className="flex items-center gap-1.5">
                {item.active && <Home className="w-3 h-3" />}
                <span>{item.label}</span>
              </div>
              {item.badge && <span className="bg-accent text-accent-foreground rounded-full px-1.5 text-[9px]">{item.badge}</span>}
              {item.chevron && <ChevronDown className="w-3 h-3" />}
            </div>
          ))}
          <div className="mt-3 px-2 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Workflows</div>
          {["Trade routes", "Payments", "Notifications", "Settings"].map((item) => (
            <div key={item} className="px-2 py-1.5 text-muted-foreground">{item}</div>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-3 bg-secondary/30 flex flex-col gap-3 min-w-0">
          <div className="text-sm font-semibold text-foreground">Welcome, Jane</div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { label: "Send", accent: true },
              { label: "Request" },
              { label: "Transfer" },
              { label: "Deposit" },
              { label: "Pay Bill" },
              { label: "Create Invoice" },
            ].map((btn) => (
              <div
                key={btn.label}
                className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${btn.accent ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"}`}
              >
                {btn.label}
              </div>
            ))}
            <span className="text-[10px] text-muted-foreground ml-1">Customize</span>
          </div>

          {/* Cards Row */}
          <div className="flex gap-3">
            {/* Balance Card */}
            <div className="flex-1 basis-0 bg-background rounded-lg border border-border p-3 flex flex-col gap-2 min-w-0">
              <div className="flex items-center gap-1 text-muted-foreground">
                <CheckCircle2 className="w-3 h-3 text-accent" />
                <span>Mercury Balance</span>
              </div>
              <div className="text-foreground text-lg font-semibold leading-none">
                $8,450,190<span className="text-xs text-muted-foreground">.32</span>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-muted-foreground">Last 30 Days</span>
                <span className="text-green-600">+$1.8M</span>
                <span className="text-red-500">-$900K</span>
              </div>
              <svg viewBox="0 0 300 80" className="w-full h-20" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(239 84% 67% / 0.15)" />
                    <stop offset="100%" stopColor="hsl(239 84% 67% / 0)" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,60 C30,55 60,40 90,35 C120,30 150,45 180,30 C210,15 240,20 270,10 C285,7 300,12 300,12 L300,80 L0,80 Z"
                  fill="url(#chartGrad)"
                />
                <path
                  d="M0,60 C30,55 60,40 90,35 C120,30 150,45 180,30 C210,15 240,20 270,10 C285,7 300,12 300,12"
                  fill="none"
                  stroke="hsl(239 84% 67%)"
                  strokeWidth="1.5"
                />
              </svg>
            </div>

            {/* Accounts Card */}
            <div className="flex-1 basis-0 bg-background rounded-lg border border-border p-3 flex flex-col min-w-0">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-foreground">Accounts</span>
                <div className="flex items-center gap-1">
                  <Plus className="w-3 h-3 text-muted-foreground" />
                  <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
                </div>
              </div>
              {[
                { name: "Credit", amount: "$98,125.50" },
                { name: "Treasury", amount: "$6,750,200.00" },
                { name: "Operations", amount: "$1,592,864.82" },
              ].map((acc) => (
                <div key={acc.name} className="flex items-center justify-between py-3 text-xs">
                  <span className="text-foreground">{acc.name}</span>
                  <span className="text-foreground">{acc.amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-background rounded-lg border border-border p-3">
            <div className="font-semibold text-foreground mb-2">Recent Transactions</div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-1.5 font-medium">Date</th>
                  <th className="text-left py-1.5 font-medium">Description</th>
                  <th className="text-right py-1.5 font-medium">Amount</th>
                  <th className="text-right py-1.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: "Mar 15", desc: "AWS", amount: "-$5,200", status: "Pending", color: "text-amber-500" },
                  { date: "Mar 14", desc: "Client Payment", amount: "+$125,000", status: "Completed", color: "text-green-600" },
                  { date: "Mar 13", desc: "Payroll", amount: "-$85,450", status: "Completed", color: "text-green-600" },
                  { date: "Mar 12", desc: "Office Supplies", amount: "-$1,200", status: "Completed", color: "text-green-600" },
                ].map((tx) => (
                  <tr key={tx.desc} className="border-b border-border last:border-0">
                    <td className="py-2 text-muted-foreground">{tx.date}</td>
                    <td className="py-2 text-foreground">{tx.desc}</td>
                    <td className="py-2 text-right text-foreground">{tx.amount}</td>
                    <td className={`py-2 text-right ${tx.color}`}>{tx.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPreview;
