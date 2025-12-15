import z from "zod";
import { YAML } from "bun";

const RootConfigSchema = z.object({
  files: z.object({
    intents: z.string(),
    record_capabilities: z.string(),
    sampling: z.string(),
    persona: z.string(),
    connectors: z.string(),
    knowledge_base_index: z.string(),
    // audit_policy: z.string(),
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

const RecordSpec = z.object({
  description: z.string().optional(),
  connector: z.string(),
  id_field: z.string(),
  updatable_fields: z.array(z.string()).nonempty(),
  constraints: z.record(z.string(), z.array(z.string())).optional(),
});
const RecordsFileSchema = z.object({
  records: z.record(z.string(), RecordSpec),
});

const SamplingSchema = z.object({
  sampling: z.object({
    confidence_threshold: z.number().min(0).max(1),
    min_attempts_before_escalation: z
      .number()
      .int()
      .min(0)
      .optional()
      .default(1),
    high_risk_intents: z.array(z.string()).optional().default([]),
    escalation_actions: z.record(z.string(), z.string()).optional(),
  }),
});

const PersonaSchema = z.object({
  personas: z.record(
    z.string(),
    z.object({
      system_prompt: z.string(),
      max_length: z.number().int().positive().optional(),
    }),
  ),
  default: z.string().optional(),
});

const ConnectorsSchema = z.object({
  connectors: z.record(
    z.string(),
    z.object({
      type: z.string(),
      base_url: z.string().optional(),
      auth_env: z.string().optional(),
      timeout_ms: z.number().int().optional(),
    }),
  ),
});

const KnowledgeBaseIndexSchema = z.object({
  knowledge_base: z.object({
    backend: z.enum(["local", "api"]),
    type: z.string().nonempty(),
    documents_path: z.string().nonempty(),
  }),
});

// loader helper
async function loadYaml(path: string) {
  const file = Bun.file(path);
  const text = await file.text();
  return YAML.parse(text);
}

export async function loadConfigs(configFolder: string) {
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
  const records = await loadYaml(
    `${configFolder}/${rootConfigRes.data.files.record_capabilities}`,
  );
  const sampling = await loadYaml(
    `${configFolder}/${rootConfigRes.data.files.sampling}`,
  );
  const persona = await loadYaml(
    `${configFolder}/${rootConfigRes.data.files.persona}`,
  );
  const connectors = await loadYaml(
    `${configFolder}/${rootConfigRes.data.files.connectors}`,
  );
  const kbIndex = await loadYaml(
    `${configFolder}/${rootConfigRes.data.files.knowledge_base_index}`,
  );

  const intentsRes = IntentsFileSchema.safeParse(intents);
  if (!intentsRes.success)
    throw new Error(
      "intents.yaml invalid: " +
        JSON.stringify(z.treeifyError(intentsRes.error), null, 2),
    );

  const recordsRes = RecordsFileSchema.safeParse(records);
  if (!recordsRes.success)
    throw new Error(
      "record_capabilities.yaml invalid: " +
        JSON.stringify(z.treeifyError(recordsRes.error), null, 2),
    );

  const samplingRes = SamplingSchema.safeParse(sampling);
  if (!samplingRes.success)
    throw new Error(
      "sampling.yaml invalid: " +
        JSON.stringify(z.treeifyError(samplingRes.error), null, 2),
    );

  const personaRes = PersonaSchema.safeParse(persona);
  if (!personaRes.success)
    throw new Error(
      "persona.yaml invalid: " +
        JSON.stringify(z.treeifyError(personaRes.error), null, 2),
    );

  const connectorsRes = ConnectorsSchema.safeParse(connectors);
  if (!connectorsRes.success)
    throw new Error(
      "connectors.yaml invalid: " +
        JSON.stringify(z.treeifyError(connectorsRes.error), null, 2),
    );

  const kbIndexRes = KnowledgeBaseIndexSchema.safeParse(kbIndex);
  if (!kbIndexRes.success)
    throw new Error(
      "knowledge base index yaml invalid: " +
        JSON.stringify(z.treeifyError(kbIndexRes.error), null, 2),
    );

  // cross-file checks
  // 1) every record.connector exists in connectors
  for (const [name, rec] of Object.entries(recordsRes.data.records)) {
    if (!(rec.connector in connectorsRes.data.connectors)) {
      throw new Error(
        `record_capabilities.yaml: record "${name}" references unknown connector "${rec.connector}"`,
      );
    }
    // TODO: check that intent allowed_tools are valid after defining the tools
  }

  return {
    intents: intentsRes.data.intents,
    records: recordsRes.data.records,
    sampling: samplingRes.data.sampling,
    persona: personaRes.data,
    connectors: connectorsRes.data.connectors,
    kb: kbIndexRes.data.knowledge_base,
  };
}
