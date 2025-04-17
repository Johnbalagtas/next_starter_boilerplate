import {
  boolean,
  pgTable,
  text,
  timestamp,
  index,
  unique
} from "drizzle-orm/pg-core";

// users table
export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull(),
    image: text("image"),
    password: text("password"),
    role: text("role").default("user"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("users_role_idx").on(table.role)]
);

// sessions table
export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    ipAddress: text("ip_address"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    userAgent: text("user_agent"),
    lastActiveAt: timestamp("last_active_at").defaultNow(),
    deviceType: text("device_type"),
    deviceName: text("device_name"),
    location: text("location"),
    isRevoked: boolean("is_revoked").default(false).notNull(),
    revokedAt: timestamp("revoked_at"),
    loginMethod: text("login_method"),
    trusted: boolean("trusted").default(false).notNull(),
  },
  (table) => [
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_active_user_idx").on(table.userId, table.isRevoked),
    index("sessions_activitiy_idx").on(table.lastActiveAt),
  ]
);

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(), // 'google', 'github', etc.
    providerAccountId: text("provider_account_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    tokenType: text("token_type"),
    scope: text("scope"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    profile: text("profile"),
    isVerified: boolean("is_verified").default(false).notNull(),
    lastUsed: timestamp("last_used"),
    email: text("email"),
    name: text("name"),
    avatarUrl: text("avatar_url"),
  },
  (table) => [
    index("accounts_user_id_idx").on(table.userId),
    unique("provider_account_id_provider_unique").on(table.provider, table.providerAccountId),
  ]
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(), // Usually email address
    token: text("token").notNull(), // The actual token
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    type: text("type").notNull(), // "email", "password-reset", "magic-link"
    usedAt: timestamp("used_at"), // When the token was used
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("verification_tokens_token_idx").on(table.token),
    index("verification_tokens_identifier_idx").on(table.identifier),
  ]
);

export const schema = { users, sessions, accounts, verificationTokens };
