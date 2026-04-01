export interface ModelConfig {
  label: string;
  model: string;
  provider: "openai" | "anthropic" | "gemini";
}

export const SYSTEM_PROMPT = `You are a due diligence analyst. For each of the 42 checklist items, review all provided documents and return a JSON array. Each item must have: itemNumber (integer), rating (exactly one of: GREEN, AMBER, RED), confidence (integer 1-10), rationale (2-3 sentences citing specific documents and numbers). If information is missing, rate AMBER. If two documents contradict each other, rate RED and cite both. Return ONLY valid JSON, no other text.`;

export const models: ModelConfig[] = [
  { label: "Model A: GPT-5.2",            model: "gpt-5.2",          provider: "openai"    },
  { label: "Model B: claude-sonnet-4-6",  model: "claude-sonnet-4-6", provider: "anthropic" },
  { label: "Model C: gemini-2.5-pro",     model: "gemini-2.5-pro",    provider: "gemini"    },
];

export function buildDocumentContext(documents: Array<{id: string; title: string; content: string}>): string {
  return documents.map(doc =>
    `===== DOCUMENT ${doc.id}: ${doc.title} =====\n${doc.content}\n`
  ).join('\n');
}

export function buildUserPrompt(checklist: Array<{id: number; question: string}>, documentContext: string): string {
  const checklistText = checklist.map(item => `${item.id}. ${item.question}`).join('\n');

  return `${documentContext}

===== DUE DILIGENCE CHECKLIST (42 items) =====
${checklistText}

Return a JSON array with exactly 42 objects — one per checklist item — in this format:
[
  {"itemNumber": 1, "rating": "GREEN", "confidence": 8, "rationale": "..."},
  {"itemNumber": 2, "rating": "AMBER", "confidence": 6, "rationale": "..."},
  ...
]
Return ONLY the JSON array. No preamble, no explanation, no markdown fences. Start with [ and end with ].`;
}
