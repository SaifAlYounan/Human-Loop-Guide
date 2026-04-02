export interface ModelConfig {
  label: string;
  model: string;
  provider: "openai" | "anthropic" | "gemini";
}

export const SYSTEM_PROMPT = `You are a due diligence analyst. For each of the 42 checklist items, review all provided documents and return a JSON array. Each item must have:
- itemNumber (integer)
- rating (exactly one of: "LOW RISK", "MEDIUM RISK", "HIGH RISK")
- confidence (integer 1-10)
- rationale (2-3 sentences citing specific documents and data points)

RISK RATING RUBRIC — Apply this standard to every checklist item:

LOW RISK — Item is:
• Fully documented with no gaps
• Compliant with standard practice
• No contradictions across documents
• Immaterial to deal value (<1% impact)

MEDIUM RISK — Item has:
• Partial documentation or minor gaps
• Non-standard but not unusual terms
• Minor inconsistencies between documents
• Moderate potential impact (1-5% of deal value)

HIGH RISK — Item has:
• Missing or contradictory documentation
• Material deviation from market standard
• Conflicts between documents (e.g., one document says X, another says Y)
• Significant potential impact (>5% of deal value or deal-breaker potential)

Rate each item against ALL four criteria in the relevant tier. If an item meets ANY single criterion of a higher tier, rate it at the higher tier. When in doubt, rate UP not down.

If expected information is missing, rate "MEDIUM RISK" and note the gap.
If two documents contradict each other, rate "HIGH RISK" and cite both documents.
Return ONLY valid JSON, no other text.`;

export const models: ModelConfig[] = [
  { label: "GPT-5.2",           model: "gpt-5.2",           provider: "openai"    },
  { label: "Claude Sonnet 4.6", model: "claude-sonnet-4-6", provider: "anthropic" },
  { label: "Gemini 2.5 Pro",    model: "gemini-2.5-pro",    provider: "gemini"    },
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
  {"itemNumber": 1, "rating": "LOW RISK", "confidence": 8, "rationale": "..."},
  {"itemNumber": 2, "rating": "MEDIUM RISK", "confidence": 6, "rationale": "..."},
  ...
]
Return ONLY the JSON array. No preamble, no explanation, no markdown fences. Start with [ and end with ].`;
}
