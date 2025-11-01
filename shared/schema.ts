import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cpf: varchar("cpf", { length: 14 }).notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  balanceBRL: decimal("balance_brl", { precision: 15, scale: 2 }).default("0.00").notNull(),
  balanceStable: decimal("balance_stable", { precision: 15, scale: 8 }).default("0.00000000").notNull(),
  totalInvested: decimal("total_invested", { precision: 15, scale: 2 }).default("0.00").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pixKeys = pgTable("pix_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  keyType: varchar("key_type", { length: 20 }).notNull(),
  keyValue: text("key_value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pixTransactions = pgTable("pix_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: varchar("type", { length: 10 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  recipientName: text("recipient_name"),
  recipientKey: text("recipient_key"),
  senderName: text("sender_name"),
  senderKey: text("sender_key"),
  description: text("description"),
  status: varchar("status", { length: 20 }).default("completed").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stablecoinTransactions = pgTable("stablecoin_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: varchar("type", { length: 10 }).notNull(),
  amountBRL: decimal("amount_brl", { precision: 15, scale: 2 }),
  amountStable: decimal("amount_stable", { precision: 15, scale: 8 }),
  rate: decimal("rate", { precision: 10, scale: 6 }).notNull(),
  fee: decimal("fee", { precision: 10, scale: 2 }).default("0.00").notNull(),
  status: varchar("status", { length: 20 }).default("completed").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const investmentProducts = pgTable("investment_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  risk: varchar("risk", { length: 20 }).notNull(),
  minimumAmount: decimal("minimum_amount", { precision: 15, scale: 2 }).notNull(),
  expectedReturn: decimal("expected_return", { precision: 5, scale: 2 }).notNull(),
  liquidity: varchar("liquidity", { length: 20 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const investments = pgTable("investments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  productId: varchar("product_id").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currentValue: decimal("current_value", { precision: 15, scale: 2 }).notNull(),
  returnAmount: decimal("return_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  returnPercentage: decimal("return_percentage", { precision: 5, scale: 2 }).default("0.00").notNull(),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  cpf: true,
  password: true,
  name: true,
  email: true,
  phone: true,
});

export const insertPixKeySchema = createInsertSchema(pixKeys).omit({
  id: true,
  createdAt: true,
});

export const insertPixTransactionSchema = createInsertSchema(pixTransactions).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertStablecoinTransactionSchema = createInsertSchema(stablecoinTransactions).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertInvestmentProductSchema = createInsertSchema(investmentProducts).omit({
  id: true,
});

export const insertInvestmentSchema = createInsertSchema(investments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type PixKey = typeof pixKeys.$inferSelect;
export type InsertPixKey = z.infer<typeof insertPixKeySchema>;

export type PixTransaction = typeof pixTransactions.$inferSelect;
export type InsertPixTransaction = z.infer<typeof insertPixTransactionSchema>;

export type StablecoinTransaction = typeof stablecoinTransactions.$inferSelect;
export type InsertStablecoinTransaction = z.infer<typeof insertStablecoinTransactionSchema>;

export type InvestmentProduct = typeof investmentProducts.$inferSelect;
export type InsertInvestmentProduct = z.infer<typeof insertInvestmentProductSchema>;

export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;

export const loginSchema = z.object({
  cpf: z.string().length(14, "CPF deve ter 11 dígitos"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export const twoFASchema = z.object({
  code: z.string().length(8, "Código deve ter 8 dígitos"),
});

export const sendPixSchema = z.object({
  recipientKey: z.string().min(1, "Chave PIX é obrigatória"),
  amount: z.string().refine((val) => parseFloat(val) > 0, "Valor deve ser maior que zero"),
  description: z.string().optional(),
});

export const convertStablecoinSchema = z.object({
  type: z.enum(["buy", "sell"]),
  amount: z.string().refine((val) => parseFloat(val) > 0, "Valor deve ser maior que zero"),
});

export const investmentSimulationSchema = z.object({
  productId: z.string(),
  amount: z.string().refine((val) => parseFloat(val) > 0, "Valor deve ser maior que zero"),
});
