const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

export async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === MAX_RETRIES) throw err;
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
      console.warn(`[hedera] ${label} attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("unreachable");
}
