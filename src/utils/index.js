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

export function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

export function computeBidAmounts({
  previousBidAmount,
  newBidAmount,
  previousBidAmountBps,
  protocolFeeBps
}) {
  const previousBidFeeAmount = previousBidAmount
    ? (BigInt(newBidAmount) * BigInt(previousBidAmountBps)) / BigInt("10000")
    : BigInt("0");

  const nextBidAmount = BigInt(newBidAmount) - previousBidFeeAmount;
  const protocolFeeBidAmount = (BigInt(nextBidAmount) * BigInt(protocolFeeBps)) / BigInt("10000");

  // todo : royaltiesBidAmount =  get royalties fron nft contract
  const royaltiesBidAmount = BigInt("0");

  const listerBidAmount =
    BigInt(newBidAmount) - previousBidFeeAmount - royaltiesBidAmount - protocolFeeBidAmount;

  return {
    nextBidAmount: nextBidAmount.toString(),
    previousBidFeeAmount: previousBidFeeAmount.toString(),
    listerBidAmount: listerBidAmount.toString(),
    royaltiesBidAmount: royaltiesBidAmount.toString(),
    protocolFeeBidAmount: protocolFeeBidAmount.toString(),
    totalNewBidAmount: newBidAmount
  };
}
