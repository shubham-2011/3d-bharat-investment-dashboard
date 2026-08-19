import fs from "fs";
import path from "path";

const ALL_INDUSTRIES = [
  "Fintech",
  "HealthTech",
  "AgriTech",
  "EV/CleanEnergy",
  "SaaS",
  "E-commerce",
  "Manufacturing",
  "EdTech",
  "Logistics",
  "DeepTech",
  "Roads",
  "Bridges",
  "Railway",
  "Metro",
  "Solar",
  "Smart City",
];

const SECTORS = {
  Fintech: ["Payment Gateway", "Neo-Banking", "InsurTech", "WealthTech", "Micro-Lending"],
  HealthTech: ["Telemedicine", "Diagnostic AI", "Pharma Supply", "MedTech Devices", "Genomics"],
  AgriTech: ["Precision Farming", "Farm-to-Fork Supply", "Drone Spraying", "Agri-Fintech", "Hydroponics"],
  "EV/CleanEnergy": ["Solar Microgrids", "Battery Swapping", "EV Charging Network", "Biofuel Tech", "Wind Analytics"],
  SaaS: ["Enterprise CRM", "HR Tech", "Developer Tools", "Cybersecurity", "Workflow Automation"],
  "E-commerce": ["B2B Industrial Marketplace", "D2C Brands", "Social Commerce", "Hyperlocal Delivery", "Q-Commerce"],
  Manufacturing: ["Smart Automation", "3D Printing", "Robotics", "IoT Sensors", "Chemical Processing"],
  EdTech: ["K-12 Skill Learning", "Test Prep AI", "Upskilling Platform", "Vernacular Learning", "STEM Kits"],
  Logistics: ["Cold Chain Network", "Freight Aggregation", "Last-Mile Delivery", "Warehouse Automation", "Fleet Tracking"],
  DeepTech: ["Quantum Sensors", "SpaceTech Propulsion", "Edge AI Hardware", "Synthetic Biology", "Photonics Computing"],
  Roads: ["Expressway Development", "Highway Toll Operations", "Pavement Sensor Tech", "Traffic AI", "Bridge Safety"],
  Bridges: ["Cable-Stayed Span", "Flyover Construction", "Structural Health Sensors", "River Crossing", "Urban Viaduct"],
  Railway: ["High-Speed Rail", "Freight Corridor", "Signaling Automation", "Track Inspection AI", "Station Redev"],
  Metro: ["Urban Transit Line", "Monorail System", "Automatic Fare Tech", "Subway Tunneling", "EV Feeder Fleet"],
  Solar: ["Utility-Scale Solar", "Rooftop Commercial", "Agri-Photovoltaics", "Solar Storage Grid", "Floating Solar"],
  "Smart City": ["Integrated Command Center", "Smart Street Lighting", "Waste-to-Energy", "Urban Water IoT", "Smart Parking"],
};

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
  { city: "Kolkata", state: "West Bengal" },
];

const COMPANY_PREFIXES = [
  "Nav", "Bharat", "Vikas", "Agni", "Kisan", "Vyapar", "Indus", "Med", "Aero", "Urja",
  "Pay", "Zeta", "Cogni", "Logi", "Cyber", "Skill", "Zenith", "B2B", "Quantum", "Green"
];

const COMPANY_SUFFIXES = [
  "Tech", "Solutions", "Labs", "Grid", "Networks", "Dynamics", "Systems", "Hub", "Capital", "Works"
];

const STAGES = ["Seed", "Series A", "Series B", "Growth", "Pre-IPO"];
const APP_STAGES = ["Planning", "Approved", "In Progress", "Expansion"];
const STATUSES = ["Active", "Closing Soon", "Closed", "Upcoming"];
const LOGO_COLORS = ["#1a56db", "#0f766e", "#b45309", "#dc2626", "#7c3aed", "#0284c7", "#d97706", "#059669"];

