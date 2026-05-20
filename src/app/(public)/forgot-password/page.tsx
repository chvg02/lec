"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível enviar o email.");
      }

      setFeedback({ type: "success", text: data.message });
    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Não foi possível enviar o email.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen -mt-16 flex items-center justify-center bg-linear-to-br from-blue-50 to-slate-100 px-4 dark:from-background dark:to-background/90">
      <Card className="w-full max-w-sm border border-slate-200 shadow-lg dark:border-slate-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">
            Recuperar senha
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Informe seu email para receber o link de redefinicao.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            {feedback && (
              <p
                className={`text-sm text-center ${
                  feedback.type === "success" ? "text-green-600" : "text-red-500"
                }`}
              >
                {feedback.text}
              </p>
            )}

            <Button type="submit" disabled={loading} className="mt-2 w-full bg-blue-500">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar link"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <Link href="/SignIn" className="text-sm text-blue-600 hover:underline">
            Voltar para o login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
