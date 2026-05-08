import React, { useEffect, useState } from "react";
import { Input } from "./input";
import { Search } from "@/components/icons";

const SearchInput = ({ onSearch, placeholder }) => {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) onSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="relative group w-full lg:w-auto">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors duration-300 z-10" />
      <Input
        value={searchTerm}
        onChange={handleSearch}
        placeholder={placeholder || "Search..."}
        className="w-full lg:w-[280px] h-10 pl-10 bg-white/80 border-slate-200/60 rounded-xl transition-all duration-300 shadow-sm focus:bg-white focus:border-amber-200/50 placeholder:text-slate-400 text-sm font-medium" 
      />
    </div>
  );
};

export default SearchInput;
