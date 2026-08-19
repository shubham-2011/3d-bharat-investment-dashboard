import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "../src/data");

const INDUSTRIES = [
  "Roads",
  "Metro",
  "Railway",
  "Solar",
  "Bridges",
  "Smart City",
  "Water",
  "Ports",
  "Airports",
];

const STAGES = ["Seed", "Series A", "Series B", "Growth", "Pre-IPO"];
const APP_STAGES = ["Planning", "Approved", "In Progress", "Expansion"];
const STATUSES = ["Active", "Closing Soon", "Closed", "Upcoming"];
const RISKS = ["Low", "Medium", "High"];

const CITIES = [
  { city: "Bengaluru", state: "Karnataka" },
  { city: "Mumbai", state: "Maharashtra" },
  { city: "Gurgaon", state: "Haryana" },
  { city: "Hyderabad", state: "Telangana" },
  { city: "Pune", state: "Maharashtra" },
  { city: "Noida", state: "Uttar Pradesh" },
  { city: "Chennai", state: "Tamil Nadu" },
  { city: "Ahmedabad", state: "Gujarat" },
  { city: "Jaipur", state: "Rajasthan" },
];

const LOGO_COLORS = ["#1a56db", "#0f766e", "#b45309", "#dc2626", "#7c3aed", "#0284c7", "#d97706", "#059669"];

// 1. Generate deals.json (80 deals in Crore units)
const deals = [];
for (let i = 1; i <= 80; i++) {
  const id = `deal-${String(i).padStart(3, "0")}`;
  const industry = INDUSTRIES[(i - 1) % INDUSTRIES.length];
  const location = CITIES[(i - 1) % CITIES.length];
  const companyName = `Bharat ${industry} ${i}`;

  // Deal size in Crore: 0.5 Cr (50L) to 200 Cr
  let dealSize;
  if (i === 1) dealSize = 0.5; // 50 Lakhs
  else if (i === 2) dealSize = 200.0; // 200 Cr
  else dealSize = parseFloat((2.0 + ((i * 3.7) % 48.0)).toFixed(1));

  let minInvestment = parseFloat(Math.max(0.1, Math.min(dealSize * 0.05, 2.5)).toFixed(1));
  let maxInvestment = parseFloat(Math.max(minInvestment + 1.0, dealSize * 0.35).toFixed(1));

  let riskLevel = RISKS[(i - 1) % RISKS.length];
  let expectedROI;
  if (riskLevel === "High") expectedROI = parseFloat((25.0 + ((i * 1.7) % 18.0)).toFixed(1));
  else if (riskLevel === "Medium") expectedROI = parseFloat((16.0 + ((i * 1.3) % 8.0)).toFixed(1));
  else expectedROI = parseFloat((8.0 + ((i * 0.9) % 7.0)).toFixed(1));

  let stage = STAGES[(i - 1) % STAGES.length];
  let status = STATUSES[(i - 1) % STATUSES.length];

  let fundingRaised;
  let investorCount;
  if (i === 3) {
    fundingRaised = dealSize;
    investorCount = 14;
    status = "Closed";
  } else if (i === 4) {
    fundingRaised = 0;
    investorCount = 0;
    status = "Active";
  } else {
    fundingRaised = parseFloat((dealSize * (0.2 + ((i * 0.11) % 0.75))).toFixed(1));
    investorCount = Math.floor(2 + ((i * 3) % 18));
  }

  const baseRev = parseFloat((1.2 + ((i * 0.8) % 35.0)).toFixed(1));
  const revGrowth = parseFloat((12.0 + ((i * 2.3) % 45.0)).toFixed(1));

  const financials = {
    revenue: parseFloat((baseRev * 1.35).toFixed(1)),
    profitMargin: parseFloat((8.0 + ((i * 0.7) % 18.0)).toFixed(1)),
    growthRate: revGrowth,
    debtEquityRatio: parseFloat((0.3 + ((i * 0.1) % 0.6)).toFixed(2)),
    revenue3y: [
      { year: 2023, revenue: baseRev },
      { year: 2024, revenue: parseFloat((baseRev * (1 + revGrowth / 100)).toFixed(1)) },
      { year: 2025, revenue: parseFloat((baseRev * 1.35).toFixed(1)) },
    ],
  };

  const roiProjections = [2026, 2027, 2028, 2029, 2030].map((yr, idx) => {
    const proj = parseFloat((expectedROI * (1 + idx * 0.18)).toFixed(1));
    return {
      year: yr,
      conservative: parseFloat((proj * 0.8).toFixed(1)),
      projected: proj,
      optimistic: parseFloat((proj * 1.25).toFixed(1)),
    };
  });

  const month = String(((i % 12) + 1)).padStart(2, "0");
  const year = i > 40 ? "2024" : "2025";
  const createdAt = `${year}-${month}-15T10:00:00.000Z`;

  deals.push({
    id,
    companyName,
    company: companyName,
    projectName: `${companyName} Project`,
    industry,
    sector: `${industry} Infra`,
    foundedYear: 2016 + (i % 7),
    city: location.city,
    state: location.state,
    location: `${location.city}, ${location.state}`,
    description: `${companyName} is a leading ${industry} project in ${location.city}, India.`,
    dealSize,
    fundingTarget: dealSize,
    minInvestment,
    maxInvestment,
    equityOffered: parseFloat((2.0 + ((i * 1.3) % 12.0)).toFixed(1)),
    expectedROI,
    roi: expectedROI,
    riskLevel,
    stage: APP_STAGES[(i - 1) % APP_STAGES.length],
    status,
    fundingRaised,
    investorCount,
    financials,
    roiProjections,
    isOutlier: i === 2 || i === 80,
    revenuePattern: i % 2 === 0 ? "steady" : "accelerating",
    riskFactors: [
      "Regulatory policy shifts in regional markets",
      "Supply chain bottlenecks for hardware components",
      "Macroeconomic liquidity fluctuations",
    ],
    highlights: [
      `Proprietary ${industry} tech architecture`,
      "120%+ YoY revenue growth over trailing 24 months",
      "Exclusively partnered with tier-1 Indian conglomerates",
    ],
    createdAt,
    logoColor: LOGO_COLORS[i % LOGO_COLORS.length],
  });
}

