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
  name: z.string(),
  system_prompt: z.string(),
  max_response_tokens: z.number().int().positive().optional(),
});

const PersonaConfigSchema = z.object({
  personas: z.record(
    z.string(),
    z.object({
      system_prompt: z.string(),
      max_response_tokens: z.number().int().positive().optional(),
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
  name: string;
  system_prompt: string;
  max_response_tokens?: number;
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

  // Loading config files
  const intentsConfig = await loadYaml(
    `${configFolder}/${rootConfigRes.data.files.intents}`,
  );

  const personaConfig = await loadYaml(
    `${configFolder}/${rootConfigRes.data.files.persona}`,
  );

  const kbIndexConfig = await loadYaml(
    `${configFolder}/${rootConfigRes.data.files.knowledge_base_index}`,
  );

  const ticketingConfig = await loadYaml(
    `${configFolder}/${rootConfigRes.data.files.ticketing}`,
  );

  // validating config files
  const intentsRes = IntentsFileSchema.safeParse(intentsConfig);
  if (!intentsRes.success)
    throw new Error(
      "intents.yaml invalid: " +
        JSON.stringify(z.treeifyError(intentsRes.error), null, 2),
    );

  const personaRes = PersonaConfigSchema.safeParse(personaConfig);
  if (!personaRes.success)
    throw new Error(
      "persona.yaml invalid: " +
        JSON.stringify(z.treeifyError(personaRes.error), null, 2),
    );

  const kbIndexRes = KnowledgeBaseIndexSchema.safeParse(kbIndexConfig);
  if (!kbIndexRes.success)
    throw new Error(
      "knowledge base index yaml invalid: " +
        JSON.stringify(z.treeifyError(kbIndexRes.error), null, 2),
    );

  const ticketingRes = TicketingSchema.safeParse(ticketingConfig);

  if (!ticketingRes.success) {
    throw new Error(
      "ticketing yaml invalid: " +
        JSON.stringify(z.treeifyError(ticketingRes.error), null, 2),
    );
  }

  // TODO: check that intent allowed_tools are valid after defining the tools

  const defaultPersona = Object.entries(personaRes.data.personas).find(
    ([name, { system_prompt, max_response_tokens }]) =>
      name === personaRes.data.default,
  );

  if (!defaultPersona) {
    throw new Error(`Default persona (${personaRes.data.default}) not found`);
  }

  return {
    intents: intentsRes.data.intents,
    persona: { name: defaultPersona[0], ...defaultPersona[1] },
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
