// One-time script to generate infrastructure-themed mock data
// Run: node src/data/generate-data.js

const fs = require("fs");
const path = require("path");

const INDUSTRIES = ["Roads", "Bridges", "Railway", "Metro", "Solar", "Smart City"];
const RISKS = ["Low", "Medium", "High"];
const STAGES = ["Planning", "Approved", "In Progress", "Expansion"];
const LOCATIONS = [
  "Pune, MH", "Mumbai, MH", "Nagpur, MH", "Hyderabad, TS", "Bengaluru, KA",
  "Chennai, TN", "Ahmedabad, GJ", "Jaipur, RJ", "Lucknow, UP", "Bhubaneswar, OD",
];

const PROJECT_TEMPLATES = {
  Roads: ["NH-{n} Widening Project", "{c} Ring Road Phase {p}", "{c} Expressway Corridor", "State Highway {n} Upgrade"],
  Bridges: ["{r} River Bridge Project", "{c} Flyover Network", "Cable-Stayed Bridge {c}", "{c} Sea Link Extension"],
  Railway: ["{c} Railway Corridor Doubling", "Freight Corridor {c} Section", "{c} Station Redevelopment", "High-Speed Rail {c} Segment"],
  Metro: ["{c} Metro Phase {p} Extension", "{c} Metro Line {n}", "{c} Neo Metro Project", "{c} Metro Depot Development"],
  Solar: ["{c} Solar Park {n}MW", "Rooftop Solar Program {c}", "{c} Floating Solar Plant", "Solar Corridor {c}"],
  "Smart City": ["{c} Smart Traffic System", "{c} Integrated Command Centre", "{c} Smart Water Grid", "{c} Digital Infrastructure Hub"],
};

const RIVERS = ["Godavari", "Krishna", "Mula-Mutha", "Narmada", "Tapi", "Mahanadi"];
const COMPANIES = [
  "BharatInfra Ltd", "Deccan Constructions", "Sahyadri Projects", "IndiaBuild Corp",
  "Trident Infrastructure", "Vajra Engineering", "NextGen Infra", "Ashoka Devcon",
  "Peninsula Projects", "Kaveri Structures",
];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const round = (n, d = 1) => Math.round(n * 10 ** d) / 10 ** d;

function makeProjectName(industry) {
  let t = rand(PROJECT_TEMPLATES[industry]);
  return t
    .replace("{n}", randInt(4, 66))
    .replace("{p}", randInt(1, 4))
    .replace("{c}", rand(LOCATIONS).split(",")[0])
    .replace("{r}", rand(RIVERS));
}

function makeRoiProjections(baseRoi) {
  return Array.from({ length: 5 }, (_, i) => ({
    year: 2026 + i,
    projectedRoi: round(baseRoi * (0.6 + i * 0.18) + Math.random() * 2),
  }));
}

function makeGrowthHistory() {
  let value = randInt(50, 200);
  return Array.from({ length: 12 }, (_, i) => {
    value = round(value * (1 + (Math.random() * 0.08 - 0.01)), 0);
    return { month: `2025-${String(i + 1).padStart(2, "0")}`, value };
  });
}

// ---- Deals ----
const deals = Array.from({ length: 80 }, (_, i) => {
  const industry = rand(INDUSTRIES);
  const riskLevel = rand(RISKS);
  const roiBase = { Low: [8, 14], Medium: [12, 20], High: [18, 32] }[riskLevel];
  const roi = round(randInt(roiBase[0] * 10, roiBase[1] * 10) / 10);
  const fundingTarget = randInt(20, 500) * 10;
  const fundingRaised = Math.floor(fundingTarget * (Math.random() * 0.85 + 0.05));
  const minInvestment = randInt(5, 50) * 5;

  return {
    id: `deal-${String(i + 1).padStart(3, "0")}`,
    projectName: makeProjectName(industry),
    company: rand(COMPANIES),
    industry,
    riskLevel,
    roi,
    minInvestment,
    maxInvestment: minInvestment * randInt(4, 12),
    fundingTarget,
    fundingRaised,
    stage: rand(STAGES),
    location: rand(LOCATIONS),
    createdAt: `2025-${String(randInt(1, 12)).padStart(2, "0")}-${String(randInt(1, 28)).padStart(2, "0")}`,
    description:
      `${industry} infrastructure project executed with 3D point cloud monitoring, ` +
      `drone-based progress tracking, and milestone-linked disbursement.`,
    financials: {
      revenue: randInt(100, 2000),
      profitMargin: round(randInt(80, 280) / 10),
      growthRate: round(randInt(40, 350) / 10),
      debtEquityRatio: round(randInt(2, 18) / 10),
    },
    roiProjections: makeRoiProjections(roi),
    investorCount: randInt(2, 40),
  };
});

// ---- Investors ----
const FIRST = ["Arjun", "Priya", "Rohan", "Sneha", "Vikram", "Ananya", "Karan", "Meera", "Aditya", "Ishita", "Rahul", "Divya", "Sameer", "Neha", "Amit"];
const LAST = ["Sharma", "Patel", "Deshmukh", "Iyer", "Kulkarni", "Reddy", "Mehta", "Joshi", "Nair", "Chopra"];

const investors = Array.from({ length: 15 }, (_, i) => {
  const preferred = [...INDUSTRIES].sort(() => 0.5 - Math.random()).slice(0, randInt(2, 3));
  return {
    id: `inv-${String(i + 1).padStart(3, "0")}`,
    name: i === 0 ? "Meera Nair" : `${rand(FIRST)} ${rand(LAST)}`,
    budget: i === 0 ? 950 : randInt(20, 400) * 5,
    preferredIndustries: i === 0 ? ["Solar", "Roads", "Bridges"] : preferred,
    riskAppetite: i === 0 ? "Low" : rand(RISKS),
    portfolioValue: randInt(100, 5000),
    activeDeals: randInt(1, 12),
    investmentGrowth: makeGrowthHistory(),
  };
});

const dealsPath = path.join(__dirname, "deals.json");
const investorsPath = path.join(__dirname, "investors.json");

fs.writeFileSync(dealsPath, JSON.stringify(deals, null, 2));
fs.writeFileSync(investorsPath, JSON.stringify(investors, null, 2));
console.log(`Generated ${deals.length} deals, ${investors.length} investors`);
