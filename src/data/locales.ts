import english from "./en.json";
export type Copy = typeof english;
const files = import.meta.glob<Copy>("./*.json", {
  eager: true,
  import: "default",
});
const order = [
  "en",
  "zh-hans",
  "zh-hant",
  "ja",
  "ko",
  "fr",
  "de",
  "es",
  "pt-br",
  "ru",
  "ar",
  "id",
  "th",
  "vi",
];
export const locales = order
  .filter((code) => files[`./${code}.json`])
  .map((code) => ({ code, ...files[`./${code}.json`] }));
export type Locale = (typeof locales)[number];
export type PageKind = "home" | "privacy" | "support";
export const domain = "https://mouseeffect.hiimobapps.cn";
export function pathFor(code: string, page: PageKind = "home") {
  return `${code === "en" ? "/" : `/${code}/`}${page === "home" ? "" : `${page}/`}`;
}
