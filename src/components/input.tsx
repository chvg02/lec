'use client';
import { FormEvent, InputHTMLAttributes, useState } from "react";
import { Label } from "./ui/label";
import { Input as ShadCNInput } from "./ui/input";
import { Eye, EyeClosed } from "lucide-react";
import { InfoTooltip } from "./infoToolTip";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string,
    errors?: string,
    info?: string,
}

export function Input({ label, errors, type, value, info, ...rest }: InputProps) {
    const [isVisible, setIsVisible] = useState(false);

    function handleChangePasswordVisibility(e: FormEvent) {
        e.preventDefault();
        setIsVisible(old => !old);
    }

    return (
        <div className="flex flex-col w-full items-start gap-2 relative">
            <Label htmlFor="input">{label}
                {info && <InfoTooltip message={info} />}
            </Label>
            <ShadCNInput
                id="input"
                type={type === 'password' ? (isVisible ? 'text' : 'password') : type}
                value={value ?? ''}
                className={`${errors && 'border-red-600 border-2'}`}
                {...rest}
            />
            {
                type === 'password' &&
                <button
                    tabIndex={-1}
                    onClick={handleChangePasswordVisibility}
                    className="absolute right-3 top-7">
                    {!isVisible ? <Eye size={24} /> : <EyeClosed size={24} />}
                </button>
            }
            <p className="text-red-600 text-xs mt-1 italic">{errors}</p>
        </div>
    )
}