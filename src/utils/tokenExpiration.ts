export const parseDuration = (duration: string): number => {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid duration format: ${duration}`);

  const value = parseInt(match[1]!, 10);
  const unit = match[2]! as "s" | "m" | "h" | "d";

  const unitToMs: Record<"s" | "m" | "h" | "d", number> = {
    s: 1000,
    m: 1000 * 60,
    h: 1000 * 60 * 60,
    d: 1000 * 60 * 60 * 24,
  };

  return value * (unitToMs[unit] || 1000);
};

export const calculateExpiresAt = (duration: string): number => {
  return Date.now() + parseDuration(duration);
};

export const isTokenExpired = (expiresAt: number | null): boolean => {
  if (!expiresAt) return false;
  return Date.now() > expiresAt;
};
