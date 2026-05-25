import { Button } from "./ui/button"

interface FilterBarProps {
    items: string[],
    value?: string,
    onSelect: (item: string) => void,
}
export function FilterBar({ items, value, onSelect }: FilterBarProps) {
    return (
        <div className="flex w-full flex-row flex-wrap items-center justify-center gap-2 sm:gap-3">
            {items.map((item) => (
                <Button
                    key={item}
                    type="button"
                    size="sm"
                    variant={value === item ? "default" : "secondary"}
                    onClick={() => onSelect(item)}
                    className={`h-auto rounded-full px-3 py-2 text-xs uppercase shadow-none sm:px-4 ${value === item ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                >
                    {item}
                </Button>
            ))}
        </div>
    )
}
