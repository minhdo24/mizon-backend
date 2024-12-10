import { EMAIL_DOMAIN } from "#src/constants";

export function getUserNameByEmail(string: string): string {
  if (string.includes(EMAIL_DOMAIN)) {
    return string.slice(0, string.length - 9);
  }
}
