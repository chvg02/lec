"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function SignUpPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const res = await fetch("/api/user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({  name, email, password, role}),
        });

        const data = await res.json();

        if (!res.ok) {
            setError(data.error || "Erro ao cadastrar");
            return;
        }

        setSuccess("Conta criada com sucesso!");
        setTimeout(() => router.push("/SignIn"), 1500);
    };

    return (

        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-slate-100 dark:from-background dark:to-background/90">
            <Card className="w-full max-w-sm shadow-lg border border-slate-200 dark:border-slate-800">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-semibold">Cadastrar</CardTitle>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="email">Nome</Label>
                            <Input
                                id="name"
                                type="name"
                                placeholder="Nome Completo"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="password">Email</Label>
                            <Input
                                id="Email"
                                type="Email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="Name">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="type">tipo</Label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="border rounded-md p-2"
                                required
                            >
                                <option value="">Selecione um tipo</option>
                                <option value="admin">Admin</option>
                                <option value="user">User</option>
                            </select>
                        </div>

                        {error && (
                            <p className="text-sm text-red-500 text-center mt-1">{error}</p>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="mt-2 w-full"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />Cadastrando...
                                </>
                            ) : (
                                "Cadastrar"
                            )}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex justify-center">
                    <p className="text-xs text-muted-foreground">
                        Já tem uma conta?{" "}<a href="/SignIn" className="text-blue-600 hover:underline">
                        Entrar
                    </a>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
