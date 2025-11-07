// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users;
  pixKeys;
  pixTransactions;
  stablecoinTransactions;
  investmentProducts;
  investments;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.pixKeys = /* @__PURE__ */ new Map();
    this.pixTransactions = /* @__PURE__ */ new Map();
    this.stablecoinTransactions = /* @__PURE__ */ new Map();
    this.investmentProducts = /* @__PURE__ */ new Map();
    this.investments = /* @__PURE__ */ new Map();
    this.seedData();
  }
  seedData() {
    const userId = "97d51a63-be52-462f-96cc-419c00a7c04c";
    const user = {
      id: userId,
      cpf: "123.456.789-00",
      password: "123456",
      name: "Ana Maria Silva",
      email: "ana@inwista.com",
      phone: "(11) 98765-4321",
      balanceBRL: "15420.50",
      balanceStable: "1250.75",
      totalInvested: "8500.00",
      isActive: true,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(userId, user);
    const pixKeyTypes = [
      { type: "cpf", value: "123.456.789-00" },
      { type: "random", value: "3f8a9b2c-4d1e-5f6a-7b8c-9d0e1f2a3b4c" }
    ];
    pixKeyTypes.forEach(({ type, value }) => {
      const id = randomUUID();
      const key = {
        id,
        userId,
        keyType: type,
        keyValue: value,
        createdAt: /* @__PURE__ */ new Date()
      };
      this.pixKeys.set(id, key);
    });
    const products = [
      {
        name: "CDB Liquidez Di\xE1ria",
        category: "Renda Fixa",
        risk: "Baixo",
        minimumAmount: "100.00",
        expectedReturn: "12.50",
        liquidity: "Liquidez di\xE1ria",
        description: "Invista com seguran\xE7a e liquidez imediata",
        isActive: true
      },
      {
        name: "Fundo Multimercado",
        category: "Fundos",
        risk: "M\xE9dio",
        minimumAmount: "500.00",
        expectedReturn: "15.80",
        liquidity: "D+30",
        description: "Diversifica\xE7\xE3o com gest\xE3o profissional",
        isActive: true
      },
      {
        name: "Tesouro Selic",
        category: "Renda Fixa",
        risk: "Baixo",
        minimumAmount: "50.00",
        expectedReturn: "11.20",
        liquidity: "D+1",
        description: "Investimento mais seguro do Brasil",
        isActive: true
      },
      {
        name: "A\xE7\xF5es Tech",
        category: "Renda Vari\xE1vel",
        risk: "Alto",
        minimumAmount: "1000.00",
        expectedReturn: "22.50",
        liquidity: "D+2",
        description: "Potencial de alta rentabilidade",
        isActive: true
      }
    ];
    products.forEach((product) => {
      const id = randomUUID();
      const investmentProduct = { ...product, id };
      this.investmentProducts.set(id, investmentProduct);
    });
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByCPF(cpf) {
    return Array.from(this.users.values()).find((user) => user.cpf === cpf);
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = {
      ...insertUser,
      id,
      balanceBRL: "0.00",
      balanceStable: "0.00000000",
      totalInvested: "0.00",
      isActive: true,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(id, user);
    return user;
  }
  async updateUserBalance(userId, balanceBRL, balanceStable, totalInvested) {
    const user = this.users.get(userId);
    if (user) {
      user.balanceBRL = balanceBRL;
      user.balanceStable = balanceStable;
      user.totalInvested = totalInvested;
      this.users.set(userId, user);
    }
  }
  async getPixKeys(userId) {
    return Array.from(this.pixKeys.values()).filter((key) => key.userId === userId);
  }
  async createPixKey(insertPixKey) {
    const id = randomUUID();
    const pixKey = {
      ...insertPixKey,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.pixKeys.set(id, pixKey);
    return pixKey;
  }
  async getPixTransactions(userId) {
    return Array.from(this.pixTransactions.values()).filter((tx) => tx.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  async createPixTransaction(insertTransaction) {
    const id = randomUUID();
    const transaction = {
      ...insertTransaction,
      id,
      status: "completed",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.pixTransactions.set(id, transaction);
    return transaction;
  }
  async getStablecoinTransactions(userId) {
    return Array.from(this.stablecoinTransactions.values()).filter((tx) => tx.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  async createStablecoinTransaction(insertTransaction) {
    const id = randomUUID();
    const transaction = {
      ...insertTransaction,
      id,
      status: "completed",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.stablecoinTransactions.set(id, transaction);
    return transaction;
  }
  async getAllInvestmentProducts() {
    return Array.from(this.investmentProducts.values()).filter((p) => p.isActive);
  }
  async getInvestmentProduct(id) {
    return this.investmentProducts.get(id);
  }
  async createInvestmentProduct(insertProduct) {
    const id = randomUUID();
    const product = {
      ...insertProduct,
      id
    };
    this.investmentProducts.set(id, product);
    return product;
  }
  async getUserInvestments(userId) {
    return Array.from(this.investments.values()).filter((inv) => inv.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  async createInvestment(insertInvestment) {
    const id = randomUUID();
    const investment = {
      ...insertInvestment,
      id,
      status: "active",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.investments.set(id, investment);
    return investment;
  }
  async updateInvestment(id, currentValue, returnAmount, returnPercentage) {
    const investment = this.investments.get(id);
    if (investment) {
      investment.currentValue = currentValue;
      investment.returnAmount = returnAmount;
      investment.returnPercentage = returnPercentage;
      investment.updatedAt = /* @__PURE__ */ new Date();
      this.investments.set(id, investment);
    }
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
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
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var pixKeys = pgTable("pix_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  keyType: varchar("key_type", { length: 20 }).notNull(),
  keyValue: text("key_value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var pixTransactions = pgTable("pix_transactions", {
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
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var stablecoinTransactions = pgTable("stablecoin_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: varchar("type", { length: 10 }).notNull(),
  amountBRL: decimal("amount_brl", { precision: 15, scale: 2 }),
  amountStable: decimal("amount_stable", { precision: 15, scale: 8 }),
  rate: decimal("rate", { precision: 10, scale: 6 }).notNull(),
  fee: decimal("fee", { precision: 10, scale: 2 }).default("0.00").notNull(),
  status: varchar("status", { length: 20 }).default("completed").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var investmentProducts = pgTable("investment_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  risk: varchar("risk", { length: 20 }).notNull(),
  minimumAmount: decimal("minimum_amount", { precision: 15, scale: 2 }).notNull(),
  expectedReturn: decimal("expected_return", { precision: 5, scale: 2 }).notNull(),
  liquidity: varchar("liquidity", { length: 20 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull()
});
var investments = pgTable("investments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  productId: varchar("product_id").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currentValue: decimal("current_value", { precision: 15, scale: 2 }).notNull(),
  returnAmount: decimal("return_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  returnPercentage: decimal("return_percentage", { precision: 5, scale: 2 }).default("0.00").notNull(),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  cpf: true,
  password: true,
  name: true,
  email: true,
  phone: true
});
var insertPixKeySchema = createInsertSchema(pixKeys).omit({
  id: true,
  createdAt: true
});
var insertPixTransactionSchema = createInsertSchema(pixTransactions).omit({
  id: true,
  createdAt: true,
  status: true
});
var insertStablecoinTransactionSchema = createInsertSchema(stablecoinTransactions).omit({
  id: true,
  createdAt: true,
  status: true
});
var insertInvestmentProductSchema = createInsertSchema(investmentProducts).omit({
  id: true
});
var insertInvestmentSchema = createInsertSchema(investments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var loginSchema = z.object({
  cpf: z.string().length(14, "CPF deve ter 11 d\xEDgitos"),
  password: z.string().min(6, "Senha deve ter no m\xEDnimo 6 caracteres")
});
var twoFASchema = z.object({
  code: z.string().length(8, "C\xF3digo deve ter 8 d\xEDgitos")
});
var sendPixSchema = z.object({
  recipientKey: z.string().min(1, "Chave PIX \xE9 obrigat\xF3ria"),
  amount: z.string().refine((val) => parseFloat(val) > 0, "Valor deve ser maior que zero"),
  description: z.string().optional()
});
var convertStablecoinSchema = z.object({
  type: z.enum(["buy", "sell"]),
  amount: z.string().refine((val) => parseFloat(val) > 0, "Valor deve ser maior que zero")
});
var investmentSimulationSchema = z.object({
  productId: z.string(),
  amount: z.string().refine((val) => parseFloat(val) > 0, "Valor deve ser maior que zero")
});
var registrationSchema = z.object({
  fullName: z.string().min(3, "Nome completo \xE9 obrigat\xF3rio"),
  email: z.string().email("E-mail inv\xE1lido"),
  phone: z.string().min(10, "Telefone inv\xE1lido"),
  cpf: z.string().length(14, "CPF deve ter 11 d\xEDgitos"),
  password: z.string().min(6, "Senha deve ter no m\xEDnimo 6 caracteres")
});
var validatePasswordSchema = z.object({
  userId: z.string(),
  password: z.string().min(1, "Senha \xE9 obrigat\xF3ria")
});

// server/routes.ts
import { readFileSync } from "fs";
import { join } from "path";
async function registerRoutes(app2) {
  app2.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development"
    });
  });
  app2.get("/api/healthz", (req, res) => {
    res.json({ status: "ok" });
  });
  app2.get("/api/ready", async (req, res) => {
    try {
      const users2 = await storage.getAllInvestmentProducts();
      if (users2.length >= 0) {
        res.json({ ready: true, storage: "initialized" });
      } else {
        res.status(503).json({ ready: false, error: "Storage not initialized" });
      }
    } catch (error) {
      res.status(503).json({ ready: false, error: error.message });
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { fullName, email, phone, cpf, password } = registrationSchema.parse(req.body);
      const existingUser = await storage.getUserByCPF(cpf);
      if (existingUser) {
        return res.status(400).json({ message: "CPF j\xE1 cadastrado" });
      }
      const minBRL = 1e6;
      const maxBRL = 5e7;
      const randomBalanceBRL = (Math.random() * (maxBRL - minBRL) + minBRL).toFixed(2);
      const minStable = 1e5;
      const maxStable = 5e6;
      const randomBalanceStable = (Math.random() * (maxStable - minStable) + minStable).toFixed(2);
      const user = await storage.createUser({
        cpf,
        password,
        name: fullName,
        email,
        phone,
        balanceBRL: randomBalanceBRL,
        balanceStable: randomBalanceStable
      });
      await storage.createPixKey({
        userId: user.id,
        keyType: "cpf",
        keyValue: cpf
      });
      res.json({
        success: true,
        userId: user.id,
        message: "Conta criada com sucesso"
      });
    } catch (error) {
      res.status(400).json({ message: error.message || "Erro ao criar conta" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { cpf, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByCPF(cpf);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "CPF ou senha inv\xE1lidos" });
      }
      res.json({
        userId: user.id,
        name: user.name,
        requiresTwoFA: true
      });
    } catch (error) {
      res.status(400).json({ message: error.message || "Erro ao fazer login" });
    }
  });
  app2.post("/api/auth/verify-2fa", async (req, res) => {
    try {
      const { code } = twoFASchema.parse(req.body);
      const { userId } = req.body;
      if (code.length !== 8) {
        return res.status(400).json({ message: "C\xF3digo inv\xE1lido" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usu\xE1rio n\xE3o encontrado" });
      }
      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          cpf: user.cpf
        }
      });
    } catch (error) {
      res.status(400).json({ message: error.message || "Erro ao verificar c\xF3digo" });
    }
  });
  app2.get("/api/user/:userId", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.userId);
      if (!user) {
        return res.status(404).json({ message: "Usu\xE1rio n\xE3o encontrado" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar dados do usu\xE1rio" });
    }
  });
  app2.get("/api/auth/user-by-cpf/:cpf", async (req, res) => {
    try {
      const user = await storage.getUserByCPF(req.params.cpf);
      if (!user) {
        return res.status(404).json({ message: "Usu\xE1rio n\xE3o encontrado" });
      }
      res.json({ name: user.name });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar dados do usu\xE1rio" });
    }
  });
  app2.post("/api/auth/validate-keypad-sequence", async (req, res) => {
    try {
      const { cpf, sequence } = req.body;
      if (!cpf || !Array.isArray(sequence) || sequence.length !== 6) {
        return res.status(400).json({ message: "Dados inv\xE1lidos" });
      }
      for (const pair of sequence) {
        if (!Array.isArray(pair) || pair.length !== 2) {
          return res.status(400).json({ message: "Sequ\xEAncia inv\xE1lida" });
        }
      }
      const user = await storage.getUserByCPF(cpf);
      if (!user || user.password.length !== 6) {
        return res.status(401).json({ message: "CPF ou sequ\xEAncia inv\xE1lidos" });
      }
      const pin = user.password;
      for (let i = 0; i < 6; i++) {
        const expectedDigit = pin[i];
        const selectedPair = sequence[i];
        if (!selectedPair.includes(expectedDigit)) {
          return res.status(401).json({ message: "Sequ\xEAncia inv\xE1lida" });
        }
      }
      res.json({
        userId: user.id,
        name: user.name,
        requiresTwoFA: true
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao validar sequ\xEAncia" });
    }
  });
  app2.post("/api/auth/validate-password", async (req, res) => {
    try {
      const { userId, password } = validatePasswordSchema.parse(req.body);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usu\xE1rio n\xE3o encontrado" });
      }
      if (user.password !== password) {
        return res.status(401).json({ message: "Senha inv\xE1lida" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: error.message || "Erro ao validar senha" });
    }
  });
  app2.get("/api/pix/keys/:userId", async (req, res) => {
    try {
      const keys = await storage.getPixKeys(req.params.userId);
      res.json(keys);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar chaves PIX" });
    }
  });
  app2.get("/api/pix/transactions/:userId", async (req, res) => {
    try {
      const transactions = await storage.getPixTransactions(req.params.userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar transa\xE7\xF5es PIX" });
    }
  });
  app2.post("/api/pix/send", async (req, res) => {
    try {
      const { recipientKey, amount, description } = sendPixSchema.parse(req.body);
      const { userId } = req.body;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usu\xE1rio n\xE3o encontrado" });
      }
      const amountNum = parseFloat(amount);
      const currentBalance = parseFloat(user.balanceBRL);
      if (currentBalance < amountNum) {
        return res.status(400).json({ message: "Saldo insuficiente" });
      }
      const transaction = await storage.createPixTransaction({
        userId,
        type: "sent",
        amount,
        recipientName: "Destinat\xE1rio",
        recipientKey,
        description
      });
      await storage.updateUserBalance(
        userId,
        (currentBalance - amountNum).toFixed(2),
        user.balanceStable,
        user.totalInvested
      );
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: error.message || "Erro ao enviar PIX" });
    }
  });
  app2.get("/api/stablecoin/rate", async (req, res) => {
    res.json({
      rate: "5.25",
      spread: "0.005",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app2.get("/api/stablecoin/transactions/:userId", async (req, res) => {
    try {
      const transactions = await storage.getStablecoinTransactions(req.params.userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar transa\xE7\xF5es StableCOIN" });
    }
  });
  app2.post("/api/stablecoin/convert", async (req, res) => {
    try {
      const { type, amount } = convertStablecoinSchema.parse(req.body);
      const { userId } = req.body;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usu\xE1rio n\xE3o encontrado" });
      }
      const amountNum = parseFloat(amount);
      const baseRate = 5.25;
      const spread = 5e-3;
      let newBalanceBRL = parseFloat(user.balanceBRL);
      let newBalanceStable = parseFloat(user.balanceStable);
      if (type === "buy") {
        const effectiveRate = baseRate * (1 + spread);
        const spreadFee = amountNum * spread;
        const totalDebit = amountNum + spreadFee;
        if (newBalanceBRL < totalDebit) {
          return res.status(400).json({ message: "Saldo BRL insuficiente" });
        }
        const stableReceived = amountNum / effectiveRate;
        newBalanceBRL -= totalDebit;
        newBalanceStable += stableReceived;
        const transaction = await storage.createStablecoinTransaction({
          userId,
          type: "buy",
          amountBRL: amountNum.toFixed(2),
          amountStable: stableReceived.toFixed(8),
          rate: effectiveRate.toFixed(6),
          fee: spreadFee.toFixed(2)
        });
        await storage.updateUserBalance(
          userId,
          newBalanceBRL.toFixed(2),
          newBalanceStable.toFixed(8),
          user.totalInvested
        );
        res.json(transaction);
      } else {
        const effectiveRate = baseRate * (1 - spread);
        if (newBalanceStable < amountNum) {
          return res.status(400).json({ message: "Saldo Stable insuficiente" });
        }
        const brlAmount = amountNum * effectiveRate;
        const spreadFee = brlAmount * spread;
        const totalCredit = brlAmount - spreadFee;
        newBalanceStable -= amountNum;
        newBalanceBRL += totalCredit;
        const transaction = await storage.createStablecoinTransaction({
          userId,
          type: "sell",
          amountBRL: brlAmount.toFixed(2),
          amountStable: amountNum.toFixed(8),
          rate: effectiveRate.toFixed(6),
          fee: spreadFee.toFixed(2)
        });
        await storage.updateUserBalance(
          userId,
          newBalanceBRL.toFixed(2),
          newBalanceStable.toFixed(8),
          user.totalInvested
        );
        res.json(transaction);
      }
    } catch (error) {
      res.status(400).json({ message: error.message || "Erro ao converter moeda" });
    }
  });
  app2.get("/api/investments/products", async (req, res) => {
    try {
      const products = await storage.getAllInvestmentProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar produtos de investimento" });
    }
  });
  app2.get("/api/investments/portfolio/:userId", async (req, res) => {
    try {
      const investments2 = await storage.getUserInvestments(req.params.userId);
      const investmentsWithProducts = await Promise.all(
        investments2.map(async (inv) => {
          const product = await storage.getInvestmentProduct(inv.productId);
          return {
            ...inv,
            productName: product?.name || "Produto n\xE3o encontrado"
          };
        })
      );
      res.json(investmentsWithProducts);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar portf\xF3lio" });
    }
  });
  app2.post("/api/investments/invest", async (req, res) => {
    try {
      const { productId, amount } = investmentSimulationSchema.parse(req.body);
      const { userId } = req.body;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usu\xE1rio n\xE3o encontrado" });
      }
      const product = await storage.getInvestmentProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Produto n\xE3o encontrado" });
      }
      const amountNum = parseFloat(amount);
      const currentBalance = parseFloat(user.balanceBRL);
      const minimumAmount = parseFloat(product.minimumAmount);
      if (amountNum < minimumAmount) {
        return res.status(400).json({
          message: `Valor m\xEDnimo de investimento: R$ ${minimumAmount.toFixed(2)}`
        });
      }
      if (currentBalance < amountNum) {
        return res.status(400).json({ message: "Saldo insuficiente" });
      }
      const investment = await storage.createInvestment({
        userId,
        productId,
        amount: amountNum.toFixed(2),
        currentValue: amountNum.toFixed(2),
        returnAmount: "0.00",
        returnPercentage: "0.00"
      });
      const newBalance = currentBalance - amountNum;
      const newTotalInvested = parseFloat(user.totalInvested) + amountNum;
      await storage.updateUserBalance(
        userId,
        newBalance.toFixed(2),
        user.balanceStable,
        newTotalInvested.toFixed(2)
      );
      res.json(investment);
    } catch (error) {
      res.status(400).json({ message: error.message || "Erro ao realizar investimento" });
    }
  });
  app2.get("/api/catalog", async (req, res) => {
    try {
      const catalogPath = join(process.cwd(), "catalog", "products.json");
      const catalog = JSON.parse(readFileSync(catalogPath, "utf-8"));
      res.json(catalog);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar cat\xE1logo" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
