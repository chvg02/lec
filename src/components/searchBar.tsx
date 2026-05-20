import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function SearchBar({
    value,
    onChange,
    placeholder = "Pesquisar...",
    className,
}: SearchBarProps) {
    return (
        <label
            className={cn(
                "group flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-500 shadow-xs transition-all duration-200 ease-out hover:border-slate-300 hover:shadow-sm focus-within:border-blue-300 focus-within:bg-slate-50 focus-within:shadow-md focus-within:ring-4 focus-within:ring-blue-100",
                className
            )}
        >
            <Search size={20} className="text-slate-400 transition-colors group-focus-within:text-blue-500" />
            <input
                placeholder={placeholder}
                type="text"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="w-full border-none bg-transparent p-0 text-base text-slate-700 outline-none placeholder:text-slate-400"
            />
        </label>
    )
}
