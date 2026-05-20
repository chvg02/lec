import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const nextAuth :NextAuthOptions={
  providers: [
    CredentialsProvider({
      name:'credencials',
      credentials:{
        email:{label:'email',type:'text'},
        password: {label:'password',type:'password'}
      },

      async authorize(credencials) {
  if (!credencials?.email || !credencials?.password) {
    return null;
  }

  // Buscar o usuário pelo email
  const user = await prisma.user.findUnique({
    where: { email: credencials.email }
  });

  // Não achou o usuário
  if (!user) return null;

  // Comparar senha
  const isValid = await bcrypt.compare(credencials.password, user.password);

  if (!isValid) return null;

  // Retornar usuário para a sessão do NextAuth
 
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  
}})],
 callbacks:{
    async jwt({token,user}) {
      user && (token.user=  user)
      return token;
    },
    async session({session,token}){
      session= token.user as any
      return session

      
    }

   }
}
const handler = NextAuth(nextAuth)

export { handler as GET, handler as POST, nextAuth}