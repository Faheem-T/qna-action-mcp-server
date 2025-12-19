export const MCPServerTools = {
  SEARCH_KB_TOOL: "search_knowledge",
  CREATE_TICKET_TOOL: "create_ticket",
  SEND_NOTIFICATION_TOOL: "send_notification",
  UPDATE_RECORD_TOOL: "update_record",
} as const;

export const MCPServerToolNames = Object.entries(MCPServerTools).map(
  ([_key, value]) => value,
);
