"use client";

interface ModalTabBarProps {
  tabOrder: string[];
  tabLabels: Record<string, string>;
  activeTab: string;
}

const gridColsMap: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
};

export function ModalTabBar({ tabOrder, tabLabels, activeTab }: ModalTabBarProps) {
  const gridCols = gridColsMap[tabOrder.length] || "grid-cols-3";
  return (
    <>
      <div className={`${gridCols} grid mb-4 sm:mb-4 bg-muted rounded-lg p-1 overflow-x-auto`}>
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
