import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { schema } from "@/db/schema";
import { db } from "@/db/index";
import { magicLink } from "better-auth/plugins";
import { sendMagicLinkEmail } from "./email";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,

    passwordStrength: {
      minLength: 6,
      requireNumbers: true,
      requireSpecialCharacters: true,
      requireUppercase: true,
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  plugins: [
    nextCookies(),
    magicLink({
      sendMagicLink: async ({ email, token }) => {
        try {
          const customUrl = `https://yourapp.com/auth/callback?token=${token}`
          await sendMagicLinkEmail({ email, url: customUrl });
        } catch (error) {
          console.error("Error sending magic link email:", error);
          throw new Error("Failed to send magic link email");
        }
      },
      expiresIn: 10 * 60, // 10 minutes
    }),
  ],
});
