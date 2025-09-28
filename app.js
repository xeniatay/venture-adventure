const INITIAL_CAPITAL = 100000;
const YEARS = Array.from({ length: 11 }, (_, index) => 2015 + index);

const assetClasses = [
  {
    id: "publicMarkets",
    name: "Public Markets (S&P 500)",
    category: "Public Markets",
    retailRestricted: false,
    returns: [0.012, 0.109, 0.195, -0.062, 0.288, 0.166, 0.268, -0.186, 0.158, 0.246, 0.07],
    education: {
      range: "Annualized 6%–12% over the decade",
      risk: "High liquidity, moderate drawdowns",
      access: "ETFs, index funds, and brokerage accounts"
    }
  },
  {
    id: "privateEquity",
    name: "Private Equity",
    category: "Private Markets",
    retailRestricted: true,
    returns: [0.09, 0.12, 0.17, 0.08, 0.21, 0.18, 0.19, 0.05, 0.13, 0.16, 0.12],
    education: {
      range: "8%–18% net of fees across vintages",
      risk: "Illiquid for 7–10 years, cash flow timing risk",
      access: "Typically institutional or accredited investors"
    }
  },
  {
    id: "realEstate",
    name: "Real Estate (NCREIF ODCE)",
    category: "Real Assets",
    retailRestricted: false,
    returns: [0.128, 0.086, 0.071, 0.069, 0.062, 0.01, 0.024, 0.112, 0.083, 0.058, 0.05],
    education: {
      range: "6%–10% yield + appreciation",
      risk: "Cyclical, sensitive to rates, moderate liquidity",
      access: "REITs for retail; private funds for institutions"
    }
  },
  {
    id: "privateCredit",
    name: "Private Credit",
    category: "Private Markets",
    retailRestricted: false,
    returns: [0.08, 0.085, 0.088, 0.082, 0.079, 0.075, 0.082, 0.091, 0.094, 0.098, 0.09],
    education: {
      range: "7%–10% floating yield",
      risk: "Credit defaults, limited liquidity, rate sensitivity",
      access: "Interval funds and BDCs offer partial retail access"
    }
  },
  {
    id: "vcMedian",
    name: "Venture Capital (Median Fund)",
    category: "Venture Capital",
    retailRestricted: true,
    returns: [0.07, 0.09, 0.12, 0.02, 0.16, 0.11, 0.14, -0.02, 0.10, 0.13, 0.09],
    education: {
      range: "Long-term 10%–15% with high dispersion",
      risk: "High failure rate, illiquidity, capital calls",
      access: "Limited to accredited investors and fund-of-funds"
    }
  },
  {
    id: "vcTopDecile",
    name: "Venture Capital (Top-Decile)",
    category: "Venture Capital",
    retailRestricted: true,
    returns: [0.18, 0.22, 0.29, 0.08, 0.37, 0.31, 0.35, 0.12, 0.28, 0.32, 0.24],
    education: {
      range: "Top funds can deliver 25%+ IRR",
      risk: "Power-law outcomes, long time-to-liquidity",
      access: "Elite institutional LPs and top-tier fund managers"
    }
  },
  {
    id: "cash",
    name: "Cash / Risk-Free",
    category: "Cash Equivalent",
    retailRestricted: false,
    returns: [0.004, 0.006, 0.018, 0.021, 0.017, 0.009, 0.003, 0.008, 0.024, 0.035, 0.031],
    education: {
      range: "0%–3% short-term yields",
      risk: "Minimal risk, inflation drag",
      access: "Savings accounts, money market funds, T-bills"
    }
  }
];

const defaultAllocations = {
  publicMarkets: 35,
  privateEquity: 15,
  realEstate: 15,
  privateCredit: 15,
  vcMedian: 10,
  vcTopDecile: 5,
  cash: 5
};

const palette = {
  player: "#1f7aec",
  equalWeight: "#243b53",
  publicOnly: "#ef8354",
  ventureTop: "#8d6cab"
};

