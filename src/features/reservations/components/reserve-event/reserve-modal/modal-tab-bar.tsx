"use client";

interface ModalTabBarProps {
  tabOrder: string[];
  tabLabels: Record<string, string>;
  activeTab: string;
}

export function ModalTabBar({ tabOrder, tabLabels, activeTab }: ModalTabBarProps) {
  return (
    <>
      <div className="grid grid-cols-3 mb-4 sm:mb-4 bg-muted rounded-lg p-1 overflow-x-auto">
        {tabOrder.map((tab) => (
          <div
            key={tab}
            className={`flex items-center justify-center py-2 px-2 sm:py-2.5 sm:px-4 rounded-md text-base font-medium transition-colors ${
              activeTab === tab
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
            style={{ cursor: "default", minWidth: "100px" }}
          >
            {tabLabels[tab]}
          </div>
        ))}
      </div>
    </>
  );
}