// Generate 80 Deals (exactly 5 deals for each of the 16 industries)
const deals = [];
for (let i = 1; i <= 80; i++) {
  const id = `deal-${String(i).padStart(3, "0")}`;
  const industry = ALL_INDUSTRIES[(i - 1) % ALL_INDUSTRIES.length];
  const sectorList = SECTORS[industry] || SECTORS["Fintech"];
  const sector = sectorList[(i - 1) % sectorList.length];
  const location = CITIES[(i - 1) % CITIES.length];
  const prefix = COMPANY_PREFIXES[(i - 1) % COMPANY_PREFIXES.length];
  const suffix = COMPANY_SUFFIXES[i % COMPANY_SUFFIXES.length];
  const companyName = `${prefix}${suffix} India`;

  let dealSize;
  if (i === 1) dealSize = 50; // 50 Lakhs (very small)
  else if (i === 2) dealSize = 20000; // 200 Cr (very large)
  else dealSize = Math.floor(200 + ((i * 173) % 4800)); // 2 Cr to 50 Cr

  let minInvestment = Math.max(1, Math.min(Math.floor(dealSize * 0.05), 50));
  let maxInvestment = Math.max(minInvestment + 50, Math.floor(dealSize * 0.4));
  const equityOffered = parseFloat((2.0 + ((i * 1.3) % 12.0)).toFixed(1));

  let riskLevel = (i % 3 === 0) ? "High" : (i % 3 === 1) ? "Medium" : "Low";
  let expectedROI;
  if (riskLevel === "High") expectedROI = parseFloat((25.0 + ((i * 1.7) % 14.0)).toFixed(1));
  else if (riskLevel === "Medium") expectedROI = parseFloat((16.0 + ((i * 1.3) % 8.0)).toFixed(1));
  else expectedROI = parseFloat((8.0 + ((i * 0.9) % 7.0)).toFixed(1));

  let stage = STAGES[(i - 1) % STAGES.length];
  let appStage = APP_STAGES[(i - 1) % APP_STAGES.length];
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
    const raiseRatio = parseFloat((0.2 + ((i * 0.11) % 0.75)).toFixed(2));
    fundingRaised = Math.floor(dealSize * raiseRatio);
    investorCount = Math.floor(2 + ((i * 3) % 18));
  }

  const baseRev = Math.floor(100 + ((i * 87) % 3500));
  let revGrowth2024 = parseFloat((12.0 + ((i * 2.3) % 45.0)).toFixed(1));
  if (i === 5) revGrowth2024 = -12.5;

  const rev2025 = Math.floor(baseRev * (1 + revGrowth2024 / 100) * 1.25);
  const margin2025 = parseFloat((10.0 + ((i * 0.9) % 22.0)).toFixed(1));

  const financials = {
    revenue: rev2025,
    profitMargin: margin2025,
    growthRate: 25.0,
    debtEquityRatio: parseFloat((0.3 + ((i * 0.1) % 0.6)).toFixed(2)),
    burnRate: Math.floor(baseRev * 0.08),
    valuation: Math.floor(dealSize * 6.0),
    "2023": {
      revenue: baseRev,
      revenueGrowth: 15.0,
      profitMargin: parseFloat((5.0 + ((i * 0.7) % 18.0)).toFixed(1)),
      burnRate: Math.floor(baseRev * 0.15),
      valuation: Math.floor(dealSize * 4.5),
    },
    "2024": {
      revenue: Math.floor(baseRev * (1 + revGrowth2024 / 100)),
      revenueGrowth: revGrowth2024,
      profitMargin: parseFloat((7.0 + ((i * 0.8) % 20.0)).toFixed(1)),
      burnRate: Math.floor(baseRev * 0.12),
      valuation: Math.floor(dealSize * 5.2),
    },
    "2025": {
      revenue: rev2025,
      revenueGrowth: 25.0,
      profitMargin: margin2025,
      burnRate: Math.floor(baseRev * 0.08),
      valuation: Math.floor(dealSize * 6.0),
    },
  };

  const roiProjections = [2026, 2027, 2028, 2029, 2030].map((yr, idx) => {
    const proj = parseFloat((expectedROI * (1 + idx * 0.18)).toFixed(1));
    return {
      year: yr,
      projectedROI: proj,
      projectedRoi: proj,
      conservative: parseFloat((proj * 0.8).toFixed(1)),
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
    projectName: `${companyName} ${sector}`,
    industry,
    sector,
    foundedYear: 2016 + (i % 7),
    city: location.city,
    state: location.state,
    location: `${location.city}, ${location.state}`,
    description: `${companyName} is a leading ${sector} pioneer in ${location.city}, transforming ${industry} operations across India.`,
    dealSize,
    fundingTarget: dealSize,
    minInvestment,
    maxInvestment,
    equityOffered,
    expectedROI,
    roi: expectedROI,
    riskLevel,
    stage: (i % 2 === 0) ? appStage : stage,
    status,
    fundingRaised,
    investorCount,
    financials,
    roiProjections,
    riskFactors: [
      "Regulatory policy shifts in regional markets",
      "Supply chain bottlenecks for hardware components",
      "Macroeconomic liquidity fluctuations in early-stage rounds",
    ],
    highlights: [
      `Proprietary ${sector} tech architecture with patent filings`,
      "120%+ YoY revenue growth over trailing 24 months",
      "Exclusively partnered with tier-1 Indian enterprise conglomerates",
    ],
    createdAt,
    logoColor: LOGO_COLORS[i % LOGO_COLORS.length],
  });
}