const allocationState = { ...defaultAllocations };
let institutionalSnapshot = null;

const allocationListEl = document.getElementById("allocationList");
const totalAllocationEl = document.getElementById("totalAllocation");
const allocationWarningEl = document.getElementById("allocationWarning");
const simulateBtn = document.getElementById("simulateBtn");
const tryAgainBtn = document.getElementById("tryAgainBtn");
const retailToggle = document.getElementById("retailToggle");
const playerNameInput = document.getElementById("playerName");
const datasetInput = document.getElementById("datasetInput");
const resetDatasetBtn = document.getElementById("resetDatasetBtn");
const datasetStatusEl = document.getElementById("datasetStatus");

const resultsPanel = document.getElementById("resultsPanel");
const finalValueEl = document.getElementById("finalValue");
const cagrValueEl = document.getElementById("cagrValue");
const percentileValueEl = document.getElementById("percentileValue");
const breakdownListEl = document.getElementById("breakdownList");
const comparisonListEl = document.getElementById("comparisonList");
const leaderboardListEl = document.getElementById("leaderboardList");

const defaultReturnSeries = assetClasses.reduce((map, asset) => {
  map[asset.id] = [...asset.returns];
  return map;
}, {});

renderAllocationCards();
updateTotals();
updateLeaderboardDisplay();

simulateBtn.addEventListener("click", () => {
  const result = runSimulation();
  const benchmarks = buildBenchmarks();
  renderResults(result, benchmarks);
  persistResult(result);
  updateLeaderboardDisplay();
});

tryAgainBtn.addEventListener("click", () => {
  resultsPanel.classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

retailToggle.addEventListener("change", (event) => {
  const retailMode = event.target.checked;
  handleRetailMode(retailMode);
  updateTotals();
});

if (datasetInput) {
  datasetInput.addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }
    loadDatasetFromFile(file);
  });
}

if (resetDatasetBtn) {
  resetDatasetBtn.addEventListener("click", () => {
    resetDataset();
  });
}

function renderAllocationCards() {
  allocationListEl.innerHTML = "";
  assetClasses.forEach((asset) => {
    const card = document.createElement("article");
    card.className = "asset-card";
    card.dataset.assetId = asset.id;

    const title = document.createElement("header");
    const nameEl = document.createElement("h3");
    nameEl.textContent = asset.name;
    const typeEl = document.createElement("span");
    typeEl.className = "type";
    typeEl.textContent = asset.category;
    title.appendChild(nameEl);
    title.appendChild(typeEl);

    const sliderWrap = document.createElement("div");
    sliderWrap.className = "slider";

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = 0;
    slider.max = 100;
    slider.step = 1;
    slider.value = allocationState[asset.id] || 0;
    slider.dataset.assetId = asset.id;
    slider.setAttribute("aria-label", `${asset.name} allocation percentage`);

    const sliderInfo = document.createElement("div");
    sliderInfo.className = "range-info";
    const weightEl = document.createElement("span");
    weightEl.className = "weight";
    weightEl.textContent = `${slider.value}%`;
    sliderInfo.appendChild(weightEl);
    const hintEl = document.createElement("span");
    hintEl.textContent = "Adjust weight";
    sliderInfo.appendChild(hintEl);

    slider.addEventListener("input", (event) => {
      const value = Number(event.target.value);
      const id = event.target.dataset.assetId;
      allocationState[id] = value;
      weightEl.textContent = `${value}%`;
      updateTotals();
    });

    sliderWrap.appendChild(slider);
    sliderWrap.appendChild(sliderInfo);

    const infoBox = document.createElement("div");
    infoBox.className = "info";
    infoBox.innerHTML = `
      <strong>Return range:</strong> ${asset.education.range}<br>
      <strong>Risk:</strong> ${asset.education.risk}<br>
      <strong>Access:</strong> ${asset.education.access}
    `;

    card.appendChild(title);
    card.appendChild(sliderWrap);
    card.appendChild(infoBox);

    allocationListEl.appendChild(card);
  });
}

