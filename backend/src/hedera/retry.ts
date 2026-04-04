import { HEDERA_MAX_RETRIES, HEDERA_RETRY_BASE_DELAY_MS } from "../config/constants";

export async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  for (let attempt = 1; attempt <= HEDERA_MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === HEDERA_MAX_RETRIES) throw err;
      const delay = HEDERA_RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
      console.warn(`[hedera] ${label} attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("unreachable");
}
