export function getInitialName(name: string | undefined) {
  if (name) {
    const words = name.trim().split(/\s+/); // Divide o nome em palavras
    const initials = words
      .slice(0, 2) // Pega as duas primeiras palavras (se existirem)
      .map((word) => word[0]?.toUpperCase() || "") // Pega a primeira letra de cada palavra
      .join(""); // Junta as iniciais
    return initials;
  }
}