function updateTotals() {
  const total = Object.values(allocationState).reduce((sum, value) => sum + Number(value || 0), 0);
  totalAllocationEl.textContent = `${total}%`;
  if (Math.abs(total - 100) > 0.01 || total === 0) {
    simulateBtn.disabled = true;
    allocationWarningEl.classList.add("visible");
  } else {
    simulateBtn.disabled = false;
    allocationWarningEl.classList.remove("visible");
  }
}

function runSimulation() {
  const timeline = YEARS.map((year) => ({ year, value: 0 }));
  const breakdown = [];

  assetClasses.forEach((asset) => {
    const weight = (allocationState[asset.id] || 0) / 100;
    if (weight <= 0) {
      return;
    }
    let value = INITIAL_CAPITAL * weight;
    const assetTimeline = [];
    asset.returns.forEach((annualReturn, index) => {
      value *= 1 + annualReturn;
      assetTimeline.push({ year: YEARS[index], value });
      timeline[index].value += value;
    });
    breakdown.push({
      id: asset.id,
      name: asset.name,
      finalValue: value,
      weight,
      timeline: assetTimeline
    });
  });

  const finalValue = timeline[timeline.length - 1]?.value ?? INITIAL_CAPITAL;
  const cagr = computeCagr(finalValue, INITIAL_CAPITAL, YEARS.length);

  return { timeline, breakdown, finalValue, cagr };
}

function buildBenchmarks() {
  const equalWeightAllocation = {};
  const equalWeight = 1 / assetClasses.length;
  assetClasses.forEach((asset) => {
    equalWeightAllocation[asset.id] = equalWeight;
  });

  const dataSets = [
    {
      id: "equalWeight",
      label: "Equal weight",
      color: palette.equalWeight,
      ...simulateCustom(equalWeightAllocation)
    },
    {
      id: "publicOnly",
      label: "100% Public Markets",
      color: palette.publicOnly,
      ...simulateCustom({ publicMarkets: 1 })
    },
    {
      id: "ventureTop",
      label: "100% VC Top-Decile",
      color: palette.ventureTop,
      ...simulateCustom({ vcTopDecile: 1 })
    }
  ];

  return dataSets;
}

function simulateCustom(weights) {
  const allocation = { ...weights };
  const timeline = YEARS.map((year) => ({ year, value: 0 }));

  assetClasses.forEach((asset) => {
    const weight = allocation[asset.id] || 0;
    if (weight <= 0) {
      return;
    }
    let value = INITIAL_CAPITAL * weight;
    asset.returns.forEach((annualReturn, index) => {
      value *= 1 + annualReturn;
      timeline[index].value += value;
    });
  });

  const finalValue = timeline[timeline.length - 1]?.value ?? INITIAL_CAPITAL;
  const cagr = computeCagr(finalValue, INITIAL_CAPITAL, YEARS.length);

  return { timeline, finalValue, cagr };
}

function renderResults(result, benchmarks) {
  finalValueEl.textContent = formatCurrency(result.finalValue);
  cagrValueEl.textContent = formatPercent(result.cagr);
  const projectedLeaderboard = [...getLeaderboard(), { finalValue: result.finalValue }];
  percentileValueEl.textContent = formatPercent(computePercentile(result.finalValue, projectedLeaderboard));

  renderBreakdown(result.breakdown, result.finalValue);
  renderComparisons(benchmarks);
  drawChart(result.timeline, benchmarks);

  resultsPanel.classList.remove("hidden");
  window.scrollTo({ top: resultsPanel.offsetTop - 40, behavior: "smooth" });
}

