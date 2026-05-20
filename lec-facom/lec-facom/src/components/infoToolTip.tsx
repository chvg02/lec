import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

type Props = {
    message: string;
}

export function InfoTooltip({ message }: Props) {
    return (
        <Tooltip>
            <TooltipTrigger>
                <Info size={16}  className="text-slate-500"/>
            </TooltipTrigger>
            <TooltipContent>
                <p>{message}</p>
            </TooltipContent>
        </Tooltip>
    )
}