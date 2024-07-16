
export const getManagerLink = (): string | null => {
  return process.env.NEXT_PUBLIC_DSCME_LOGO_LINK ?? null;
};
