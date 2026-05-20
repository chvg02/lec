import { Button } from "./ui/button"

interface FilterBarProps {
    items: string[],
    value?: string,
    onSelect: (item: string) => void,
}
export function FilterBar({ items, value, onSelect }: FilterBarProps) {
    return (
        <div className="w-full flex flex-row items-center justify-center gap-4">
            {items.map((item) => (
                <Button
                    key={item}
                    type="button"
                    size="sm"
                    variant={value === item ? "default" : "secondary"}
                    onClick={() => onSelect(item)}
                    className={`rounded-full px-4 text-xs uppercase shadow-none ${value === item ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                >
                    {item}
                </Button>
            ))}
        </div>
    )
}
