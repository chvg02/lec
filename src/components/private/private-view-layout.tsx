"use client";

import { ReactNode } from "react";
import { ArrowLeft, Plus, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PrivateViewLayoutProps = {
  title: string;
  addLabel: string;
  addHref: string;
  icon: LucideIcon;
  iconClassName?: string;
  iconWrapperClassName?: string;
  addButtonClassName?: string;
  containerClassName?: string; // <-- Nova propriedade opcional
  children: ReactNode;
};

export function PrivateViewLayout({
  title,
  addLabel,
  addHref,
  icon: Icon,
  iconClassName,
  iconWrapperClassName,
  addButtonClassName,
  containerClassName, // <-- Nova propriedade desestruturada
  children,
}: PrivateViewLayoutProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 px-4 py-8 sm:px-6 sm:py-10">
      {/* O cn() agora vai permitir substituir o max-w-5xl se enviarmos outra classe de fora */}
      <div className={cn("mx-auto flex w-full max-w-5xl flex-col gap-4", containerClassName)}>
        <Button
          variant="ghost"
          className="w-fit text-sm hover:bg-blue-100"
          onClick={() => router.back()}
        >
          <ArrowLeft size={16} />
          Voltar
        </Button>

        <Card className="w-full border border-slate-200 shadow-lg">
          <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <CardTitle className="flex min-w-0 items-center gap-2 text-2xl font-bold">
              <div
                className={cn(
                  "shrink-0 rounded-lg bg-green-100 p-2",
                  iconWrapperClassName
                )}
              >
                <Icon size={24} className={cn("text-green-600", iconClassName)} />
              </div>
              <span className="break-words">{title}</span>
            </CardTitle>

            <Button
              onClick={() => router.push(addHref)}
              className={cn("w-full text-white sm:w-auto", addButtonClassName)}
            >
              <Plus className="h-4 w-4" />
              {addLabel}
            </Button>
          </CardHeader>

          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}