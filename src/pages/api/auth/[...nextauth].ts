import NextAuth, { type NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@next-auth/prisma-adapter';

import { env } from '../../../env/server.mjs';
import { prisma } from '../../../server/db';

export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, user }) {
      // Include user.id on session
      if (session.user) {
        session.user.id = user.id;
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
      maxAge: 5 * 60, // How long email links are valid for (default 24h)
    }),
  ],
};

export default NextAuth(authOptions);
