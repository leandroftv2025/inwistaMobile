import {
  type User,
  type InsertUser,
  type PixKey,
  type InsertPixKey,
  type PixTransaction,
  type InsertPixTransaction,
  type StablecoinTransaction,
  type InsertStablecoinTransaction,
  type InvestmentProduct,
  type InsertInvestmentProduct,
  type Investment,
  type InsertInvestment,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByCPF(cpf: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: string, balanceBRL: string, balanceStable: string, totalInvested: string): Promise<void>;

  getPixKeys(userId: string): Promise<PixKey[]>;
  createPixKey(pixKey: InsertPixKey): Promise<PixKey>;
  
  getPixTransactions(userId: string): Promise<PixTransaction[]>;
  createPixTransaction(transaction: InsertPixTransaction): Promise<PixTransaction>;
  
  getStablecoinTransactions(userId: string): Promise<StablecoinTransaction[]>;
  createStablecoinTransaction(transaction: InsertStablecoinTransaction): Promise<StablecoinTransaction>;
  
  getAllInvestmentProducts(): Promise<InvestmentProduct[]>;
  getInvestmentProduct(id: string): Promise<InvestmentProduct | undefined>;
  createInvestmentProduct(product: InsertInvestmentProduct): Promise<InvestmentProduct>;
  
  getUserInvestments(userId: string): Promise<Investment[]>;
  createInvestment(investment: InsertInvestment): Promise<Investment>;
  updateInvestment(id: string, currentValue: string, returnAmount: string, returnPercentage: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private pixKeys: Map<string, PixKey>;
  private pixTransactions: Map<string, PixTransaction>;
  private stablecoinTransactions: Map<string, StablecoinTransaction>;
  private investmentProducts: Map<string, InvestmentProduct>;
  private investments: Map<string, Investment>;

  constructor() {
    this.users = new Map();
    this.pixKeys = new Map();
    this.pixTransactions = new Map();
    this.stablecoinTransactions = new Map();
    this.investmentProducts = new Map();
    this.investments = new Map();
    
    this.seedData();
  }

  private seedData() {
    // Use fixed UUID to maintain consistency across server restarts
    const userId = "97d51a63-be52-462f-96cc-419c00a7c04c";
    const user: User = {
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
      createdAt: new Date(),
    };
    this.users.set(userId, user);

    const pixKeyTypes = [
      { type: "cpf", value: "123.456.789-00" },
      { type: "random", value: "3f8a9b2c-4d1e-5f6a-7b8c-9d0e1f2a3b4c" },
    ];

    pixKeyTypes.forEach(({ type, value }) => {
      const id = randomUUID();
      const key: PixKey = {
        id,
        userId,
        keyType: type,
        keyValue: value,
        createdAt: new Date(),
      };
      this.pixKeys.set(id, key);
    });

    const products: InsertInvestmentProduct[] = [
      {
        name: "CDB Liquidez Diária",
        category: "Renda Fixa",
        risk: "Baixo",
        minimumAmount: "100.00",
        expectedReturn: "12.50",
        liquidity: "Liquidez diária",
        description: "Invista com segurança e liquidez imediata",
        isActive: true,
      },
      {
        name: "Fundo Multimercado",
        category: "Fundos",
        risk: "Médio",
        minimumAmount: "500.00",
        expectedReturn: "15.80",
        liquidity: "D+30",
        description: "Diversificação com gestão profissional",
        isActive: true,
      },
      {
        name: "Tesouro Selic",
        category: "Renda Fixa",
        risk: "Baixo",
        minimumAmount: "50.00",
        expectedReturn: "11.20",
        liquidity: "D+1",
        description: "Investimento mais seguro do Brasil",
        isActive: true,
      },
      {
        name: "Ações Tech",
        category: "Renda Variável",
        risk: "Alto",
        minimumAmount: "1000.00",
        expectedReturn: "22.50",
        liquidity: "D+2",
        description: "Potencial de alta rentabilidade",
        isActive: true,
      },
    ];

    products.forEach((product) => {
      const id = randomUUID();
      const investmentProduct: InvestmentProduct = { ...product, id };
      this.investmentProducts.set(id, investmentProduct);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByCPF(cpf: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.cpf === cpf);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      balanceBRL: insertUser.balanceBRL || "0.00",
      balanceStable: insertUser.balanceStable || "0.00000000",
      totalInvested: "0.00",
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(
    userId: string,
    balanceBRL: string,
    balanceStable: string,
    totalInvested: string
  ): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.balanceBRL = balanceBRL;
      user.balanceStable = balanceStable;
      user.totalInvested = totalInvested;
      this.users.set(userId, user);
    }
  }

  async getPixKeys(userId: string): Promise<PixKey[]> {
    return Array.from(this.pixKeys.values()).filter((key) => key.userId === userId);
  }

  async createPixKey(insertPixKey: InsertPixKey): Promise<PixKey> {
    const id = randomUUID();
    const pixKey: PixKey = {
      ...insertPixKey,
      id,
      createdAt: new Date(),
    };
    this.pixKeys.set(id, pixKey);
    return pixKey;
  }

  async getPixTransactions(userId: string): Promise<PixTransaction[]> {
    return Array.from(this.pixTransactions.values())
      .filter((tx) => tx.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createPixTransaction(
    insertTransaction: InsertPixTransaction
  ): Promise<PixTransaction> {
    const id = randomUUID();
    const transaction: PixTransaction = {
      ...insertTransaction,
      id,
      status: "completed",
      createdAt: new Date(),
    };
    this.pixTransactions.set(id, transaction);
    return transaction;
  }

  async getStablecoinTransactions(userId: string): Promise<StablecoinTransaction[]> {
    return Array.from(this.stablecoinTransactions.values())
      .filter((tx) => tx.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createStablecoinTransaction(
    insertTransaction: InsertStablecoinTransaction
  ): Promise<StablecoinTransaction> {
    const id = randomUUID();
    const transaction: StablecoinTransaction = {
      ...insertTransaction,
      id,
      status: "completed",
      createdAt: new Date(),
    };
    this.stablecoinTransactions.set(id, transaction);
    return transaction;
  }

  async getAllInvestmentProducts(): Promise<InvestmentProduct[]> {
    return Array.from(this.investmentProducts.values()).filter((p) => p.isActive);
  }

  async getInvestmentProduct(id: string): Promise<InvestmentProduct | undefined> {
    return this.investmentProducts.get(id);
  }

  async createInvestmentProduct(
    insertProduct: InsertInvestmentProduct
  ): Promise<InvestmentProduct> {
    const id = randomUUID();
    const product: InvestmentProduct = {
      ...insertProduct,
      id,
    };
    this.investmentProducts.set(id, product);
    return product;
  }

  async getUserInvestments(userId: string): Promise<Investment[]> {
    return Array.from(this.investments.values())
      .filter((inv) => inv.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createInvestment(insertInvestment: InsertInvestment): Promise<Investment> {
    const id = randomUUID();
    const investment: Investment = {
      ...insertInvestment,
      id,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.investments.set(id, investment);
    return investment;
  }

  async updateInvestment(
    id: string,
    currentValue: string,
    returnAmount: string,
    returnPercentage: string
  ): Promise<void> {
    const investment = this.investments.get(id);
    if (investment) {
      investment.currentValue = currentValue;
      investment.returnAmount = returnAmount;
      investment.returnPercentage = returnPercentage;
      investment.updatedAt = new Date();
      this.investments.set(id, investment);
    }
  }
}

export const storage = new MemStorage();