// 2. Generate investors.json (15 investors in Crore units)
const INVESTOR_NAMES = [
  "Shubham Kumar", "Ananya Sharma", "Rajesh Singhania", "Nexus Bharat Ventures", "Vikas Malpani",
  "Kaveri Family Office", "Peak Capital India", "Sunil Munjal", "Rohan Mehta", "Matrix India Partners",
  "Pooja Agarwal", "Arjun Deshmukh", "Zenith Corporate Fund", "Kabir Capital", "Vikramaditya Rao"
];

const investors = INVESTOR_NAMES.map((name, idx) => {
  const isDemo = idx === 0;
  const id = isDemo ? "inv-001" : `INV-${String(idx + 1).padStart(3, "0")}`;
  const budget = parseFloat((5.0 + idx * 2.5).toFixed(1));
  const preferredIndustries = isDemo
    ? ["Roads", "Bridges", "Solar", "Water", "Ports"]
    : [INDUSTRIES[idx % 9], INDUSTRIES[(idx + 3) % 9], INDUSTRIES[(idx + 6) % 9]];

  const portfolio = [deals[idx * 3], deals[idx * 3 + 1], deals[idx * 3 + 2]].map((d, pIdx) => ({
    dealId: d.id,
    amountInvested: parseFloat((d.minInvestment * 1.5).toFixed(1)),
    investedDate: d.createdAt,
    currentROI: d.expectedROI,
    status: pIdx === 2 ? "Exited" : "Active",
  }));

  const months = [
    "2024-01", "2024-02", "2024-03", "2024-04", "2024-05", "2024-06",
    "2024-07", "2024-08", "2024-09", "2024-10", "2024-11", "2024-12",
    "2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06",
    "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12"
  ];

  let baseVal = 2.0;
  const investmentGrowth = months.map((m, mIdx) => {
    let delta = 0.35 + mIdx * 0.08;
    if (mIdx === 5) delta = -0.6;
    if (mIdx === 11) delta = -1.1;
    if (mIdx === 18) delta = -0.8;
    baseVal += delta;
    return { month: m, amount: parseFloat(baseVal.toFixed(1)), value: parseFloat(baseVal.toFixed(1)) };
  });

  return {
    id,
    name,
    type: idx % 2 === 0 ? "VC" : "Angel",
    avatarColor: LOGO_COLORS[idx % LOGO_COLORS.length],
    city: CITIES[idx % CITIES.length].city,
    preferredIndustries,
    riskAppetite: RISKS[idx % RISKS.length],
    budget,
    budgetRange: { min: 0.5, max: budget },
    preferredStages: [STAGES[idx % STAGES.length]],
    totalInvested: parseFloat((budget * 0.75).toFixed(1)),
    activeDeals: 3,
    avgROI: 18.5,
    portfolio,
    investmentGrowth,
    joinedDate: "2023-01-10T08:00:00.000Z",
  };
});

