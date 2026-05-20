'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type ActiveLinkProps = {
    children: React.ReactNode;
    href: string;
    className?: string;
};

export const ActiveLink = ({ children, href, className }: ActiveLinkProps) => {
    const pathname = usePathname();
    const isActive = pathname === href || pathname.startsWith(`${href}/`);

    return (
        <Link
            href={href}
            className={cn(
                "text-sm font-medium transition-colors hover:text-primary dark:hover:text-primary",
                isActive ? "text-gray-700" : "text-white",
                className
            )}
        >
            {children}
        </Link>
    );
};
