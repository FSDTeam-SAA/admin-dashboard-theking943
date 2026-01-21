import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001/api";
const TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

async function refreshAccessToken(token: JWT) {
  try {
    const response = await axios.post(`${baseURL}/auth/reset-refresh-token`, {
      refreshToken: token.refreshToken,
    });
    const { accessToken, refreshToken } = response.data.data;

    return {
      ...token,
      accessToken,
      refreshToken: refreshToken || token.refreshToken,
      accessTokenExpires: Date.now() + TOKEN_MAX_AGE_MS,
      error: undefined,
    };
  } catch (error) {
    console.error("Failed to refresh access token", error);
    return {
      ...token,
      accessToken: undefined,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        try {
          const response = await axios.post(`${baseURL}/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          });

          const { accessToken, refreshToken, user } = response.data.data;

          return {
            id: user._id || user.id,
            email: user.email,
            name: user.firstName + " " + user.lastName,
            image: user.profileImage || "",
            accessToken,
            refreshToken,
          };
        } catch (error) {
          const message = axios.isAxiosError(error)
            ? error.response?.data?.message || "Invalid email or password"
            : "Invalid email or password";
          throw new Error(message);
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.id = user.id;
        token.accessTokenExpires = Date.now() + TOKEN_MAX_AGE_MS;
        return token;
      }

      if (!token.accessTokenExpires || Date.now() < token.accessTokenExpires - 60 * 1000) {
        return token;
      }

      if (token.refreshToken) {
        return refreshAccessToken(token);
      }

      return {
        ...token,
        accessToken: undefined,
        error: "RefreshTokenMissing",
      };
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
        session.accessTokenExpires = token.accessTokenExpires as number;
        session.error = token.error as string | undefined;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  jwt: {
    maxAge: 24 * 60 * 60,
  },
  events: {
    async signOut() {
      // Handle cleanup if needed
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