function renderBreakdown(breakdown, portfolioFinalValue) {
  breakdownListEl.innerHTML = "";
  breakdown
    .sort((a, b) => b.finalValue - a.finalValue)
    .forEach((item) => {
      const div = document.createElement("div");
      div.className = "breakdown-item";
      const share = portfolioFinalValue > 0 ? (item.finalValue / portfolioFinalValue) : 0;
      div.innerHTML = `
        <span>${item.name}</span>
        <span>${formatCurrency(item.finalValue)} · ${formatPercent(share)}</span>
      `;
      breakdownListEl.appendChild(div);
    });
}

function renderComparisons(benchmarks) {
  comparisonListEl.innerHTML = "";
  benchmarks.forEach((set) => {
    const div = document.createElement("div");
    div.className = "comparison";
    div.innerHTML = `
      <strong>${set.label}</strong>
      <span>Final value: ${formatCurrency(set.finalValue)}</span>
      <span>CAGR: ${formatPercent(set.cagr)}</span>
    `;
    comparisonListEl.appendChild(div);
  });
}

function drawChart(timeline, benchmarks) {
  const canvas = document.getElementById("growthChart");
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  const padding = { top: 28, right: 32, bottom: 40, left: 64 };
  const series = [
    { id: "player", label: "Your portfolio", color: palette.player, timeline },
    ...benchmarks.map((bench) => ({
      id: bench.id,
      label: bench.label,
      color: bench.color,
      timeline: bench.timeline
    }))
  ];

  const allValues = series.flatMap((set) => set.timeline.map((point) => point.value));
  let maxValue = Math.max(...allValues, INITIAL_CAPITAL * 1.1);
  let minValue = Math.min(...allValues, INITIAL_CAPITAL * 0.6);
  if (!Number.isFinite(maxValue) || !Number.isFinite(minValue)) {
    maxValue = INITIAL_CAPITAL * 1.2;
    minValue = INITIAL_CAPITAL * 0.8;
  }
  if (maxValue === minValue) {
    maxValue += INITIAL_CAPITAL * 0.1;
  }

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const scaleX = (index) => padding.left + (plotWidth * index) / (YEARS.length - 1);
  const scaleY = (value) => padding.top + plotHeight - ((value - minValue) / (maxValue - minValue)) * plotHeight;

  ctx.strokeStyle = "#d6e0ea";
  ctx.lineWidth = 1;
  YEARS.forEach((year, index) => {
    const x = scaleX(index);
    ctx.beginPath();
    ctx.moveTo(x, padding.top);
    ctx.lineTo(x, height - padding.bottom);
    ctx.stroke();
  });

  const yTicks = 5;
  ctx.fillStyle = "#627d98";
  ctx.font = "12px Inter, system-ui";
  ctx.textBaseline = "middle";
  for (let i = 0; i <= yTicks; i += 1) {
    const value = minValue + ((maxValue - minValue) * i) / yTicks;
    const y = scaleY(value);
    ctx.strokeStyle = i === 0 || i === yTicks ? "#bcccdc" : "#e4edf7";
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
    ctx.fillText(formatAxisCurrency(value), 8, y + 4);
  }

  ctx.fillStyle = "#334e68";
  ctx.textBaseline = "top";
  ctx.textAlign = "center";
  YEARS.forEach((year, index) => {
    const x = scaleX(index);
    ctx.fillText(String(year), x, height - padding.bottom + 18);
  });
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  series.forEach((set) => {
    ctx.beginPath();
    ctx.strokeStyle = set.color;
    ctx.lineWidth = set.id === "player" ? 3 : 2;
    set.timeline.forEach((point, index) => {
      const x = scaleX(index);
      const y = scaleY(point.value);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  });

  ctx.font = "12px Inter, system-ui";
  const legendBoxSize = 12;
  const legendGap = 8;
  const legendPadding = 12;
  const longestLabel = series.reduce((longest, set) => {
    const widthMeasure = ctx.measureText(set.label).width;
    return Math.max(longest, widthMeasure);
  }, 0);
  const legendX = width - padding.right - longestLabel - legendBoxSize - legendPadding;
  let legendY = padding.top;
  series.forEach((set) => {
    ctx.fillStyle = set.color;
    ctx.fillRect(legendX, legendY, legendBoxSize, legendBoxSize);
    ctx.fillStyle = "#243b53";
    ctx.fillText(set.label, legendX + legendBoxSize + legendGap, legendY + legendBoxSize - 1);
    legendY += legendBoxSize + 6;
  });
}

function computeCagr(finalValue, initialValue, periods) {
  if (finalValue <= 0 || initialValue <= 0 || periods <= 0) {
    return 0;
  }
  return Math.pow(finalValue / initialValue, 1 / periods) - 1;
}

function formatCurrency(value) {
  if (!Number.isFinite(value)) {
    return "$0";
  }
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function formatAxisCurrency(value) {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function formatPercent(value) {
  if (!Number.isFinite(value)) {
    return "–";
  }
  const percentage = value * 100;
  const formatted = Math.abs(percentage) >= 9.95 ? percentage.toFixed(1) : percentage.toFixed(2);
  return `${formatted}%`;
}

function computePercentile(finalValue, dataset = getLeaderboard()) {
  const leaderboard = dataset;
  if (!leaderboard.length) {
    return 1;
  }
  const betterOrEqual = leaderboard.filter((entry) => entry.finalValue <= finalValue).length;
  return betterOrEqual / leaderboard.length;
}

function persistResult(result) {
  const leaderboard = getLeaderboard();
  const name = playerNameInput.value.trim() || "Analyst";
  const entry = {
    name,
    finalValue: result.finalValue,
    cagr: result.cagr,
    allocation: { ...allocationState },
    timestamp: Date.now()
  };
  leaderboard.push(entry);
  leaderboard.sort((a, b) => b.finalValue - a.finalValue);
  const trimmed = leaderboard.slice(0, 15);
  window.localStorage.setItem("venture-adventure-leaderboard", JSON.stringify(trimmed));
}

function updateLeaderboardDisplay() {
  const leaderboard = getLeaderboard();
  leaderboardListEl.innerHTML = "";
  if (!leaderboard.length) {
    const empty = document.createElement("li");
    empty.textContent = "No simulations yet. Be the first to allocate.";
    leaderboardListEl.appendChild(empty);
    return;
  }
  leaderboard.forEach((entry, index) => {
    const item = document.createElement("li");
    const rank = index + 1;
    const date = new Date(entry.timestamp);
    const summary = Object.entries(entry.allocation)
      .filter(([, weight]) => Number(weight) > 0)
      .map(([id, weight]) => `${lookupAssetName(id)} ${weight}%`)
      .join(", ");

    item.innerHTML = `
      <strong>${rank}. ${entry.name}</strong> — ${formatCurrency(entry.finalValue)} · ${formatPercent(entry.cagr)} · ${summary} (${date.toLocaleDateString()})
    `;
    leaderboardListEl.appendChild(item);
  });
}

function handleRetailMode(retailMode) {
  const restricted = assetClasses.filter((asset) => asset.retailRestricted).map((asset) => asset.id);
  if (retailMode) {
    institutionalSnapshot = restricted.reduce((map, assetId) => {
      map[assetId] = allocationState[assetId] || 0;
      return map;
    }, {});
    restricted.forEach((assetId) => {
      allocationState[assetId] = 0;
      updateSlider(assetId, 0, true);
    });
  } else {
    restricted.forEach((assetId) => {
      const restoreValue = institutionalSnapshot?.[assetId] ?? defaultAllocations[assetId] ?? 0;
      allocationState[assetId] = restoreValue;
      updateSlider(assetId, restoreValue, false);
    });
    institutionalSnapshot = null;
  }
  restricted.forEach((assetId) => {
    const card = allocationListEl.querySelector(`[data-asset-id="${assetId}"]`);
    if (card) {
      card.classList.toggle("restricted", retailMode);
    }
  });
}

function updateSlider(assetId, value, disable) {
  const card = allocationListEl.querySelector(`[data-asset-id="${assetId}"]`);
  if (!card) {
    return;
  }
  const slider = card.querySelector("input[type='range']");
  const weightEl = card.querySelector(".weight");
  slider.value = value;
  slider.disabled = disable;
  weightEl.textContent = `${value}%`;
}

function lookupAssetName(assetId) {
  const asset = assetClasses.find((item) => item.id === assetId);
  return asset ? asset.name : assetId;
}

function getLeaderboard() {
  try {
    const raw = window.localStorage.getItem("venture-adventure-leaderboard");
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn("Unable to read leaderboard", error);
    return [];
  }
}

function loadDatasetFromFile(file) {
  if (!datasetStatusEl) {
    return;
  }
  datasetStatusEl.textContent = `Loading ${file.name}…`;
  datasetStatusEl.classList.remove("error");

  readFileText(file)
    .then((text) => {
      const parsed = parseReturnsCsv(text);
      if (parsed.errors.length) {
        datasetStatusEl.textContent = parsed.errors.join(" ");
        datasetStatusEl.classList.add("error");
        datasetInput.value = "";
        return;
      }
      const { appliedAssets, warnings } = applyDataset(parsed.records);
      if (!appliedAssets.length) {
        datasetStatusEl.textContent = "No matching asset IDs found in dataset.";
        datasetStatusEl.classList.add("error");
        datasetInput.value = "";
        return;
      }
      if (resetDatasetBtn) {
        resetDatasetBtn.disabled = false;
      }
      const summary = `Loaded ${appliedAssets.length} asset${appliedAssets.length === 1 ? "" : "s"} from ${file.name}.`;
      datasetStatusEl.textContent = warnings.length ? `${summary} ${warnings.join(" ")}` : summary;
      datasetStatusEl.classList.remove("error");
      if (datasetInput) {
        datasetInput.value = "";
      }
    })
    .catch((error) => {
      console.error("Failed to load dataset", error);
      datasetStatusEl.textContent = "Unable to read file. Please try again.";
      datasetStatusEl.classList.add("error");
      datasetInput.value = "";
    });
}

function resetDataset() {
  assetClasses.forEach((asset) => {
    const defaults = defaultReturnSeries[asset.id];
    if (defaults) {
      asset.returns = [...defaults];
    }
  });
  if (datasetStatusEl) {
    datasetStatusEl.textContent = "Using illustrative default dataset.";
    datasetStatusEl.classList.remove("error");
  }
  if (resetDatasetBtn) {
    resetDatasetBtn.disabled = true;
  }
  if (datasetInput) {
    datasetInput.value = "";
  }
}

function readFileText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = () => {
      reject(reader.error);
    };
    reader.readAsText(file);
  });
}

function parseReturnsCsv(text) {
  let rows;
  try {
    rows = parseCsv(text);
  } catch (error) {
    return { records: [], errors: [error.message] };
  }
  const errors = [];
  if (!rows.length) {
    errors.push("CSV file is empty.");
    return { records: [], errors };
  }
  const header = rows[0].map((cell) => cell.trim().toLowerCase());
  const assetIdx = header.indexOf("assetid");
  const yearIdx = header.indexOf("year");
  const returnIdx = header.indexOf("return");
  if (assetIdx === -1 || yearIdx === -1 || returnIdx === -1) {
    errors.push("Header must include assetId, year, return.");
    return { records: [], errors };
  }

  const records = [];
  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];
    if (!row.length || row.every((cell) => cell.trim() === "")) {
      continue;
    }
    const assetId = (row[assetIdx] || "").trim();
    const yearValue = (row[yearIdx] || "").trim();
    const returnValueRaw = (row[returnIdx] || "").trim();
    if (!assetId) {
      errors.push(`Row ${i + 1}: Missing assetId.`);
      continue;
    }
    const year = Number.parseInt(yearValue, 10);
    if (!Number.isFinite(year)) {
      errors.push(`Row ${i + 1}: Invalid year "${yearValue}".`);
      continue;
    }
    const normalizedReturn = normalizeReturnValue(returnValueRaw);
    if (!Number.isFinite(normalizedReturn)) {
      errors.push(`Row ${i + 1}: Invalid return "${returnValueRaw}".`);
      continue;
    }
    records.push({ assetId, year, value: normalizedReturn });
  }

  return { records, errors };
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === "\"" && insideQuotes && nextChar === "\"") {
      current += "\"";
      index += 1;
      continue;
    }
    if (char === "\"") {
      insideQuotes = !insideQuotes;
      continue;
    }
    if (char === "," && !insideQuotes) {
      row.push(current);
      current = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
      continue;
    }
    current += char;
  }

  if (insideQuotes) {
    throw new Error("CSV has unmatched quotes.");
  }
  if (current !== "" || row.length) {
    row.push(current);
    rows.push(row);
  }

  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ""));
}

