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

const RISKS = ["Low", "Medium", "High"];
const APP_STAGES = ["Planning", "Approved", "In Progress", "Expansion"];

const CITIES = [
  "Mumbai, MH",
  "Bengaluru, KA",
  "Delhi, DL",
  "Hyderabad, TS",
  "Ahmedabad, GJ",
  "Chennai, TN",
  "Pune, MH",
  "Kolkata, WB",
  "Jaipur, RJ",
  "Surat, GJ",
  "Lucknow, UP",
  "Nagpur, MH",
  "Bhopal, MP",
  "Visakhapatnam, AP",
  "Patna, BR",
];

const COMPANIES = [
  "Larsen & Toubro Infra",
  "GMR Infrastructure",
  "Tata Projects",
  "Adani Ports & SEZ",
  "Dilip Buildcon",
  "IRB Infrastructure",
  "NCC Limited",
  "Afcons Infrastructure",
  "J. Kumar Infraprojects",
  "Ashoka Buildcon",
  "Gayatri Projects",
  "Patel Engineering",
  "KNR Constructions",
  "PNC Infratech",
  "HG Infra Engineering",
  "Sadbhav Engineering",
  "Simplex Infrastructures",
  "Megha Engineering",
  "Hindustan Construction Co",
  "Shapoorji Pallonji Infra",
];

const INVESTOR_NAMES = [
  "Shubham Kumar",
  "Ananya Sharma",
  "Rajesh Singhania",
  "Nexus Bharat Ventures",
  "Vikas Malpani",
  "Kaveri Family Office",
  "Peak Capital India",
  "Sunil Munjal",
  "Rohan Mehta",
  "Matrix India Partners",
  "Pooja Agarwal",
  "Arjun Deshmukh",
  "Zenith Corporate Fund",
  "Kabir Capital",
  "Vikramaditya Rao",
];

// 24 consecutive months (2024-01 to 2025-12)
const MONTHS_24 = Array.from({ length: 24 }, (_, i) => {
  const y = 2024 + Math.floor(i / 12);
  const m = String((i % 12) + 1).padStart(2, "0");
  return `${y}-${m}`;
});

// Helper to generate a compliant 24-point growth curve
function generateGrowthCurve(startMin, startMax, endMin, endMax, dipIndices) {
  for (let attempt = 0; attempt < 1000; attempt++) {
    const v0 = Number((startMin + Math.random() * (startMax - startMin)).toFixed(2));
    const targetEnd = endMin + Math.random() * (endMax - endMin);

    const [d1, d2, d3] = dipIndices;
    const dips = new Set([d1, d2, d3]);
    const recs = new Set([d1 + 1, d2 + 1, d3 + 1]);

    const curve = [{ month: MONTHS_24[0], value: v0 }];
    let valid = true;

    // Estimate base normal rate
    const neededRatio = targetEnd / (v0 * 1.03);
    const avgNormRate = Math.min(0.12, Math.max(0.08, Math.pow(Math.max(1.01, neededRatio), 1 / 17) - 1));

    for (let i = 1; i < 24; i++) {
      const prev = curve[i - 1].value;
      let nextVal;

      if (dips.has(i)) {
        const dipRate = -0.14 - Math.random() * 0.02; // -14% to -16%
        nextVal = Number((prev * (1 + dipRate)).toFixed(2));
        let actualRate = (nextVal - prev) / prev;
        if (actualRate < -0.17 || actualRate > -0.13) {
          nextVal = Number((prev * 0.85).toFixed(2));
        }
      } else if (recs.has(i)) {
        const recRate = 0.17 + Math.random() * 0.02; // +17% to +19%
        nextVal = Number((prev * (1 + recRate)).toFixed(2));
        let actualRate = (nextVal - prev) / prev;
        if (actualRate < 0.16 || actualRate > 0.20) {
          nextVal = Number((prev * 1.18).toFixed(2));
        }
      } else {
        const normRate = Math.min(0.12, Math.max(0.08, avgNormRate + (Math.random() * 0.01 - 0.005)));
        nextVal = Number((prev * (1 + normRate)).toFixed(2));
        let actualRate = (nextVal - prev) / prev;
        if (actualRate < 0.08 || actualRate > 0.12) {
          nextVal = Number((prev * 1.10).toFixed(2));
        }
      }

      const stepChange = (nextVal - prev) / prev;
      if (Math.abs(stepChange) > 0.35) {
        valid = false;
        break;
      }

      curve.push({ month: MONTHS_24[i], value: nextVal });
    }

    if (!valid) continue;

    const endVal = curve[23].value;
    if (endVal < endMin || endVal > endMax) continue;

    // Verify all transition constraints
    let allOk = true;
    for (let i = 1; i < 24; i++) {
      const ch = (curve[i].value - curve[i - 1].value) / curve[i - 1].value;
      if (dips.has(i)) {
        if (ch < -0.17 - 1e-4 || ch > -0.13 + 1e-4) allOk = false;
      } else if (recs.has(i)) {
        if (ch < 0.16 - 1e-4 || ch > 0.20 + 1e-4) allOk = false;
      } else {
        if (ch < 0.08 - 1e-4 || ch > 0.12 + 1e-4) allOk = false;
      }
    }

    if (allOk) return curve;
  }

  throw new Error("Failed to generate growth curve within constraints");
}

