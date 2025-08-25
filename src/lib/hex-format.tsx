export const formatHexInput = (value: string): string => {
  const raw = value.replace(/[^0-9a-fA-F]/g, ""); // Remove tudo que não é hex
  return raw ? `#${raw.slice(0, 6)}` : ""; // Só adiciona "#" se houver algo
};
