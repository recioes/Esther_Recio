/** Junta a base do site (ex.: "/Esther_Recio") com um caminho, sem barras duplicadas. */
export function joinBase(base: string, path: string): string {
  const cleanBase = base.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return `${cleanBase}/${cleanPath}`;
}
