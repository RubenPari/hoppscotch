import { defineVersion } from "verzod"
import { z } from "zod"

import { V8_SCHEMA } from "../8"
import { HoppRESTReqBody } from "./body"

export const V9_SCHEMA = V8_SCHEMA.extend({
  v: z.literal("9"),
  body: HoppRESTReqBody,
})

export default defineVersion({
  schema: V9_SCHEMA,
  initial: false,
  up(old: z.infer<typeof V8_SCHEMA>) {
    const rawBody = old.body as unknown as {
      contentType?: unknown
      body?: unknown
    }
    let migratedBody = old.body as unknown as z.infer<typeof HoppRESTReqBody>
    if (rawBody && rawBody.contentType === "multipart/form-data") {
      migratedBody = {
        ...(rawBody as Record<string, unknown>),
        contentType: "multipart/form-data",
        body: Array.isArray(rawBody.body)
          ? (rawBody.body as Array<Record<string, unknown>>).map((entry) => ({
              ...entry,
              description: "",
            }))
          : [],
      } as unknown as z.infer<typeof HoppRESTReqBody>
    }
    return {
      ...old,
      v: "9" as const,
      body: migratedBody,
    }
  },
})
