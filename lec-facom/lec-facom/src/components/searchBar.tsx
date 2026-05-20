import { Search } from "lucide-react";

export function SearchBar() {
    return (
        <div className="bg-white rounded-xl border border-slate-200 w-full flex flex-row items-center gap-4 px-4">
            <Search size={20} className="text-slate-400" />
            <input placeholder="Pesquisar..." type="text" className="w-full border-none bg-transparent p-2 text-base focus:outline-none" />
        </div>
    )
}