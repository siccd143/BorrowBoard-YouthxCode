function hashCode(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

export function getQrCells(value: string, size = 7) {
  const finderCells = new Set([0, 1, 2, 7, 14, 42, 43, 44, 48]);
  const hash = hashCode(value);

  return Array.from({ length: size * size }, (_, index) => {
    if (finderCells.has(index)) return true;
    return ((hash >> (index % 24)) + index * 13 + value.length) % 5 < 2;
  });
}