// Generate 15 Investors
const INVESTOR_NAMES = [
  "Shubham Kumar", "Ananya Sharma", "Rajesh Singhania", "Nexus Bharat Ventures", "Vikas Malpani",
  "Kaveri Family Office", "Peak Capital India", "Sunil Munjal", "Rohan Mehta", "Matrix India Partners",
  "Pooja Agarwal", "Arjun Deshmukh", "Zenith Corporate Fund", "Kabir Capital", "Vikramaditya Rao"
];

const INVESTOR_TYPES = ["HNI", "Angel", "VC", "VC", "Family Office", "Family Office", "VC", "Angel", "HNI", "VC", "Angel", "HNI", "Corporate", "VC", "Family Office"];

const investors = INVESTOR_NAMES.map((name, idx) => {
  const isDemoUser = idx === 0;
  const id = isDemoUser ? "inv-001" : `INV-${String(idx + 1).padStart(3, "0")}`;
  const type = INVESTOR_TYPES[idx];
  const city = CITIES[idx % CITIES.length].city;
  const preferredIndustries = isDemoUser
    ? ["Roads", "Bridges", "EV/CleanEnergy", "Fintech", "SaaS"]
    : [
        ALL_INDUSTRIES[(idx * 4) % ALL_INDUSTRIES.length],
        ALL_INDUSTRIES[(idx * 4 + 1) % ALL_INDUSTRIES.length],
        ALL_INDUSTRIES[(idx * 4 + 2) % ALL_INDUSTRIES.length],
      ];
  const riskAppetite = idx % 3 === 0 ? "Medium" : idx % 3 === 1 ? "Low" : "High";
  const budget = 500 + idx * 250;
  const budgetRange = { min: 25 + idx * 10, max: budget };
  const preferredStages = [STAGES[idx % STAGES.length], STAGES[(idx + 2) % STAGES.length]];

  const portfolioDeals = [
    deals[(idx * 5) % 80],
    deals[(idx * 5 + 1) % 80],
    deals[(idx * 5 + 2) % 80],
    deals[(idx * 5 + 3) % 80],
  ];

  const portfolio = portfolioDeals.map((d, pIdx) => ({
    dealId: d.id,
    amountInvested: Math.floor(d.minInvestment * (1.5 + pIdx * 0.5)),
    investedDate: d.createdAt,
    currentROI: parseFloat((d.expectedROI * (0.9 + pIdx * 0.1)).toFixed(1)),
    status: pIdx === 3 ? "At Risk" : pIdx === 2 ? "Exited" : "Active",
  }));

  const totalInvested = portfolio.reduce((acc, p) => acc + p.amountInvested, 0);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const investmentGrowth = months.map((m, mIdx) => ({
    month: m,
    amount: Math.floor(200 + mIdx * 65 + ((mIdx * 17) % 40)),
  }));

  return {
    id,
    name,
    type,
    avatarColor: LOGO_COLORS[idx % LOGO_COLORS.length],
    city,
    preferredIndustries,
    riskAppetite,
    budget,
    budgetRange,
    preferredStages,
    totalInvested,
    activeDeals: portfolio.filter((p) => p.status === "Active").length,
    avgROI: parseFloat((18.5 + (idx * 0.8) % 12.0).toFixed(1)),
    portfolio,
    investmentGrowth,
    joinedDate: `2023-0${(idx % 8) + 1}-10T08:00:00.000Z`,
  };
});

