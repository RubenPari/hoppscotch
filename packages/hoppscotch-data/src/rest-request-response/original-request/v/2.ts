import { defineVersion } from "verzod"
import { z } from "zod"
import { V1_SCHEMA } from "./1"
import { HoppRESTReqBody } from "../../../rest/v/9/body"

export const V2_SCHEMA = V1_SCHEMA.extend({
  v: z.literal("2"),
  body: HoppRESTReqBody,
})

export default defineVersion({
  initial: false,
  schema: V2_SCHEMA,
  up(old: z.infer<typeof V1_SCHEMA>) {
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
      v: "2" as const,
      body: migratedBody,
    }
  },
})
