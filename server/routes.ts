import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  loginSchema,
  twoFASchema,
  sendPixSchema,
  convertStablecoinSchema,
  investmentSimulationSchema,
  registrationSchema,
} from "@shared/schema";
import { readFileSync } from "fs";
import { join } from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { fullName, email, phone, cpf, password } = registrationSchema.parse(req.body);
      
      const existingUser = await storage.getUserByCPF(cpf);
      if (existingUser) {
        return res.status(400).json({ message: "CPF já cadastrado" });
      }

      const user = await storage.createUser({
        cpf,
        password,
        name: fullName,
        email,
        phone,
      });

      await storage.createPixKey({
        userId: user.id,
        keyType: "cpf",
        keyValue: cpf,
      });

      res.json({
        success: true,
        userId: user.id,
        message: "Conta criada com sucesso",
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Erro ao criar conta" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { cpf, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByCPF(cpf);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "CPF ou senha inválidos" });
      }

      res.json({
        userId: user.id,
        name: user.name,
        requiresTwoFA: true,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Erro ao fazer login" });
    }
  });

  app.post("/api/auth/verify-2fa", async (req, res) => {
    try {
      const { code } = twoFASchema.parse(req.body);
      const { userId } = req.body;

      if (code.length !== 8) {
        return res.status(400).json({ message: "Código inválido" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          cpf: user.cpf,
        },
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Erro ao verificar código" });
    }
  });

  app.get("/api/user/:userId", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao buscar dados do usuário" });
    }
  });

  app.get("/api/auth/user-by-cpf/:cpf", async (req, res) => {
    try {
      const user = await storage.getUserByCPF(req.params.cpf);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      res.json({ name: user.name });
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao buscar dados do usuário" });
    }
  });

  app.get("/api/pix/keys/:userId", async (req, res) => {
    try {
      const keys = await storage.getPixKeys(req.params.userId);
      res.json(keys);
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao buscar chaves PIX" });
    }
  });

  app.get("/api/pix/transactions/:userId", async (req, res) => {
    try {
      const transactions = await storage.getPixTransactions(req.params.userId);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao buscar transações PIX" });
    }
  });

  app.post("/api/pix/send", async (req, res) => {
    try {
      const { recipientKey, amount, description } = sendPixSchema.parse(req.body);
      const { userId } = req.body;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const amountNum = parseFloat(amount);
      const currentBalance = parseFloat(user.balanceBRL);

      if (currentBalance < amountNum) {
        return res.status(400).json({ message: "Saldo insuficiente" });
      }

      const transaction = await storage.createPixTransaction({
        userId,
        type: "sent",
        amount: amount,
        recipientName: "Destinatário",
        recipientKey,
        description,
      });

      await storage.updateUserBalance(
        userId,
        (currentBalance - amountNum).toFixed(2),
        user.balanceStable,
        user.totalInvested
      );

      res.json(transaction);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Erro ao enviar PIX" });
    }
  });

  app.get("/api/stablecoin/rate", async (req, res) => {
    res.json({
      rate: "5.25",
      spread: "0.005",
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/api/stablecoin/transactions/:userId", async (req, res) => {
    try {
      const transactions = await storage.getStablecoinTransactions(req.params.userId);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao buscar transações StableCOIN" });
    }
  });

  app.post("/api/stablecoin/convert", async (req, res) => {
    try {
      const { type, amount } = convertStablecoinSchema.parse(req.body);
      const { userId } = req.body;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const amountNum = parseFloat(amount);
      const baseRate = 5.25;
      const spread = 0.005;

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
          fee: spreadFee.toFixed(2),
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
          fee: spreadFee.toFixed(2),
        });

        await storage.updateUserBalance(
          userId,
          newBalanceBRL.toFixed(2),
          newBalanceStable.toFixed(8),
          user.totalInvested
        );

        res.json(transaction);
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Erro ao converter moeda" });
    }
  });

  app.get("/api/investments/products", async (req, res) => {
    try {
      const products = await storage.getAllInvestmentProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao buscar produtos de investimento" });
    }
  });

  app.get("/api/investments/portfolio/:userId", async (req, res) => {
    try {
      const investments = await storage.getUserInvestments(req.params.userId);
      
      const investmentsWithProducts = await Promise.all(
        investments.map(async (inv) => {
          const product = await storage.getInvestmentProduct(inv.productId);
          return {
            ...inv,
            productName: product?.name || "Produto não encontrado",
          };
        })
      );

      res.json(investmentsWithProducts);
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao buscar portfólio" });
    }
  });

  app.post("/api/investments/invest", async (req, res) => {
    try {
      const { productId, amount } = investmentSimulationSchema.parse(req.body);
      const { userId } = req.body;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const product = await storage.getInvestmentProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }

      const amountNum = parseFloat(amount);
      const currentBalance = parseFloat(user.balanceBRL);
      const minimumAmount = parseFloat(product.minimumAmount);

      if (amountNum < minimumAmount) {
        return res.status(400).json({
          message: `Valor mínimo de investimento: R$ ${minimumAmount.toFixed(2)}`,
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
        returnPercentage: "0.00",
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
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Erro ao realizar investimento" });
    }
  });

  app.get("/api/catalog", async (req, res) => {
    try {
      const catalogPath = join(process.cwd(), "catalog", "products.json");
      const catalog = JSON.parse(readFileSync(catalogPath, "utf-8"));
      res.json(catalog);
    } catch (error: any) {
      res.status(500).json({ message: "Erro ao carregar catálogo" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
