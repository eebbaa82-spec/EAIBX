import type { ProCourse } from "./types";
import creditFoundations from "./credit-foundations.json";
import creditAnalysisAppraisal from "./credit-analysis-appraisal.json";
import loanPortfolioManagement from "./loan-portfolio-management.json";
import advancedCreditPortfolioRisk from "./advanced-credit-portfolio-risk.json";
import projectFinanceFoundations from "./project-finance-foundations.json";
import financialAppraisalLoanStructuring from "./financial-appraisal-loan-structuring.json";
import projectRiskStructuringMonitoring from "./project-risk-structuring-monitoring.json";
import syndicatedLoansCrossBorderProjectFinance from "./syndicated-loans-cross-border-project-finance.json";
import ethiopianBankingLawRegulation from "./ethiopian-banking-law-regulation.json";
import resourceMobilization from "./resource-mobilization.json";
import internationalTradeFinance from "./international-trade-finance.json";
import digitalBankingFintech from "./digital-banking-fintech.json";
import customerServiceRetailBanking from "./customer-service-retail-banking.json";
import salesNegotiationSkills from "./sales-negotiation-skills.json";
import internationalMoneyTransfersRemittances from "./international-money-transfers-remittances.json";
import regulatoryLandscapeInternationalOperations from "./regulatory-landscape-international-operations.json";
import treasuryForexManagement from "./treasury-forex-management.json";
import supplyChainFinance from "./supply-chain-finance.json";
import forexProductsRiskManagement from "./forex-products-risk-management.json";
import domesticBankingOperations from "./domestic-banking-operations.json";
import introductionCapitalMarkets from "./introduction-capital-markets.json";
import capitalMarketsLawRegulation from "./capital-markets-law-regulation.json";
import securities from "./securities.json";
import investmentAnalysisPortfolioManagement from "./investment-analysis-portfolio-management.json";
import brokerageOperationsClientAdvisory from "./brokerage-operations-client-advisory.json";
import financialModelingValuation from "./financial-modeling-valuation.json";
import dueDiligenceMastery from "./due-diligence-mastery.json";
import originationPitchDeck from "./origination-pitch-deck.json";
import privateEquityVentureCapital from "./private-equity-venture-capital.json";
import lboModeling from "./lbo-modeling.json";
import mergersAcquisitions from "./mergers-acquisitions.json";
import equityCapitalMarkets from "./equity-capital-markets.json";
import debtCapitalMarkets from "./debt-capital-markets.json";
import negotiationDealStructuring from "./negotiation-deal-structuring.json";
import sectorAnalysisModeling from "./sector-analysis-modeling.json";
import esgInvestmentBanking from "./esg-investment-banking.json";
import corporateGovernanceEthics from "./corporate-governance-ethics.json";
import riskManagementFramework from "./risk-management-framework.json";
import sustainableFinanceEsg from "./sustainable-finance-esg.json";
import dataAnalyticsDigitalLiteracy from "./data-analytics-digital-literacy.json";
import genderSensitiveFinancialServices from "./gender-sensitive-financial-services.json";
import digitalMarketingDigitalBanking from "./digital-marketing-digital-banking.json";
import socialMediaManagement from "./social-media-management.json";
import strategicLeadershipChangeManagement from "./strategic-leadership-change-management.json";

/** Every Academy course, in catalog order: by track, then level. */
export const proCourses = [
  creditFoundations,
  creditAnalysisAppraisal,
  loanPortfolioManagement,
  advancedCreditPortfolioRisk,
  projectFinanceFoundations,
  financialAppraisalLoanStructuring,
  projectRiskStructuringMonitoring,
  syndicatedLoansCrossBorderProjectFinance,
  ethiopianBankingLawRegulation,
  resourceMobilization,
  internationalTradeFinance,
  digitalBankingFintech,
  customerServiceRetailBanking,
  salesNegotiationSkills,
  internationalMoneyTransfersRemittances,
  regulatoryLandscapeInternationalOperations,
  treasuryForexManagement,
  supplyChainFinance,
  forexProductsRiskManagement,
  domesticBankingOperations,
  introductionCapitalMarkets,
  capitalMarketsLawRegulation,
  securities,
  investmentAnalysisPortfolioManagement,
  brokerageOperationsClientAdvisory,
  financialModelingValuation,
  dueDiligenceMastery,
  originationPitchDeck,
  privateEquityVentureCapital,
  lboModeling,
  mergersAcquisitions,
  equityCapitalMarkets,
  debtCapitalMarkets,
  negotiationDealStructuring,
  sectorAnalysisModeling,
  esgInvestmentBanking,
  corporateGovernanceEthics,
  riskManagementFramework,
  sustainableFinanceEsg,
  dataAnalyticsDigitalLiteracy,
  genderSensitiveFinancialServices,
  digitalMarketingDigitalBanking,
  socialMediaManagement,
  strategicLeadershipChangeManagement,
] as ProCourse[];

