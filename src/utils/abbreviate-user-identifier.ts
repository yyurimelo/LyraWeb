export function abbreviateUserIdentifier(identifier: string) {
  return identifier.length > 6 ? `${identifier.slice(-6)}` : identifier;
}