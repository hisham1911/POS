import {
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels
} from "@headlessui/react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const Tabs = ({
  selectedIndex,
  onChange,
  className,
  children
}: {
  selectedIndex?: number;
  onChange?: (index: number) => void;
  className?: string;
  children: ReactNode;
}) => (
  <TabGroup selectedIndex={selectedIndex} onChange={onChange} className={className}>
    {children}
  </TabGroup>
);

export const TabsList = ({
  className,
  children
}: {
  className?: string;
  children: ReactNode;
}) => (
  <TabList
    className={cn(
      "inline-flex w-full flex-wrap gap-2 rounded-[1.6rem] border border-[hsl(var(--border)/0.68)] bg-[hsl(var(--card)/0.78)] p-2 shadow-soft backdrop-blur-md",
      className
    )}
  >
    {children}
  </TabList>
);

export const TabsTrigger = ({
  className,
  children
}: {
  className?: string;
  children: ReactNode;
}) => (
  <Tab
    className={({ selected }) =>
      cn(
        "interactive-ring rounded-[1.2rem] px-4 py-2 text-sm font-semibold transition",
        selected
          ? "bg-primary text-primary-foreground shadow-soft"
          : "text-muted-foreground hover:bg-[hsl(var(--background)/0.72)] hover:text-foreground",
        className
      )
    }
  >
    {children}
  </Tab>
);

export const TabsContent = TabPanel;
export const TabsPanels = TabPanels;
