export * from "./bid";
export * from "./pricing";
export * from "./string";

export function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

export function isValidUrl(urlString) {
  const urlPattern = new RegExp(
    "^(https?:\\/\\/)?" + // validate protocol (allow http and https)
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|" + // validate domain name
      "localhost|" + // validate localhost
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // validate OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // validate port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // validate query string
      "(\\#[-a-z\\d_]*)?$", // validate fragment locator
    "i" // case insensitive
  );
  return urlString && !!urlPattern.test(urlString);
}
