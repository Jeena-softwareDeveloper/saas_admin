import React from "react";
import { Search } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterProps {
  value: string;
  onChange: (val: string) => void;
  options: FilterOption[];
  placeholder?: string;
}

interface FilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  filters?: FilterProps[];
}

export function FilterBar({ search, onSearchChange, searchPlaceholder = "Search...", filters = [] }: FilterBarProps) {
  return (
    <div className="flex items-center bg-white border border-slate-200 rounded-full p-0.5 shadow-sm max-w-xl w-full">
      {/* Search Section */}
      <div className="flex items-center flex-1 min-w-0 pl-1">
        <div className="w-7 h-7 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 shrink-0 bg-slate-50/50">
          <Search size={13} />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="bg-transparent border-none focus:ring-0 focus:outline-none text-[13px] w-full px-2.5 h-7 text-slate-700 placeholder:text-slate-400"
        />
      </div>

      {/* Filters */}
      {filters.map((filter, index) => (
        <React.Fragment key={index}>
          <div className="w-px h-5 bg-slate-200 mx-1 shrink-0" />
          <div className="relative shrink-0 flex items-center">
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="appearance-none bg-transparent border-none text-[13px] focus:ring-0 focus:outline-none cursor-pointer font-medium text-slate-600 pl-3 pr-8 py-1"
            >
              {filter.placeholder && (
                <option value="">{filter.placeholder}</option>
              )}
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 pointer-events-none text-slate-400">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
