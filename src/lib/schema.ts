import {
  boolean,
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  date,
  pgEnum,
  varchar,
  index,
  uniqueIndex,
  serial,
  uuid,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import type { AdapterAccountType } from "next-auth/adapters";

// Enums
export const deviceTypeEnum = pgEnum("DeviceType", [
  "DESKTOP",
  "MOBILE",
  "TABLET",
]);

// Users table
export const users = pgTable("user", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  role: text("role").default("USER"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Projects table
export const projects = pgTable(
  "project",
  {
    id: serial("id").primaryKey(),
    domain: text("domain").unique(),
    name: text("name").notNull(),
    description: text("description"),
    icon: text("icon"),
    ownerId: uuid("ownerId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    ownerIdx: index("project_owner_idx").on(table.ownerId),
  })
);

// Analytics table
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  projectId: integer("projectId")
    .unique()
    .references(() => projects.id, { onDelete: "cascade" }),
  totalPageVisits: integer("totalPageVisits").default(0),
  totalVisitors: integer("totalVisitors").default(0),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// VisitData table
export const visitData = pgTable(
  "visitData",
  {
    id: serial("id").primaryKey(),
    analyticsId: integer("analyticsId").references(() => analytics.id, {
      onDelete: "cascade",
    }),
    date: date("date").notNull(),
    pageVisits: integer("pageVisits").default(0),
    visitors: integer("visitors").default(0),
  },
  (table) => ({
    analyticsIdx: index("visit_data_analytics_idx").on(table.analyticsId),
    dateIdx: index("visit_data_date_idx").on(table.date),
    uniqueAnalyticsDate: uniqueIndex("unique_analytics_date").on(
      table.analyticsId,
      table.date
    ),
  })
);

// RouteAnalytics table
export const routeAnalytics = pgTable(
  "routeAnalytics",
  {
    id: serial("id").primaryKey(),
    analyticsId: integer("analyticsId").references(() => analytics.id, {
      onDelete: "cascade",
    }),
    route: text("route").notNull(),
    visitors: integer("visitors").default(0),
    pageVisits: integer("pageVisits").default(0),
  },
  (table) => ({
    analyticsIdx: index("route_analytics_idx").on(table.analyticsId),
    uniqueAnalyticsRoute: uniqueIndex("unique_analytics_route").on(
      table.analyticsId,
      table.route
    ),
  })
);

// CountryAnalytics table
export const countryAnalytics = pgTable(
  "countryAnalytics",
  {
    id: serial("id").primaryKey(),
    analyticsId: integer("analyticsId").references(() => analytics.id, {
      onDelete: "cascade",
    }),
    countryCode: varchar("countryCode", { length: 2 }).notNull(),
    countryName: text("countryName").notNull(),
    visitors: integer("visitors").default(0),
  },
  (table) => ({
    analyticsIdx: index("country_analytics_idx").on(table.analyticsId),
    uniqueAnalyticsCountry: uniqueIndex("unique_analytics_country").on(
      table.analyticsId,
      table.countryCode
    ),
  })
);

// DeviceAnalytics table
export const deviceAnalytics = pgTable(
  "deviceAnalytics",
  {
    id: serial("id").primaryKey(),
    analyticsId: integer("analyticsId").references(() => analytics.id, {
      onDelete: "cascade",
    }),
    deviceType: deviceTypeEnum("deviceType").notNull(),
    visitors: integer("visitors").default(0),
  },
  (table) => ({
    analyticsIdx: index("device_analytics_idx").on(table.analyticsId),
    uniqueAnalyticsDevice: uniqueIndex("unique_analytics_device").on(
      table.analyticsId,
      table.deviceType
    ),
  })
);

// OSAnalytics table
export const osAnalytics = pgTable(
  "osAnalytics",
  {
    id: serial("id").primaryKey(),
    analyticsId: integer("analyticsId").references(() => analytics.id, {
      onDelete: "cascade",
    }),
    osName: text("osName").notNull(),
    visitors: integer("visitors").default(0),
  },
  (table) => ({
    analyticsIdx: index("os_analytics_idx").on(table.analyticsId),
    uniqueAnalyticsOS: uniqueIndex("unique_analytics_os").on(
      table.analyticsId,
      table.osName
    ),
  })
);

// SourceAnalytics table
export const sourceAnalytics = pgTable(
  "sourceAnalytics",
  {
    id: serial("id").primaryKey(),
    analyticsId: integer("analyticsId").references(() => analytics.id, {
      onDelete: "cascade",
    }),
    sourceName: text("sourceName").notNull(),
    visitors: integer("visitors").default(0),
  },
  (table) => ({
    analyticsIdx: index("source_analytics_idx").on(table.analyticsId),
    uniqueAnalyticsSource: uniqueIndex("unique_analytics_source").on(
      table.analyticsId,
      table.sourceName
    ),
  })
);

// Accounts table (auth)
export const accounts = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

// Sessions table (auth)
export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// VerificationTokens table (auth)
export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);

// Authenticators table (auth)
export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  })
);

