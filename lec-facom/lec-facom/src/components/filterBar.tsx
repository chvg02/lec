interface FilterBarProps {
    items: string[],
    value?: string,
    onSelect: (item: string) => void,
}
export function FilterBar({ items, value, onSelect }: FilterBarProps) {
    return (
        <div className="w-full flex flex-row items-center justify-center gap-4">
            {items.map((item) => (
                <button
                    key={item}
                    onClick={() => onSelect(item)}
                    className={`whitespace-nowrap px-4 py-2 text-xs uppercase font-bold ${value === item ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-700 hover:bg-slate-300"} rounded-full transition`}
                >
                    {item}
                </button>
            ))}
        </div>
    )
}