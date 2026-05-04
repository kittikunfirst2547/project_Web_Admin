type RateLimitStore = {
  count: number;
  resetTime: number;
};

const store = new Map<string, RateLimitStore>();

export async function rateLimit(identifier: string, limit: number, windowMs: number) {
  const now = Date.now();
  const key = identifier;
  
  let record = store.get(key);

  if (!record || now > record.resetTime) {
    record = {
      count: 1,
      resetTime: now + windowMs,
    };
    store.set(key, record);
    return { success: true, remaining: limit - 1, reset: record.resetTime };
  }

  record.count++;

  if (record.count > limit) {
    return { success: false, remaining: 0, reset: record.resetTime };
  }

  return { success: true, remaining: limit - record.count, reset: record.resetTime };
}
