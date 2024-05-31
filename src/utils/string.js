import { toUtf8Bytes, keccak256 } from "ethers";

export function normalizeString(s) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]/gi, "");
}

export function stringToUint256(s) {
  return BigInt(keccak256(toUtf8Bytes(normalizeString(s)))).toString();
}