// BugReport table
export const bugReports = pgTable("bugReport", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").default("inReview"),
  ownerId: uuid("ownerId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Performance table
export const performanceAnalytics = pgTable(
  "performanceAnalytics",
  {
    id: serial("id").primaryKey(),
    analyticsId: integer("analyticsId").references(() => analytics.id, {
      onDelete: "cascade",
    }),
    // Time in milliseconds for various performance metrics
    loadTime: integer("loadTime"), // timing.loadEventEnd - timing.navigationStart
    domReady: integer("domReady"), // timing.domContentLoadedEventEnd - timing.navigationStart
    networkLatency: integer("networkLatency"), // timing.responseEnd - timing.requestStart
    processingTime: integer("processingTime"), // timing.domComplete - timing.responseEnd
    totalTime: integer("totalTime"), // timing.loadEventEnd - timing.navigationStart
    // Timestamps
    date: date("date").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    analyticsIdx: index("performance_analytics_idx").on(table.analyticsId),
    dateIdx: index("performance_date_idx").on(table.date),
  })
);

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  projects: many(projects),
  authenticators: many(authenticators),
  bugReports: many(bugReports),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  analytics: one(analytics, {
    fields: [projects.id],
    references: [analytics.projectId],
  }),
}));

export const analyticsRelations = relations(analytics, ({ one, many }) => ({
  project: one(projects, {
    fields: [analytics.projectId],
    references: [projects.id],
  }),
  visitHistory: many(visitData),
  routeAnalytics: many(routeAnalytics),
  countryAnalytics: many(countryAnalytics),
  deviceAnalytics: many(deviceAnalytics),
  osAnalytics: many(osAnalytics),
  sourceAnalytics: many(sourceAnalytics),
  performanceAnalytics: many(performanceAnalytics),
}));

export const visitDataRelations = relations(visitData, ({ one }) => ({
  analytics: one(analytics, {
    fields: [visitData.analyticsId],
    references: [analytics.id],
  }),
}));

export const routeAnalyticsRelations = relations(routeAnalytics, ({ one }) => ({
  analytics: one(analytics, {
    fields: [routeAnalytics.analyticsId],
    references: [analytics.id],
  }),
}));

export const countryAnalyticsRelations = relations(
  countryAnalytics,
  ({ one }) => ({
    analytics: one(analytics, {
      fields: [countryAnalytics.analyticsId],
      references: [analytics.id],
    }),
  })
);

export const deviceAnalyticsRelations = relations(
  deviceAnalytics,
  ({ one }) => ({
    analytics: one(analytics, {
      fields: [deviceAnalytics.analyticsId],
      references: [analytics.id],
    }),
  })
);

export const osAnalyticsRelations = relations(osAnalytics, ({ one }) => ({
  analytics: one(analytics, {
    fields: [osAnalytics.analyticsId],
    references: [analytics.id],
  }),
}));

export const sourceAnalyticsRelations = relations(
  sourceAnalytics,
  ({ one }) => ({
    analytics: one(analytics, {
      fields: [sourceAnalytics.analyticsId],
      references: [analytics.id],
    }),
  })
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const authenticatorsRelations = relations(authenticators, ({ one }) => ({
  user: one(users, {
    fields: [authenticators.userId],
    references: [users.id],
  }),
}));

export const bugReportsRelations = relations(bugReports, ({ one }) => ({
  owner: one(users, {
    fields: [bugReports.ownerId],
    references: [users.id],
  }),
}));

export const performanceAnalyticsRelations = relations(
  performanceAnalytics,
  ({ one }) => ({
    analytics: one(analytics, {
      fields: [performanceAnalytics.analyticsId],
      references: [analytics.id],
    }),
  })
);