function normalizeReturnValue(raw) {
  if (!raw) {
    return Number.NaN;
  }
  const cleaned = raw.replace(/[%]/g, "").trim();
  const numeric = Number.parseFloat(cleaned);
  if (!Number.isFinite(numeric)) {
    return Number.NaN;
  }
  if (Math.abs(numeric) > 2) {
    return numeric / 100;
  }
  return numeric;
}

function applyDataset(records) {
  const recordsByAsset = {};
  const duplicateEntries = [];
  const yearSet = new Set();

  records.forEach((record) => {
    yearSet.add(record.year);
    if (!recordsByAsset[record.assetId]) {
      recordsByAsset[record.assetId] = {};
    }
    if (Object.prototype.hasOwnProperty.call(recordsByAsset[record.assetId], record.year)) {
      duplicateEntries.push(`${record.assetId} ${record.year}`);
    }
    recordsByAsset[record.assetId][record.year] = record.value;
  });

  const warnings = [];
  const appliedAssets = [];
  if (duplicateEntries.length) {
    warnings.push(`Duplicates overwritten for: ${duplicateEntries.join(", ")}.`);
  }

  assetClasses.forEach((asset) => {
    const assetRecords = recordsByAsset[asset.id];
    if (!assetRecords) {
      return;
    }
    let missingYears = 0;
    YEARS.forEach((year) => {
      if (!Object.prototype.hasOwnProperty.call(assetRecords, year)) {
        missingYears += 1;
      }
    });
    if (missingYears === YEARS.length) {
      warnings.push(`${asset.name} missing 2015–2025 data.`);
      return;
    }
    if (missingYears > 0) {
      warnings.push(`${asset.name} missing ${missingYears} year${missingYears === 1 ? "" : "s"}; defaults used for gaps.`);
    }
    const defaults = defaultReturnSeries[asset.id] || [];
    asset.returns = YEARS.map((year, index) => {
      if (Object.prototype.hasOwnProperty.call(assetRecords, year)) {
        return assetRecords[year];
      }
      return defaults[index] ?? assetRecords[year] ?? 0;
    });
    appliedAssets.push(asset.id);
  });

  const unknownAssets = Object.keys(recordsByAsset).filter((assetId) => !assetClasses.some((asset) => asset.id === assetId));
  if (unknownAssets.length) {
    warnings.push(`Unknown asset IDs skipped: ${unknownAssets.join(", ")}.`);
  }

  if (yearSet.size) {
    const yearRange = Array.from(yearSet).sort((a, b) => a - b);
    const minYear = yearRange[0];
    const maxYear = yearRange[yearRange.length - 1];
    if (minYear !== YEARS[0] || maxYear !== YEARS[YEARS.length - 1]) {
      warnings.push(`Dataset years span ${minYear}–${maxYear}; simulator uses ${YEARS[0]}–${YEARS[YEARS.length - 1]}.`);
    }
  }

  return { warnings, appliedAssets };
}
