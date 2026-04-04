import { prisma } from "../db";
import { getContributorBalance } from "../hedera";
import { config } from "../config";

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getBalance(wallet: string): Promise<number> {
  return getContributorBalance(wallet);
}

const MAX_MIRROR_PAGES = 50;

export async function getSightingCount(wallet: string): Promise<number> {
  const baseUrl = `${config.hedera.mirrorNodeUrl}/api/v1/topics/${config.hedera.topicId}/messages`;

  let count = 0;
  let nextLink: string | null = baseUrl;
  let pages = 0;

  while (nextLink && pages < MAX_MIRROR_PAGES) {
    const res = await fetch(nextLink);
    if (!res.ok) break;

    const data = await res.json() as {
      messages: { message: string }[];
      links?: { next?: string };
    };

    for (const msg of data.messages) {
      try {
        const parsed = JSON.parse(Buffer.from(msg.message, "base64").toString());
        if (parsed.wallet === wallet) count++;
      } catch {
        // skip malformed messages
      }
    }

    nextLink = data.links?.next
      ? `${config.hedera.mirrorNodeUrl}${data.links.next}`
      : null;
    pages++;
  }

  return count;
}
