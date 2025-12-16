import z from "zod";
import { YAML } from "bun";

// config file schemas
const RootConfigSchema = z.object({
  files: z.object({
    intents: z.string(),
    persona: z.string(),
    knowledge_base_index: z.string(),
    ticketing: z.string(),
  }),
});

const IntentSchema = z.object({
  description: z.string(),
  allowed_tools: z.array(z.string()).nonempty(),
  requires_auth: z.boolean().optional().default(false),
  risk_level: z.enum(["low", "medium", "high"]).optional().default("medium"),
});

const IntentsFileSchema = z.object({
  intents: z.record(z.string(), IntentSchema),
});

const PersonaSchema = z.object({
  personas: z.record(
    z.string(),
    z.object({
      system_prompt: z.string(),
      max_length: z.number().int().positive().optional(),
    }),
  ),
  default: z.string(),
});

const KnowledgeBaseIndexSchema = z.object({
  knowledge_base: z.object({
    backend: z.enum(["local", "api"]),
    documents_path: z.string().nonempty(),
  }),
});

const TicketingSchema = z.object({
  schema: z.string(),
  endpoint: z.string(),
  method: z.string(),
});

// config object interfaces

interface Config {
  intents: Record<string, IntentSpec>;
  persona: PersonaSpec;
  knowledge_base: KnowledgeBaseIndexSpec;
  ticketing: TicketingSpec;
}

interface IntentSpec {
  description: string;
  allowed_tools: string[];
  requires_auth: boolean;
  risk_level: "low" | "medium" | "high";
}

interface PersonaSpec {
  personas: Record<
    string,
    {
      system_prompt: string;
      max_length?: number;
    }
  >;
  default: string;
}
interface KnowledgeBaseIndexSpec {
  knowledge_base: {
    backend: "local" | "api";
    documents_path: string;
  };
}

interface TicketingSpec {
  schema: string;
  endpoint: string;
  method: string;
}

export async function loadConfigs(configFolder: string): Promise<Config> {
  const rootConfig = await loadYaml(`${configFolder}/config.yaml`);

  const rootConfigRes = RootConfigSchema.safeParse(rootConfig);
  if (!rootConfigRes.success)
    throw new Error(
      "config.yaml invalid: " +
        JSON.stringify(z.treeifyError(rootConfigRes.error), null, 2),
    );

  const intents = await loadYaml(
    `${configFolder}/${rootConfigRes.data.files.intents}`,
  );

  const persona = await loadYaml(
    `${configFolder}/${rootConfigRes.data.files.persona}`,
  );

  const kbIndex = await loadYaml(
    `${configFolder}/${rootConfigRes.data.files.knowledge_base_index}`,
  );

  const ticketing = await loadYaml(
    `${configFolder}/${rootConfigRes.data.files.ticketing}`,
  );

  const intentsRes = IntentsFileSchema.safeParse(intents);
  if (!intentsRes.success)
    throw new Error(
      "intents.yaml invalid: " +
        JSON.stringify(z.treeifyError(intentsRes.error), null, 2),
    );

  const personaRes = PersonaSchema.safeParse(persona);
  if (!personaRes.success)
    throw new Error(
      "persona.yaml invalid: " +
        JSON.stringify(z.treeifyError(personaRes.error), null, 2),
    );

  const kbIndexRes = KnowledgeBaseIndexSchema.safeParse(kbIndex);
  if (!kbIndexRes.success)
    throw new Error(
      "knowledge base index yaml invalid: " +
        JSON.stringify(z.treeifyError(kbIndexRes.error), null, 2),
    );

  const ticketingRes = TicketingSchema.safeParse(ticketing);

  if (!ticketingRes.success) {
    throw new Error(
      "ticketing yaml invalid: " +
        JSON.stringify(z.treeifyError(ticketingRes.error), null, 2),
    );
  }

  // TODO: check that intent allowed_tools are valid after defining the tools

  return {
    intents: intentsRes.data.intents,
    persona: personaRes.data,
    knowledge_base: kbIndexRes.data,
    ticketing: ticketingRes.data,
  };
}

// loader helper
async function loadYaml(path: string) {
  const file = Bun.file(path);
  const text = await file.text();
  return YAML.parse(text);
}
