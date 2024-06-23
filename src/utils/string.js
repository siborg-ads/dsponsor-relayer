import * as numeral from "numeral";
import { formatUnits, keccak256, toUtf8Bytes } from "ethers";

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

export const priceFormattedForAllValuesObject = (decimals = 18, obj, negativeToZero = false) => {
  const res = {};
  const objKeys = Object.keys(obj);

  for (const key of objKeys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
      try {
        let formatted = formatUnits(obj[key], decimals);

        let formattedNb = numeral(formatted).value();

        if (negativeToZero && formattedNb < 0) {
          formattedNb = 0;
          formatted = "0";
        }

        res[key] = formatted;

        if (formattedNb < 0.001 && formattedNb > 0) {
          const [, precision] = formatted.split(".");
          const precisionSplit = precision.split("");
          let firstNonZeroIndex = precisionSplit.findIndex((x) => x !== "0");
          let nonZeroNb = Number(precisionSplit[firstNonZeroIndex]);
          const nextNonZeroNb = nonZeroNb ? Number(precisionSplit[firstNonZeroIndex + 1]) : 0;
          let lastNumber;

          if (nonZeroNb === 9 && nextNonZeroNb > 5) {
            firstNonZeroIndex -= 1;
            lastNumber = 1;
          } else {
            lastNumber =
              nextNonZeroNb > 5
                ? Number(precisionSplit[firstNonZeroIndex]) + 1
                : Number(precisionSplit[firstNonZeroIndex]);
          }

          res[`${key}`] = `0.0${toSubscript(firstNonZeroIndex)}${lastNumber}`;
        } else if (formattedNb >= 0.001 && formattedNb < 0.1) {
          res[`${key}`] = numeral(formatted).format("0.[000]");
        } else if (formattedNb >= 0.1 && formattedNb < 1000) {
          res[`${key}`] = numeral(formatted).format("0.[00]");
        } else {
          res[`${key}`] = numeral(formatted).format("0.[0]a").toLocaleUpperCase();
        }
      } catch (e) {
        //  console.error("error formatting ", formatted, e);
      }
    }
  }
  return res;
};

export const priceFormatted = (decimals, amount) => {
  return formatUnits(amount, decimals);
};

const subscriptMap = {
  0: "₀",
  1: "₁",
  2: "₂",
  3: "₃",
  4: "₄",
  5: "₅",
  6: "₆",
  7: "₇",
  8: "₈",
  9: "₉"
};

function toSubscript(num) {
  if (num.toString().length === 1) {
    if (num === 2) {
      return "0"; // "0.000996666" should become "0.001"
    } else {
      return subscriptMap[num];
    }
  } else {
    return num
      .toString()
      .split("")
      .map((char) => subscriptMap[char] || char)
      .join("");
  }
}
