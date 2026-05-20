import { TextareaHTMLAttributes } from "react";
import { Label } from "./ui/label";
import { Textarea as ShadCNTextarea } from "./ui/textarea";
import { InfoTooltip } from "./infoToolTip";

interface InputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string,
    errors?: string,
    info?: string,
}

export function TextArea({ label, errors,  value, info, ...rest }: InputProps) {
    return (
        <div className="flex flex-col w-full items-start gap-2 relative">
            <Label htmlFor="input">{label}
                {info && <InfoTooltip message={info} />}
            </Label>
            <ShadCNTextarea
                id="input"
                value={value ?? ''}
                className={`${errors && 'border-red-600 border-2'}`}
                {...rest}
            />
            <p className="text-red-600 text-xs mt-1 italic">{errors}</p>
        </div>
    )
}