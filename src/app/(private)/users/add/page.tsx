"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";
import {
    EMPTY_USER_PERMISSIONS,
    USER_PERMISSION_KEYS,
    USER_PERMISSION_LABELS,
    type UserPermissionFlags,
    type UserPermissionKey,
} from "@/lib/permissions";

export default function SignUpPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [permissions, setPermissions] = useState<UserPermissionFlags>(EMPTY_USER_PERMISSIONS);
    const [profileImageUrl, setProfileImageUrl] = useState("");
    const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const res = await fetch("/api/user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    profileImageUrl,
                    role,
                    ...(role === "user" ? permissions : EMPTY_USER_PERMISSIONS),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Erro ao cadastrar");
                return;
            }

            setSuccess("Usuário criado com sucesso!");
            setTimeout(() => router.push("/users/view"), 1200);
        } catch (err) {
            console.error(err);
            setError("Erro ao cadastrar");
        } finally {
            setLoading(false);
        }
    };

    function handleGoBack(){
        router.back();
    }

    function handlePermissionChange(permission: UserPermissionKey, active: boolean) {
        setPermissions((current) => ({ ...current, [permission]: active }));
    }

    async function handleProfilePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) return;

        setUploadingProfilePhoto(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/user/profile-photo?uploadOnly=1", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Erro ao enviar foto.");
            }

            setProfileImageUrl(data.profileImageUrl);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao enviar foto.");
        } finally {
            setUploadingProfilePhoto(false);
        }
    }

    return (

        <div className="min-h-screen -mt-8 flex items-center justify-center bg-linear-to-br from-blue-50 to-slate-100 dark:from-background dark:to-background/90">
            <Button variant="ghost" className="absolute top-26 left-20 text-sm hover:bg-blue-100" onClick={handleGoBack}>
                <ArrowLeft size={16}/>
                Voltar
            </Button>
            <Card className="w-full max-w-2xl shadow-lg border border-slate-200 dark:border-slate-800">
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

                        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4">
                            <Label>Foto de perfil</Label>
                            <div className="flex items-center gap-4">
                                <img
                                    src={profileImageUrl || `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(name || "Usuario")}`}
                                    alt={name || "Foto de perfil"}
                                    className="h-20 w-20 rounded-full border border-blue-200 object-cover"
                                />
                                <div className="flex flex-wrap gap-2">
                                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
                                        <Upload size={16} />
                                        {uploadingProfilePhoto ? "Enviando..." : "Selecionar foto"}
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp,image/gif"
                                            className="hidden"
                                            disabled={uploadingProfilePhoto}
                                            onChange={handleProfilePhotoUpload}
                                        />
                                    </label>
                                    {profileImageUrl && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setProfileImageUrl("")}
                                        >
                                            <X size={16} />
                                            Remover
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="type">Tipo</Label>
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

                        {role === "user" && (
                            <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4">
                                <div>
                                    <h3 className="text-sm font-semibold">Funcionalidades permitidas</h3>
                                    <p className="text-xs text-slate-500">
                                        Selecione quais áreas este usuário poderá gerenciar.
                                    </p>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {USER_PERMISSION_KEYS.map((permission) => (
                                        <label
                                            key={permission}
                                            className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={permissions[permission]}
                                                onChange={(event) =>
                                                    handlePermissionChange(permission, event.target.checked)
                                                }
                                            />
                                            {USER_PERMISSION_LABELS[permission]}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {error && (
                            <p className="text-sm text-red-500 text-center mt-1">{error}</p>
                        )}
                        {success && (
                            <p className="text-sm text-green-600 text-center mt-1">{success}</p>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="mt-2 w-full bg-blue-500"
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
                    {/* <p className="text-xs text-muted-foreground">
                        Já tem uma conta?{" "}<a href="/SignIn" className="text-blue-600 hover:underline">
                            Entrar
                        </a>
                    </p> */}
                </CardFooter>
            </Card>
        </div>
    );
}
