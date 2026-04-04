import { prisma } from "../db";

export async function findUserByWallet(wallet: string) {
  return prisma.user.findUnique({ where: { wallet } });
}

export async function createUser(wallet: string, name?: string) {
  return prisma.user.create({ data: { wallet, name } });
}
