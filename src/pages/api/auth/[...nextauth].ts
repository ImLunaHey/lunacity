import NextAuth, { type User, type NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { env } from '../../../env/server.mjs';
import { prisma } from '../../../server/db';
import { generateUsername } from '../../../common/generate-username';

// @TODO: make this not shit code
// WARNING: BAD CODE IN THIS WHOLE BLOCK
const handleNewUser = async (user: User) => {
  // Attempt to create a page with a generated handle
  let handle = generateUsername();
  let errorCount = 5;
  while (true) {
    try {
      const generatedHandle = handle ?? generateUsername();
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          handle: generatedHandle,
          page: {
            create: {
              handle: generatedHandle,
              displayName: `@${generatedHandle}`,
              owner: {
                connect: {
                  id: user.id
                }
              }
            }
          }
        },
      });

      // If this works then return the generated one.
      handle = generatedHandle;
      break;
    } catch (error) {
      if (errorCount === 0) break;
      errorCount--;
      // Add error reporting here to show how often this happens

      console.log(error);
    }
  }
};

export const authOptions: NextAuthOptions = {
  events: {
    async signIn({ isNewUser, user }) {
      // Handle first signin
      if (isNewUser) {
        await handleNewUser(user);
      }
    },
  },
  callbacks: {
    // @TODO: Use this to handle limited signup
    signIn({ user }) {
      if (!user.email) return false;
      return true;
    },
    async session({ session, user }) {
      // Include user.id on session
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

        if (databaseUser?.handle)
          session.user.handle = databaseUser.handle;

        if (databaseUser?.page)
          session.user.page = databaseUser.page;
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
};

export default NextAuth(authOptions);