// Generate investmentGrowth.json (24 months)
const investmentGrowth = [];
const months = [
  "2024-01", "2024-02", "2024-03", "2024-04", "2024-05", "2024-06",
  "2024-07", "2024-08", "2024-09", "2024-10", "2024-11", "2024-12",
  "2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06",
  "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12"
];

let baseInv = 12000;
months.forEach((m, idx) => {
  let delta = 850 + (idx * 210);
  if (idx === 5) delta = -1400;
  if (idx === 11) delta = -2100;
  if (idx === 18) delta = -1800;

  baseInv += delta;
  investmentGrowth.push({
    month: m,
    totalInvestment: baseInv,
    dealCount: Math.floor(18 + idx * 2.5),
    newInvestors: Math.floor(5 + ((idx * 7) % 12)),
  });
});

// Generate industryDistribution.json
const allInds = Array.from(new Set(deals.map((d) => d.industry)));
const industryDistribution = allInds.map((ind) => {
  const indDeals = deals.filter((d) => d.industry === ind);
  const dealCount = indDeals.length;
  const totalValue = indDeals.reduce((sum, d) => sum + d.dealSize, 0);
  const avgROI = parseFloat((indDeals.reduce((sum, d) => sum + d.expectedROI, 0) / dealCount).toFixed(1));
  const avgRisk = parseFloat((indDeals.reduce((sum, d) => sum + (d.riskLevel === "High" ? 3 : d.riskLevel === "Medium" ? 2 : 1), 0) / dealCount).toFixed(1));

  return {
    industry: ind,
    dealCount,
    totalValue,
    avgROI,
    avgRisk,
  };
});

// Generate corporateAnalytics.json
const totalFundingRaised = deals.reduce((sum, d) => sum + d.fundingRaised, 0);
const totalInvestors = deals.reduce((sum, d) => sum + d.investorCount, 0);
const totalTarget = deals.reduce((sum, d) => sum + d.dealSize, 0);
const conversionRate = parseFloat(((totalFundingRaised / totalTarget) * 100).toFixed(1));

const sortedDealsByFunding = [...deals].sort((a, b) => b.fundingRaised - a.fundingRaised);
const topDeals = sortedDealsByFunding.slice(0, 5).map((d) => d.id);

const monthlyTrends = months.slice(12, 24).map((m, idx) => ({
  month: m,
  fundingRaised: Math.floor(3500 + idx * 850 + ((idx * 310) % 1200)),
  investorInquiries: Math.floor(45 + idx * 8),
  dealsConverted: Math.floor(3 + ((idx * 2) % 6)),
}));

const corporateAnalytics = {
  summary: {
    totalFundingRaised,
    totalInvestors,
    conversionRate,
    avgDealClosureDays: 42,
  },
  monthlyTrends,
  topDeals,
};

// Generate userProfile.json
const userProfile = {
  id: "inv-001",
  name: "Shubham Kumar",
  riskAppetite: "Medium",
  budgetRange: { min: 25, max: 500 },
  preferredIndustries: ["Roads", "Bridges", "EV/CleanEnergy", "Fintech", "SaaS"],
  interests: ["deal-001", "deal-004", "deal-012", "deal-018", "deal-025"],
  watchlist: ["deal-001", "deal-004", "deal-012"],
};

// Write files to src/data/
const dataDir = path.join(process.cwd(), "src/data");
fs.writeFileSync(path.join(dataDir, "deals.json"), JSON.stringify(deals, null, 2));
fs.writeFileSync(path.join(dataDir, "investors.json"), JSON.stringify(investors, null, 2));
fs.writeFileSync(path.join(dataDir, "investmentGrowth.json"), JSON.stringify(investmentGrowth, null, 2));
fs.writeFileSync(path.join(dataDir, "industryDistribution.json"), JSON.stringify(industryDistribution, null, 2));
fs.writeFileSync(path.join(dataDir, "corporateAnalytics.json"), JSON.stringify(corporateAnalytics, null, 2));
fs.writeFileSync(path.join(dataDir, "userProfile.json"), JSON.stringify(userProfile, null, 2));

console.log("SUCCESS — Generated all 6 datasets cleanly in src/data/");