// 3. Generate investmentGrowth.json (24 months)
const months24 = [
  "2024-01", "2024-02", "2024-03", "2024-04", "2024-05", "2024-06",
  "2024-07", "2024-08", "2024-09", "2024-10", "2024-11", "2024-12",
  "2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06",
  "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12"
];

let baseGrowth = 120.0;
const investmentGrowth = months24.map((m, idx) => {
  let delta = 8.5 + idx * 2.1;
  if (idx === 5) delta = -14.0; // Dip 1 (2024-06)
  if (idx === 11) delta = -21.0; // Dip 2 (2024-12)
  if (idx === 18) delta = -18.0; // Dip 3 (2025-07)
  baseGrowth += delta;

  return {
    month: m,
    totalInvestment: parseFloat(baseGrowth.toFixed(1)),
    dealCount: Math.floor(18 + idx * 2.5),
    newInvestors: Math.floor(5 + ((idx * 7) % 12)),
  };
});

// 4. Generate industryDistribution.json (9 industries)
const industryDistribution = INDUSTRIES.map((ind) => {
  const indDeals = deals.filter((d) => d.industry === ind);
  const dealCount = indDeals.length;
  const totalValue = parseFloat(indDeals.reduce((s, d) => s + d.dealSize, 0).toFixed(1));
  const avgROI = parseFloat((indDeals.reduce((s, d) => s + d.expectedROI, 0) / (dealCount || 1)).toFixed(1));
  const avgRisk = parseFloat((indDeals.reduce((s, d) => s + (d.riskLevel === "High" ? 3 : d.riskLevel === "Medium" ? 2 : 1), 0) / (dealCount || 1)).toFixed(1));

  return {
    industry: ind,
    value: totalValue,
    dealCount,
    totalValue,
    avgROI,
    avgRisk,
  };
});

// 5. Generate corporateAnalytics.json
const totalFundingRaised = parseFloat(deals.reduce((s, d) => s + d.fundingRaised, 0).toFixed(1));
const totalTarget = parseFloat(deals.reduce((s, d) => s + d.dealSize, 0).toFixed(1));
const avgConversionRate = parseFloat(((totalFundingRaised / totalTarget) * 100).toFixed(1));

const monthlyTrends = months24.slice(12, 24).map((m, idx) => ({
  month: m,
  fundingRaised: parseFloat((35.0 + idx * 8.5).toFixed(1)),
  investorInquiries: Math.floor(45 + idx * 8),
  dealsConverted: Math.floor(3 + ((idx * 2) % 6)),
}));

const corporateAnalytics = {
  totalFundingRaised,
  investorCount: 461,
  avgConversionRate,
  conversionRate: avgConversionRate,
  monthlyTrends,
};

fs.writeFileSync(path.join(dataDir, "deals.json"), JSON.stringify(deals, null, 2));
fs.writeFileSync(path.join(dataDir, "investors.json"), JSON.stringify(investors, null, 2));
fs.writeFileSync(path.join(dataDir, "investmentGrowth.json"), JSON.stringify(investmentGrowth, null, 2));
fs.writeFileSync(path.join(dataDir, "industryDistribution.json"), JSON.stringify(industryDistribution, null, 2));
fs.writeFileSync(path.join(dataDir, "corporateAnalytics.json"), JSON.stringify(corporateAnalytics, null, 2));

console.log("SUCCESS — Chart-ready datasets generated in src/data/");
