import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import * as z from "zod";

const postThemeValidator = z.union([z.literal("light"), z.literal("dark")]);
export type T = z.infer<typeof postThemeValidator>;
const storageKey = "_preferred-theme";

export const getThemeServerFn = createServerFn().handler(
  async () => (getCookie(storageKey) || "light") as T,
);

export const setThemeServerFn = createServerFn({ method: "POST" })
  .inputValidator(postThemeValidator)
  .handler(async ({ data }) => setCookie(storageKey, data));