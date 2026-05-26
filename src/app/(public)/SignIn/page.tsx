"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Eye, EyeClosed, Loader2 } from "lucide-react";

export default function SignIn() {

  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.replace("/dashboard");
    }
  }, [router, session, status]);

  if (status === "loading") {
    return <p>Carregando...</p>;
  }

  if (status === "authenticated") {
    return <p>Redirecionando...</p>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    setLoading(false);

    if (res?.error || !res?.ok) {
      setError("Email ou senha inválidos.");
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen -mt-16 flex items-center justify-center bg-linear-to-br from-blue-50 to-slate-100 px-4 py-8 dark:from-background dark:to-background/90">
      <Card className="w-full max-w-sm shadow-lg border border-slate-200 dark:border-slate-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">Entrar</CardTitle>
          <p className="text-sm text-muted-foreground">
            Acesse sua conta para continuar
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
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((old) => !old)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {showPassword ? <EyeClosed size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Esqueci minha senha
              </Link>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center mt-1">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-blue-500"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-xs text-muted-foreground text-center">
            Ainda não tem conta? <span className="text-primary cursor-pointer hover:underline">Entre em contato com o administrador</span>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
