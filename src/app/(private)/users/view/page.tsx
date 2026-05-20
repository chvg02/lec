"use client";

import { useEffect, useState } from "react";
import { Loader2, Pencil, Trash2, Upload, UsersRound, X } from "lucide-react";

import { PrivateViewLayout } from "@/components/private/private-view-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  EMPTY_USER_PERMISSIONS,
  getPermissionPayload,
  USER_PERMISSION_KEYS,
  USER_PERMISSION_LABELS,
  type UserPermissionFlags,
  type UserPermissionKey,
} from "@/lib/permissions";

type User = UserPermissionFlags & {
  id: number;
  name: string;
  email: string;
  profileImageUrl?: string | null;
  role: string;
  createdAt: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user");
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
      setIsDeleting(id);
      const res = await fetch(`/api/user`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Erro ao deletar usuário");
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir usuário");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    try {
      const res = await fetch(`/api/user`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedUser.id,
          name: selectedUser.name,
          email: selectedUser.email,
          profileImageUrl: selectedUser.profileImageUrl ?? "",
          role: selectedUser.role,
          ...(selectedUser.role === "user"
            ? getPermissionPayload(selectedUser)
            : EMPTY_USER_PERMISSIONS),
        }),
      });

      if (!res.ok) throw new Error("Erro ao editar usuário");
      setIsEditing(false);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar alterações");
    }
  };

  const handleSelectedPermissionChange = (
    permission: UserPermissionKey,
    active: boolean
  ) => {
    if (!selectedUser) return;
    setSelectedUser({ ...selectedUser, [permission]: active });
  };

  const getPermissionSummary = (user: User) => {
    if (user.role === "admin") {
      return "Todas";
    }

    const labels = USER_PERMISSION_KEYS
      .filter((permission) => user[permission])
      .map((permission) => USER_PERMISSION_LABELS[permission]);

    return labels.length > 0 ? labels.join(", ") : "Nenhuma";
  };

  const handleSelectedProfilePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !selectedUser) return;

    setUploadingProfilePhoto(true);

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

      setSelectedUser({ ...selectedUser, profileImageUrl: data.profileImageUrl });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao enviar foto.");
    } finally {
      setUploadingProfilePhoto(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
        <span className="ml-2 text-slate-500">Carregando usuários...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <PrivateViewLayout
      title="Usuários Cadastrados"
      addLabel="Novo Usuário"
      addHref="/users/add"
      icon={UsersRound}
      iconWrapperClassName="bg-violet-100"
      iconClassName="text-violet-500"
      addButtonClassName="bg-violet-500 hover:bg-violet-600"
    >
      {users.length === 0 ? (
        <p className="text-center text-slate-500">Nenhum usuário encontrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">ID</TableHead>
                <TableHead className="text-center">Foto</TableHead>
                <TableHead className="text-center">Nome</TableHead>
                <TableHead className="text-center">Email</TableHead>
                <TableHead className="text-center">Função</TableHead>
                <TableHead className="text-center">Funcionalidades</TableHead>
                <TableHead className="text-center">Criado em</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="text-center">{user.id}</TableCell>
                  <TableCell className="text-center">
                    <img
                      src={user.profileImageUrl || `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(user.name)}`}
                      alt={user.name}
                      className="mx-auto h-10 w-10 rounded-full object-cover"
                    />
                  </TableCell>
                  <TableCell className="text-center">{user.name}</TableCell>
                  <TableCell className="text-center">{user.email}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                      className="capitalize"
                    >
                      {user.role.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs text-center text-sm text-slate-600">
                    {getPermissionSummary(user)}
                  </TableCell>
                  <TableCell className="text-center">
                    {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(user)}
                      >
                        <Pencil className="mr-1 h-4 w-4" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={isDeleting === user.id}
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        {isDeleting === user.id ? "Excluindo..." : "Excluir"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="mt-2 space-y-4">
              <div className="flex items-center gap-4 rounded-lg border border-slate-200 p-4">
                <img
                  src={selectedUser.profileImageUrl || `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(selectedUser.name || "Usuario")}`}
                  alt={selectedUser.name}
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
                      onChange={handleSelectedProfilePhotoUpload}
                    />
                  </label>
                  {selectedUser.profileImageUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setSelectedUser({ ...selectedUser, profileImageUrl: null })
                      }
                    >
                      <X size={16} />
                      Remover
                    </Button>
                  )}
                </div>
              </div>
              <Input
                value={selectedUser.name}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, name: e.target.value })
                }
                placeholder="Nome"
              />
              <Input
                value={selectedUser.email}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, email: e.target.value })
                }
                placeholder="Email"
              />
              <select
                value={selectedUser.role}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, role: e.target.value })
                }
                className="w-full rounded-md border p-2"
              >
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>

              {selectedUser.role === "user" && (
                <div className="space-y-3 rounded-lg border border-slate-200 p-4">
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
                          checked={selectedUser[permission]}
                          onChange={(event) =>
                            handleSelectedPermissionChange(permission, event.target.checked)
                          }
                        />
                        {USER_PERMISSION_LABELS[permission]}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PrivateViewLayout>
  );
}
