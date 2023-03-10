import NextAuth, { type NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { env } from '@app/env.mjs';
import { prisma } from '@app/server/db';

const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith('https');

export const authOptions: NextAuthOptions = {
  callbacks: {
    // @TODO: Use this to handle limited signup
    signIn({ user }) {
      if (!user.email) return false;
      return true;
    },
    async session({ session, user }) {
      // Include user.id in the session
      if (session.user) {
        session.user.id = user.id;
        const databaseUser = await prisma.user.findUnique({
          where: {
            id: user.id,
          },
          include: {
            page: true
          }
        });

        // Include user's main page in the session
        if (databaseUser?.page) session.user.page = databaseUser.page;

        // Include user's role in the session
        if (databaseUser?.role) session.user.role = databaseUser.role;
      }

      return session;
    },
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: env.EMAIL_SERVER,
      from: env.EMAIL_FROM,
      maxAge: 60 * 60, // How long email links are valid for (1h)
    }),
  ],
  cookies: {
    sessionToken: {
      name: `${useSecureCookies ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        domain: useSecureCookies ? '.lunacity.app' : 'localhost',
        secure: useSecureCookies,
      },
    },
  },
};

export default NextAuth(authOptions);
