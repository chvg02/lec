"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFeedback(null);

    if (!token) {
      setFeedback({ type: "error", text: "Link inválido ou incompleto." });
      return;
    }

    if (password.length < 8) {
      setFeedback({
        type: "error",
        text: "A senha deve ter pelo menos 8 caracteres.",
      });
      return;
    }

    if (password !== confirmPassword) {
      setFeedback({ type: "error", text: "As senhas não coincidem." });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível redefinir a senha.");
      }

      setFeedback({ type: "success", text: data.message });
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        router.replace("/SignIn");
      }, 1200);
    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Não foi possível redefinir a senha.",
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
            Redefinir senha
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Informe a nova senha para concluir a recuperação.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Nova senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="********"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
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
                  Salvando...
                </>
              ) : (
                "Salvar nova senha"
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
