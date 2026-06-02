import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import {
  hasAnyPermission,
  hasPermission,
  USER_PERMISSION_SELECT,
  type UserPermissionKey,
} from "@/lib/permissions";

export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  profileImageUrl: true,
  role: true,
  isActive: true,
  isTeam: true,
  isFormerTeam: true,
  ...USER_PERMISSION_SELECT,
  createdAt: true,
} as const;

export async function requireAuthenticatedApi() {
  const session = await getServerSession(nextAuthOptions);

  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: "Não autenticado" }, { status: 401 }),
    };
  }

  if (session.user.isActive === false) {
    return {
      session,
      response: NextResponse.json({ error: "Conta desativada" }, { status: 403 }),
    };
  }

  return { session, response: null };
}

export async function requireAdminApi() {
  const session = await getServerSession(nextAuthOptions);

  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: "Não autenticado" }, { status: 401 }),
    };
  }

  if (session.user.isActive === false) {
    return {
      session,
      response: NextResponse.json({ error: "Conta desativada" }, { status: 403 }),
    };
  }

  if (session.user.role !== "admin") {
    return {
      session,
      response: NextResponse.json(
        { error: "Acesso restrito a administradores" },
        { status: 403 }
      ),
    };
  }

  return { session, response: null };
}

export async function requirePermissionApi(permission: UserPermissionKey) {
  const session = await getServerSession(nextAuthOptions);

  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: "Não autenticado" }, { status: 401 }),
    };
  }

  if (session.user.isActive === false) {
    return {
      session,
      response: NextResponse.json({ error: "Conta desativada" }, { status: 403 }),
    };
  }

  if (!hasPermission(session.user, permission)) {
    return {
      session,
      response: NextResponse.json(
        { error: "Você não tem permissão para acessar esta funcionalidade" },
        { status: 403 }
      ),
    };
  }

  return { session, response: null };
}

export async function requireAnyPermissionApi(permissions: UserPermissionKey[]) {
  const session = await getServerSession(nextAuthOptions);

  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: "Não autenticado" }, { status: 401 }),
    };
  }

  if (session.user.isActive === false) {
    return {
      session,
      response: NextResponse.json({ error: "Conta desativada" }, { status: 403 }),
    };
  }

  if (!hasAnyPermission(session.user, permissions)) {
    return {
      session,
      response: NextResponse.json(
        { error: "Você não tem permissão para acessar esta funcionalidade" },
        { status: 403 }
      ),
    };
  }

  return { session, response: null };
}
