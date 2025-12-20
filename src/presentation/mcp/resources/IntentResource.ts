import z from "zod";
import { config } from "../../../utils/loadConfig";

const intentResourceSchema = z.array(
  z.object({
    name: z.string(),
    description: z.string(),
    allowed_tools: z.string().array(),
  }),
);

export const IntentResource = JSON.stringify(
  intentResourceSchema.parse(config.intents),
);