export const tracks: { id: ProCourse["track"]; name: string; intro: string }[] =
  [
    {
      id: "credit",
      name: "Credit Analysis Program",
      intro:
        "From the basics of lending to portfolio risk, built on Ethiopian bank credit practice and NBE directives.",
    },
    {
      id: "project",
      name: "Project Finance Program",
      intro:
        "Project lending from feasibility studies to financial appraisal, structuring, risk, monitoring and syndication.",
    },
    {
      id: "banking",
      name: "School of Banking Fundamentals",
      intro:
        "The core knowledge every banker needs, from regulation and funding to trade finance, treasury, digital banking and customer service.",
    },
    {
      id: "operations",
      name: "Banking Operations",
      intro:
        "How a branch runs its domestic operations: accounts, deposits, cheques and clearing, transfers, cash and fraud controls.",
    },
    {
      id: "tax",
      name: "Taxation Program",
      intro:
        "Ethiopian business taxation from registration and filing to tax planning, transfer pricing and audits, on the current proclamations and directives.",
    },
    {
      id: "smefinance",
      name: "SME Financial Management Program",
      intro:
        "Setting up a company, keeping Excel-based records, monitoring performance and preparing an investor-ready business.",
    },
    {
      id: "capital",
      name: "School of Capital Markets and Investment",
      intro:
        "How Ethiopia's capital market works and how to analyze, advise on and manage investments.",
    },
    {
      id: "ib",
      name: "School of Investment Banking",
      intro:
        "Hands-on valuation, deals and capital raising for investment bankers, fund managers and corporate finance teams.",
    },
    {
      id: "skills",
      name: "School of Professional Skills",
      intro:
        "Cross-cutting skills that strengthen every role in a modern financial institution or growing business.",
    },
  ];

export type FolderId = "bank-and-mfi" | "financial-management" | "capital-markets" | "general";

/** The Academy's course folders, each holding one or more tracks. */
export const folders: {
  id: FolderId;
  name: string;
  audience: string;
  intro: string;
  icon: ProCourse["icon"];
  tracks: ProCourse["track"][];
}[] = [
  {
    id: "bank-and-mfi",
    name: "Bank and MFI",
    audience: "Bank and MFI staff",
    intro:
      "Credit, project finance, banking fundamentals and branch operations, built on Ethiopian bank practice and NBE directives.",
    icon: "bank",
    tracks: ["credit", "project", "banking", "operations"],
  },
  {
    id: "financial-management",
    name: "Financial Management",
    audience: "SME owners, accountants, finance staff, NGOs and corporate teams",
    intro:
      "Taxation and financial management for Ethiopian businesses, on the current proclamations and directives, with Excel templates.",
    icon: "coins",
    tracks: ["tax", "smefinance"],
  },
  {
    id: "capital-markets",
    name: "Capital Market",
    audience: "Capital market professionals, investment bankers and fund managers",
    intro:
      "Ethiopia's capital market, securities, investment analysis and investment banking.",
    icon: "chart",
    tracks: ["capital", "ib"],
  },
  {
    id: "general",
    name: "General Courses",
    audience: "Staff and managers in any organization",
    intro:
      "Cross-cutting skills for every role: governance, risk, ESG, data, digital, leadership and workplace culture.",
    icon: "people",
    tracks: ["skills"],
  },
];

export const folderOf = (c: ProCourse) =>
  folders.find((f) => f.tracks.includes(c.track))!;

/** The level line on course cards and pages. */
export const levelLabel = (c: ProCourse) =>
  c.levels ??
  (c.track === "operations"
    ? "Five-day course"
    : `Level ${c.level} · ${levelNames[c.level]}`);

export const levelNames = {
  1: "Foundation",
  2: "Intermediate",
  3: "Advanced",
} as const;

export { academyPath, examHref, passMark, proCourseHref, simulationHref } from "./paths";
