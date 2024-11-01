
export const getManagerLink = (): string | null => {
  return import.meta.env.VITE_PUBLIC_DSCME_LOGO_LINK ?? null;
};
