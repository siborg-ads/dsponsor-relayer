export * from "./bid";
export * from "./pricing";
export * from "./string";

export function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}
