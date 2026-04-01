export interface ChecklistItem {
  id: number;
  question: string;
  relevantDocuments: string[];
}

export interface ChecklistDimension {
  dimension: string;
  code: string;
  items: ChecklistItem[];
}

export const checklist: ChecklistDimension[] = [
  {
    dimension: "Financial Health",
    code: "I",
    items: [
      {
        id: 1,
        question: "Revenue trend — growing, flat, or declining over 3 years?",
        relevantDocuments: ["B-10", "B-11", "B-12", "B-25", "B-26"]
      },
      {
        id: 2,
        question: "Gross margin consistency — is food cost (COGS %) stable or volatile?",
        relevantDocuments: ["B-10", "B-11", "B-12", "B-45", "E-45"]
      },
      {
        id: 3,
        question: "EBITDA margins — are they in line with restaurant industry norms (8-15%)?",
        relevantDocuments: ["B-10", "B-11", "B-12", "B-13"]
      },
      {
        id: 4,
        question: "Working capital adequacy — can the business meet short-term obligations?",
        relevantDocuments: ["B-10", "B-11", "B-12", "B-16", "B-17", "B-23"]
      },
      {
        id: 5,
        question: "Revenue concentration — is any single channel >50% of revenue? Any concerning channel trends?",
        relevantDocuments: ["B-25", "B-26", "E-48"]
      },
      {
        id: 6,
        question: "Cash flow vs. reported profit — any significant divergence? Any unusual cash movements?",
        relevantDocuments: ["B-16", "B-17", "B-23", "B-26"]
      },
      {
        id: 7,
        question: "Debt-to-equity ratio — is leverage reasonable?",
        relevantDocuments: ["B-10", "B-11", "B-12", "B-23"]
      },
      {
        id: 8,
        question: "Tax compliance — any outstanding tax liabilities, disputes, or audit risk?",
        relevantDocuments: ["B-14", "B-15", "A-07"]
      },
      {
        id: 9,
        question: "Intercompany / related party transactions — any non-arm's length transfers or undisclosed arrangements?",
        relevantDocuments: ["B-27", "A-09", "B-11", "B-12"]
      },
      {
        id: 10,
        question: "Quality of earnings — are there one-time items, owner add-backs, or adjustments that inflate/deflate reported earnings?",
        relevantDocuments: ["B-10", "B-11", "B-12", "B-24", "B-25", "E-48"]
      }
    ]
  },
  {
    dimension: "Legal & Compliance",
    code: "II",
    items: [
      {
        id: 11,
        question: "Lease term and assignability — can the lease transfer to a buyer? What conditions?",
        relevantDocuments: ["C-28", "C-29", "C-34"]
      },
      {
        id: 12,
        question: "Lease remaining term — is 6 years sufficient to justify the acquisition and recoup investment?",
        relevantDocuments: ["C-28", "C-34", "B-24"]
      },
      {
        id: 13,
        question: "Health inspection history — any critical violations or patterns of non-compliance?",
        relevantDocuments: ["F-54", "G-60"]
      },
      {
        id: 14,
        question: "Liquor license transferability — any restrictions or risks to transfer?",
        relevantDocuments: ["A-06", "F-58"]
      },
      {
        id: 15,
        question: "Pending or threatened litigation — any current or potential material legal exposure?",
        relevantDocuments: ["G-59", "G-60", "F-56"]
      },
      {
        id: 16,
        question: "Regulatory fines or violations — any pattern of non-compliance across regulatory bodies?",
        relevantDocuments: ["G-60", "F-54", "F-55", "F-58"]
      },
      {
        id: 17,
        question: "IP protection — is the brand name properly protected? Any conflicting marks?",
        relevantDocuments: ["G-61", "E-51"]
      },
      {
        id: 18,
        question: "Insurance adequacy — are coverage types and limits appropriate for a restaurant of this size?",
        relevantDocuments: ["F-56", "D-42", "G-59"]
      }
    ]
  },
  {
    dimension: "Operational Risk",
    code: "III",
    items: [
      {
        id: 19,
        question: "Key person dependency — does the business critically depend on specific individuals (chef, owner)?",
        relevantDocuments: ["A-08", "D-36", "D-39", "A-02", "A-03"]
      },
      {
        id: 20,
        question: "Supplier concentration — is any single supplier responsible for >40% of inputs? Supply chain resilience?",
        relevantDocuments: ["E-46", "E-45", "B-20"]
      },
      {
        id: 21,
        question: "Equipment condition — are major items near end of life? What CAPEX is needed in next 12-24 months?",
        relevantDocuments: ["E-49", "B-22", "C-31"]
      },
      {
        id: 22,
        question: "Technology adequacy — is the POS/tech stack modern, reliable, and transferable?",
        relevantDocuments: ["E-51", "E-53"]
      },
      {
        id: 23,
        question: "Delivery platform dependency — what % of revenue comes through third-party platforms? What is the margin impact of commissions?",
        relevantDocuments: ["E-48", "B-25", "B-26", "B-11", "B-12"]
      },
      {
        id: 24,
        question: "Menu pricing power — are prices competitive, above, or below comparable restaurants?",
        relevantDocuments: ["E-44", "H-62", "E-45"]
      },
      {
        id: 25,
        question: "Food safety systems — are HACCP or equivalent food safety procedures documented and followed?",
        relevantDocuments: ["F-54", "A-05", "D-35"]
      },
      {
        id: 26,
        question: "Deferred maintenance — any maintenance backlog or items being deferred?",
        relevantDocuments: ["C-31", "E-49", "E-50", "B-22"]
      }
    ]
  },
  {
    dimension: "Employment & People",
    code: "IV",
    items: [
      {
        id: 27,
        question: "Staff turnover rate — is it above or below industry average (~75% annual for restaurants)?",
        relevantDocuments: ["D-35", "D-40"]
      },
      {
        id: 28,
        question: "Key employee retention — are the head chef and GM contractually committed post-acquisition?",
        relevantDocuments: ["D-36", "D-37", "D-39"]
      },
      {
        id: 29,
        question: "Non-compete coverage — are key employees restricted from competing if they leave?",
        relevantDocuments: ["D-39", "D-36", "D-37"]
      },
      {
        id: 30,
        question: "Wage and hour compliance — any risks related to tipped employees, overtime, or classification?",
        relevantDocuments: ["D-35", "D-40", "D-41"]
      },
      {
        id: 31,
        question: "Benefits obligations — any unfunded liabilities, accrued PTO, or benefit commitments?",
        relevantDocuments: ["D-41", "D-40"]
      },
      {
        id: 32,
        question: "Immigration / work permit compliance — are all authorizations current? Any renewal risks?",
        relevantDocuments: ["D-43", "D-35"]
      }
    ]
  },
  {
    dimension: "Market & Competitive Position",
    code: "V",
    items: [
      {
        id: 33,
        question: "Customer review trajectory — are ratings and review volume trending up or down?",
        relevantDocuments: ["E-52", "B-26"]
      },
      {
        id: 34,
        question: "Competitive landscape — how saturated is the local market? Any direct competitors at the same price point?",
        relevantDocuments: ["H-62", "E-44", "E-52"]
      },
      {
        id: 35,
        question: "Demographic and foot traffic trends — is the trade area growing, stable, or declining?",
        relevantDocuments: ["H-62"]
      },
      {
        id: 36,
        question: "Brand strength and protection — how strong is the brand beyond local recognition?",
        relevantDocuments: ["G-61", "E-52", "E-53", "E-51"]
      },
      {
        id: 37,
        question: "Growth opportunities — is there a credible pipeline for revenue expansion (catering, events, brunch, pricing)?",
        relevantDocuments: ["H-62", "B-24", "B-25", "E-53"]
      }
    ]
  },
  {
    dimension: "Transaction-Specific",
    code: "VI",
    items: [
      {
        id: 38,
        question: "Seller motivation — why are they selling? Any red flags in the stated reasons?",
        relevantDocuments: ["A-09", "A-03", "H-62"]
      },
      {
        id: 39,
        question: "Valuation basis — is $850K (~6.4x EBITDA) reasonable for a single-location restaurant?",
        relevantDocuments: ["B-12", "B-24", "C-28", "D-36"]
      },
      {
        id: 40,
        question: "Transition plan — will the seller/key employees stay for a handover? How long?",
        relevantDocuments: ["D-36", "D-37", "D-39", "A-09"]
      },
      {
        id: 41,
        question: "Change of control provisions — which contracts require consent, notification, or re-execution upon sale?",
        relevantDocuments: ["C-28", "C-34", "A-06", "E-46", "D-43", "E-48"]
      },
      {
        id: 42,
        question: "Post-acquisition investment needs — what immediate and medium-term CAPEX is required?",
        relevantDocuments: ["E-49", "C-31", "B-22", "B-24"]
      }
    ]
  }
];