function generateSingleAttempt() {
  // 1. Generate File 1: investmentGrowth.json
  const file1DipIndices = [4, 11, 18];
  const investmentGrowth = generateGrowthCurve(2.35, 2.55, 16.0, 19.5, file1DipIndices);

  // 2. Setup 80 deals
  // We need:
  // Industry counts: Roads:20, Metro:16, Railway:10, Solar:9, Bridges:7, Smart City:6, Water:5, Ports:4, Airports:3
  // Risk counts: Low:25 (24 non-outlier, 1 outlier), Medium:35 (34 non-outlier, 1 outlier), High:20 (18 non-outlier, 2 outlier)
  // Revenue pattern: Growing:48 (60%), Flat:20 (25%), Declining:12 (15%)
  // Declining deals: at least 60% (e.g. 8/12) High risk, 3 Medium, 1 Low

  const industryPool = [];
  const indCounts = {
    Roads: 20,
    Metro: 16,
    Railway: 10,
    Solar: 9,
    Bridges: 7,
    "Smart City": 6,
    Water: 5,
    Ports: 4,
    Airports: 3,
  };

  for (const [ind, cnt] of Object.entries(indCounts)) {
    for (let c = 0; c < cnt; c++) industryPool.push(ind);
  }

  // Define 80 deal slots with configured properties
  // Low: indices 0..24
  // Medium: indices 25..59
  // High: indices 60..79
  const dealConfigs = [];

  // Low (25 deals): 1 outlier (idx 0), 24 non-outliers (idx 1..24).
  // Patterns: 1 declining, 5 flat, 19 growing
  for (let i = 0; i < 25; i++) {
    let revPattern = "growing";
    if (i === 0) revPattern = "declining";
    else if (i >= 1 && i <= 5) revPattern = "flat";
    dealConfigs.push({
      riskLevel: "Low",
      isOutlier: i === 0,
      revenuePattern: revPattern,
    });
  }

  // Medium (35 deals): 1 outlier (idx 0 -> global 25), 34 non-outliers.
  // Patterns: 3 declining, 11 flat, 21 growing
  for (let i = 0; i < 35; i++) {
    let revPattern = "growing";
    if (i >= 0 && i <= 2) revPattern = "declining";
    else if (i >= 3 && i <= 13) revPattern = "flat";
    dealConfigs.push({
      riskLevel: "Medium",
      isOutlier: i === 0,
      revenuePattern: revPattern,
    });
  }

  // High (20 deals): 2 outliers (idx 0, 1 -> global 60, 61), 18 non-outliers.
  // Patterns: 8 declining, 4 flat, 8 growing
  // Out of 12 total declining deals: 8 are High (8/12 = 66.7% >= 60%), 3 Med, 1 Low!
  for (let i = 0; i < 20; i++) {
    let revPattern = "growing";
    if (i >= 0 && i <= 7) revPattern = "declining";
    else if (i >= 8 && i <= 11) revPattern = "flat";
    dealConfigs.push({
      riskLevel: "High",
      isOutlier: i === 0 || i === 1,
      revenuePattern: revPattern,
    });
  }

  const projectDescriptors = [
    "Expressway Corridor", "Metro Phase 2", "High-Speed Rail Link", "Solar Mega-Park", "Cable-Stayed Bridge",
    "Smart Grid Urban Core", "Water Treatment Plant", "Deepwater Container Terminal", "International Terminal 3",
    "Trans-Harbour Link", "Renewable Energy Grid", "Elevated Metro Ring", "Freight Bypass Expressway", "Desalination Facility",
    "Integrated Logistics Park", "Outer Ring Expressway", "Suburban Rail Modernization", "Ultra-Mega Solar Complex", "River Bridge Span",
    "Smart Drainage Network", "Bulk Cargo Port Basin", "Greenfield Aerodrome", "Coastal Highway Extension", "Industrial Water Pipeline",
    "Rapid Transit Flyover", "Solar-Wind Hybrid Farm", "Rail Overbridge Junction", "Intelligent Traffic Corridor", "Automated Port Yard",
    "Runway Expansion Project", "High-Density Highway Section", "Monorail Feeder Route", "Dedicated Freight Corridor", "Floating Solar Array",
    "Twin-Tube Tunnel Road", "IoT Water Metering System", "LNG Import Terminal", "Heliport Regional Hub", "Smart City Surveillance Hub",
    "Multi-Modal Transit Interchange", "National Highway Widening", "Underground Metro Reach", "Electrified Rail Corridor", "Rooftop Solar Cluster",
    "Suspension Bridge Overpass", "Urban Flood Mitigation", "Container Freight Station", "Cargo Airport Apron", "Smart Highway Tollway",
    "Metro Depot & Yard", "Railway Station Redevelopment", "Agri-Solar Park Network", "Viaduct Roadway Extension", "Riverfront Promenade Infra",
    "Maritime Shipyard Basin", "Aerocity Commercial Transit", "Expressway Bypass Section", "Light Rail Transit Line", "Signaling Modernization Project",
    "Canal-Top Solar Grid", "Arch Bridge Crossing", "Smart Solid Waste Plant", "Deep-Draft Port Berth", "Air Cargo Terminal Complex",
    "Industrial Corridor Highway", "Airport Express Metro", "Intercity Track Quadrupling", "Microgrid Solar Storage", "Steel Bridge Span",
    "Smart Water Distribution", "Bulk Liquid Terminal", "Aviation Maintenance Hub", "Urban Expressway Tunnel", "Metro Commuter Line",
    "Automated Rail Freight Yard", "Decentralized Solar Hub", "Bascule Bridge Overpass", "Smart City Command Center", "Port Breakwater Extension", "Aero Logistics Parkway"
  ];

  const deals = [];
  let lowRoiIdx = 0;
  let medRoiIdx = 0;
  let highRoiIdx = 0;

  for (let i = 0; i < 80; i++) {
    const id = `deal-${String(i + 1).padStart(3, "0")}`;
    const cfg = dealConfigs[i];
    const industry = industryPool[i];
    const company = COMPANIES[i % COMPANIES.length];
    const projectName = `${company.split(" ")[0]} ${projectDescriptors[i]}`;
    const location = CITIES[i % CITIES.length];
    const stage = APP_STAGES[i % APP_STAGES.length];

    const riskLevel = cfg.riskLevel;
    const isOutlier = cfg.isOutlier;

    let roi;
    if (isOutlier) {
      if (riskLevel === "Low") roi = 31.5;
      else if (riskLevel === "Medium") roi = 8.5;
      else if (riskLevel === "High") roi = i === 60 ? 16.5 : 18.0;
    } else {
      if (riskLevel === "Low") {
        roi = Number((8.2 + (lowRoiIdx / 24) * 6.5).toFixed(1));
        lowRoiIdx++;
      } else if (riskLevel === "Medium") {
        roi = Number((14.5 + (medRoiIdx / 34) * 13.0).toFixed(1));
        medRoiIdx++;
      } else {
        roi = Number((25.5 + (highRoiIdx / 18) * 19.0).toFixed(1));
        highRoiIdx++;
      }
    }

    // dealSize spanning 8-12x
    // Pin deal-001 at 12.0 Cr, deal-080 at 120.0 Cr (10x span)
    // Distribute deal sizes uniformly across indices so every industry gets a balanced mix
    let dealSize;
    if (i === 0) dealSize = 12.0;
    else if (i === 79) dealSize = 120.0;
    else {
      dealSize = Number((20.0 + ((i * 17) % 85) + (i % 7) * 1.5).toFixed(1));
    }

    const minInvestment = Number(Math.max(0.5, Math.min(dealSize * 0.04, 4.5)).toFixed(1));
    const maxInvestment = Number(Math.max(minInvestment + 1.0, Math.min(dealSize * 0.28, dealSize - 1.0)).toFixed(1));
    const fundingTarget = dealSize;

    // fundingRaised roughly 45-55% of target to keep industry totals strictly proportional to deal counts
    const raisedFactor = 0.45 + ((i * 13) % 20) * 0.005; // 0.45 to 0.545
    const fundingRaised = Number((dealSize * raisedFactor).toFixed(1));

    const baseDate = new Date("2025-01-05T08:00:00.000Z");
    baseDate.setUTCDate(baseDate.getUTCDate() + i * 5);
    const createdAt = baseDate.toISOString();

    const description = `The ${projectName} project deploys state-of-the-art 3D point-cloud monitoring to ensure high-fidelity structural inspection and milestone tracking.`;

    const revenuePattern = cfg.revenuePattern;
    const baseRev2023 = Number((12.0 + i * 2.1).toFixed(1)); // All 80 unique
    let rev2024, rev2025, growthRate;

    if (revenuePattern === "growing") {
      const g1 = 0.20 + (i % 20) * 0.01;
      const g2 = 0.20 + ((i + 5) % 20) * 0.01;
      rev2024 = Number((baseRev2023 * (1 + g1)).toFixed(1));
      rev2025 = Number((rev2024 * (1 + g2)).toFixed(1));
      growthRate = Number(((g1 + g2) * 50).toFixed(1));
    } else if (revenuePattern === "flat") {
      const g1 = -0.04 + (i % 8) * 0.01;
      const g2 = -0.03 + ((i + 2) % 7) * 0.01;
      rev2024 = Number((baseRev2023 * (1 + g1)).toFixed(1));
      rev2025 = Number((rev2024 * (1 + g2)).toFixed(1));
      growthRate = Number(((g1 + g2) * 50).toFixed(1));
    } else {
      const g1 = -0.25 + (i % 10) * 0.01;
      const g2 = -0.24 + ((i + 3) % 10) * 0.01;
      rev2024 = Number((baseRev2023 * (1 + g1)).toFixed(1));
      rev2025 = Number((rev2024 * (1 + g2)).toFixed(1));
      growthRate = Number(((g1 + g2) * 50).toFixed(1));
    }

    const profitMargin = Number((8.5 + ((i * 1.7) % 19.0)).toFixed(1));
    const debtEquityRatio = Number((0.3 + ((i * 0.13) % 1.4)).toFixed(1));

    const financials = {
      revenue3y: [
        { year: 2023, revenue: baseRev2023 },
        { year: 2024, revenue: rev2024 },
        { year: 2025, revenue: rev2025 },
      ],
      profitMargin,
      growthRate,
      debtEquityRatio,
    };

    // ROI Projections
    const personalityType = i % 3;
    const roiProjections = [];

    let p0;
    if (personalityType === 0) {
      p0 = Number((roi * 1.15).toFixed(1));
      const p1 = Number((p0 * 1.20).toFixed(1));
      const p2 = Number((p1 * 1.12).toFixed(1));
      const p3 = Number((p2 * 1.06).toFixed(1));
      const p4 = Number((p3 * 1.03).toFixed(1));
      roiProjections.push({ year: 2026, projected: p0 });
      roiProjections.push({ year: 2027, projected: p1 });
      roiProjections.push({ year: 2028, projected: p2 });
      roiProjections.push({ year: 2029, projected: p3 });
      roiProjections.push({ year: 2030, projected: p4 });
    } else if (personalityType === 1) {
      p0 = Number((roi * 1.00).toFixed(1));
      const p1 = Number((p0 * 1.10).toFixed(1));
      const p2 = Number((p1 * 1.10).toFixed(1));
      const p3 = Number((p2 * 1.10).toFixed(1));
      const p4 = Number((p3 * 1.10).toFixed(1));
      roiProjections.push({ year: 2026, projected: p0 });
      roiProjections.push({ year: 2027, projected: p1 });
      roiProjections.push({ year: 2028, projected: p2 });
      roiProjections.push({ year: 2029, projected: p3 });
      roiProjections.push({ year: 2030, projected: p4 });
    } else {
      p0 = Number((roi * 0.85).toFixed(1));
      const p1 = Number((p0 * 1.05).toFixed(1));
      const p2 = Number((p1 * 1.12).toFixed(1));
      const p3 = Number((p2 * 1.18).toFixed(1));
      const p4 = Number((p3 * 1.25).toFixed(1));
      roiProjections.push({ year: 2026, projected: p0 });
      roiProjections.push({ year: 2027, projected: p1 });
      roiProjections.push({ year: 2028, projected: p2 });
      roiProjections.push({ year: 2029, projected: p3 });
      roiProjections.push({ year: 2030, projected: p4 });
    }

    let prevGap = 0;
    for (let t = 0; t < 5; t++) {
      const proj = roiProjections[t].projected;
      let halfGap = Number((proj * (0.08 + t * 0.04) + (t + 1) * 0.8).toFixed(1));
      if (halfGap * 2 <= prevGap) {
        halfGap = Number((prevGap / 2 + 0.8).toFixed(1));
      }
      const conservative = Number(Math.max(1.0, proj - halfGap).toFixed(1));
      const optimistic = Number((proj + halfGap).toFixed(1));
      const actualGap = optimistic - conservative;
      prevGap = actualGap;

      roiProjections[t].conservative = conservative;
      roiProjections[t].optimistic = optimistic;
    }

    const investorCount = 4 + ((i * 3) % 35);

    deals.push({
      id,
      projectName,
      company,
      industry,
      riskLevel,
      roi,
      isOutlier,
      dealSize,
      minInvestment,
      maxInvestment,
      fundingTarget,
      fundingRaised,
      stage,
      location,
      createdAt,
      description,
      revenuePattern,
      financials,
      roiProjections,
      investorCount,
    });
  }

  // 3. File 2: industryDistribution.json
  const industryDistribution = INDUSTRIES.map((ind) => {
    const totalRaised = deals
      .filter((d) => d.industry === ind)
      .reduce((s, d) => s + d.fundingRaised, 0);
    return {
      industry: ind,
      value: Number(totalRaised.toFixed(1)),
    };
  });

  // 4. File 4: investors.json
  // All 15 distinct dip patterns with non-consecutive dips and third-spread
  const investorDipPatterns = [
    [4, 11, 18], // inv-001
    [2, 9, 17],
    [3, 10, 19],
    [5, 12, 17],
    [6, 13, 20],
    [1, 8, 21],
    [3, 14, 17],
    [4, 9, 22],
    [2, 12, 18],
    [5, 10, 19],
    [6, 13, 16],
    [1, 11, 20],
    [3, 8, 21],
    [4, 13, 17],
    [2, 14, 22],
  ];

  const investorStarts = [2.45, 1.2, 1.8, 2.8, 3.5, 4.2, 0.9, 1.5, 2.2, 3.0, 3.8, 4.5, 1.0, 2.5, 3.2];
  const investorEnds = [17.5, 8.5, 12.0, 18.5, 23.0, 27.5, 6.5, 10.0, 14.5, 19.5, 24.5, 29.0, 7.0, 16.0, 21.0];

  const investors = INVESTOR_NAMES.map((name, idx) => {
    const isFirst = idx === 0;
    const id = `inv-${String(idx + 1).padStart(3, "0")}`;
    const budget = isFirst ? 25.0 : Number((10.0 + idx * 3.5).toFixed(1));
    const preferredIndustries = [
      INDUSTRIES[idx % 9],
      INDUSTRIES[(idx + 3) % 9],
      INDUSTRIES[(idx + 6) % 9],
    ];
    const riskAppetite = RISKS[idx % RISKS.length];
    const portfolioValue = Number((budget * 0.85).toFixed(1));
    const activeDeals = 3 + (idx % 7);

    let growth;
    if (isFirst) {
      growth = JSON.parse(JSON.stringify(investmentGrowth));
    } else {
      const s = investorStarts[idx];
      const e = investorEnds[idx];
      growth = generateGrowthCurve(s * 0.95, s * 1.05, e * 0.95, e * 1.05, investorDipPatterns[idx]);
    }

    return {
      id,
      name,
      budget,
      preferredIndustries,
      riskAppetite,
      portfolioValue,
      activeDeals,
      investmentGrowth: growth,
    };
  });

  // 5. File 5: corporateAnalytics.json
  const totalFundingRaised = Number(deals.reduce((s, d) => s + d.fundingRaised, 0).toFixed(1));
  const analyticsMonths = Array.from({ length: 12 }, (_, i) => `2025-${String(i + 1).padStart(2, "0")}`);

  let baseMonthlyFund = 45.0;
  const monthlyTrends = [];
  let sumConvRates = 0;

  for (let i = 0; i < 12; i++) {
    const month = analyticsMonths[i];
    if (i > 0) {
      baseMonthlyFund = baseMonthlyFund * (1 + 0.045); // +4.5% MoM
    }
    const isQ4 = i >= 9;
    const fundingRaised = Number((isQ4 ? baseMonthlyFund * 1.4 : baseMonthlyFund).toFixed(1));

    const dealsConverted = 8 + (i % 6);
    const inquiriesRatio = 10.5 + ((i * 3) % 4) * 0.5;
    const investorInquiries = Math.round(dealsConverted * inquiriesRatio);
    const conversionRate = Number(((dealsConverted / investorInquiries) * 100).toFixed(1));
    sumConvRates += conversionRate;

    monthlyTrends.push({
      month,
      fundingRaised,
      investorInquiries,
      dealsConverted,
      conversionRate,
    });
  }

  const avgConversionRate = Number((sumConvRates / 12).toFixed(1));
  const corporateAnalytics = {
    totalFundingRaised,
    investorCount: 1250,
    avgConversionRate,
    monthlyTrends,
  };

  return {
    investmentGrowth,
    industryDistribution,
    deals,
    investors,
    corporateAnalytics,
  };
}

function runGenerationLoop() {
  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      const data = generateSingleAttempt();
      fs.writeFileSync(path.join(dataDir, "investmentGrowth.json"), JSON.stringify(data.investmentGrowth, null, 2));
      fs.writeFileSync(path.join(dataDir, "industryDistribution.json"), JSON.stringify(data.industryDistribution, null, 2));
      fs.writeFileSync(path.join(dataDir, "deals.json"), JSON.stringify(data.deals, null, 2));
      fs.writeFileSync(path.join(dataDir, "investors.json"), JSON.stringify(data.investors, null, 2));
      fs.writeFileSync(path.join(dataDir, "corporateAnalytics.json"), JSON.stringify(data.corporateAnalytics, null, 2));

      console.log(`SUCCESS: Generated chart data files in src/data/ (Attempt ${attempt})`);
      return;
    } catch (e) {
      console.warn(`Attempt ${attempt} failed: ${e.message}`);
    }
  }
  console.error("FAILED to generate valid chart data within 10 attempts");
  process.exit(1);
}

runGenerationLoop();
