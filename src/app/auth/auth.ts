import { api } from "@/utils/api";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const data = await api.post('/auth/signin', {
            email: credentials.email,
            password: credentials.password,
          });;

          // Store tokens in the token object
          return {
            id: credentials.email,
            email: credentials.email,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            idToken: data.idToken,
            role: data.user?.role || 'ADMIN',
          };
        } catch (error) {
          console.error('Error during sign in:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Pass tokens from authorize to the session
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.idToken = user.idToken;
      }

      // Verify session with Cognito
      if (token.accessToken) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/session`, {
            headers: {
              'Authorization': `Bearer ${token.accessToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            token.role = data.user.role;
          }
        } catch (error) {
          console.error('Error verifying auth session:', error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role;
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
    signOut: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET
};