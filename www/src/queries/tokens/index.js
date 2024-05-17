import { toUtf8Bytes, keccak256 } from "ethers";

/**
 * Convert a string to a uint256
 * @param s {string}
 * @returns {bigint} uint256 as a BigInt
 */
export function stringToUint256(s) {
  const normalized = s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]/gi, "");

  return BigInt(keccak256(toUtf8Bytes(normalized))).toString();
}
