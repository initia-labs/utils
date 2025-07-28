export function truncate(
  str: string,
  lengths: [number, number] = [6, 6],
): string {
  const [prefixLength, suffixLength] = lengths;
  const minLength = prefixLength + suffixLength + 3; // 3 for "..."

  if (str.length <= minLength) {
    return str;
  }

  const prefix = str.slice(0, prefixLength);
  const suffix = str.slice(-suffixLength);

  return `${prefix}...${suffix}`;
}
