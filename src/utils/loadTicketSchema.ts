import { config } from "./loadConfig";

export const TICKETING_SCHEMA_DIR = import.meta.dir + "/../configs/schemas";

export const ticketSchema = await Bun.file(
  TICKETING_SCHEMA_DIR + "/" + config.ticketing.schema,
).json();

console.error("Loaded ticket schema successfully!", ticketSchema);
