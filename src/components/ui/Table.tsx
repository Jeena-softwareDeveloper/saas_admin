"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useSiteConfig } from "@/lib/siteConfig";

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement> & { containerClassName?: string }>(
  ({ className, containerClassName, ...props }, ref) => {
    const { config } = useSiteConfig();
    return (
      <div 
        className={cn("w-full h-full flex flex-col overflow-hidden rounded-md border bg-white", containerClassName)}
        style={{ borderColor: config.primaryColor + "33" }}
      >
        <div className="flex-1 overflow-auto w-full no-scrollbar relative">
          <table
            ref={ref}
            className={cn("w-full text-sm text-left border-collapse", className)}
            {...props}
          />
        </div>
      </div>
    );
  }
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => {
    const { config } = useSiteConfig();
    return (
      <thead
        ref={ref}
        className={cn("sticky top-0 z-20 shadow-sm", className)}
        style={{ 
          backgroundColor: '#ffffff', 
          backgroundImage: `linear-gradient(${config.primaryColor}14, ${config.primaryColor}14)` 
        }}
        {...props}
      />
    );
  }
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={className} {...props} />
  )
);
TableBody.displayName = "TableBody";

const Tr = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => {
    const { config } = useSiteConfig();
    return (
      <tr
        ref={ref}
        className={cn("transition-colors", className)}
        style={{ ['--tw-hover-bg' as any]: config.primaryColor + "0a" }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = config.primaryColor + "0a")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
        {...props}
      />
    );
  }
);
Tr.displayName = "Tr";

const Th = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => {
    const { config } = useSiteConfig();
    return (
      <th
        ref={ref}
        className={cn(
          "h-12 px-6 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b border-r last:border-r-0 align-middle",
          className
        )}
        style={{ 
          color: config.primaryColor,
          borderColor: config.primaryColor + "33" // ~20% opacity border
        }}
        {...props}
      />
    );
  }
);
Th.displayName = "Th";

const Td = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => {
    const { config } = useSiteConfig();
    return (
      <td
        ref={ref}
        className={cn("px-6 py-5 align-middle border-b border-r last:border-r-0 group-last/row:border-b-0", className)}
        style={{ borderColor: config.primaryColor + "33" }}
        {...props}
      />
    );
  }
);
Td.displayName = "Td";

export { Table, TableHeader, TableBody, Tr, Th, Td };
