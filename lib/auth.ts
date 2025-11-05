import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const adminUsername = process.env.ADMIN_USERNAME || "admin";
        const adminPassword = process.env.ADMIN_PASSWORD || "changeme";

        // Check username
        if (credentials.username !== adminUsername) {
          return null;
        }

        // Check password - support both plain text (for development) and hashed
        let isValidPassword = false;
        
        // Check if the stored password is hashed (starts with $2a$ or $2b$)
        if (adminPassword.startsWith("$2a$") || adminPassword.startsWith("$2b$")) {
          isValidPassword = await bcrypt.compare(
            credentials.password as string,
            adminPassword
          );
        } else {
          // Plain text comparison for development
          isValidPassword = credentials.password === adminPassword;
        }

        if (!isValidPassword) {
          return null;
        }

        // Return user object
        return {
          id: "admin",
          name: adminUsername,
          email: `${adminUsername}@admin.local`,
          role: "admin",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
});

