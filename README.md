# venture-adventure

---
I'm building an educational investing game with a 2015–2025 backtest mechanic. Specced out the **product features and requirements** in a structured way, so I can move from idea → MVP → growth.

---

# **Product Spec: Asset Class Investment Game**

## 🎯 **Core Objective**

Teach users how different asset classes perform over time, highlight venture’s outsized returns (especially top-decile), and simulate portfolio construction decisions with historical data.

---

## 🕹️ **Gameplay Flow**

1. **Setup**

   * User starts with **$100,000 virtual capital**.
   * They are given a set of asset classes to allocate across.

2. **Asset Classes Available**

   * **Public Markets** (e.g., S&P 500)
   * **Private Equity**
   * **Real Estate**
   * **Private Credit**
   * **Venture Capital** (with options for median vs. top-decile funds)
   * *(optional)* Cash (risk-free baseline, e.g., US Treasuries).

3. **Allocation**

   * Drag-and-drop or slider UI to allocate percentages of the $100K across chosen asset classes.
   * Must total 100%.

4. **Simulation (2015 → 2025)**

   * Game “plays forward” 10 years based on real-world historical performance data for each class.
   * Performance displayed via growth curves or animated timeline.

5. **Results**

   * Show ending portfolio value (absolute $ and CAGR %).
   * Breakdown by asset class (how much each allocation grew).
   * Benchmark comparison:

     * "What if you put 100% in X?"
     * "What if you did equal-weight across all?"
     * "What did other users do?"

6. **Leaderboards / Social**

   * Compare your returns vs. all players (percentile rank).
   * Optional “friends mode” to compete in private groups.

---

## 📊 **Data & Assumptions**

* **Historical Data Inputs (2015–2025):**

  * S&P 500 annual returns (public markets).
  * Private Equity fund indices.
  * Real Estate indices (e.g., NCREIF ODCE).
  * Private Credit benchmarks.
  * Venture Capital (median, top quartile, top decile via Cambridge Associates or PitchBook data).
* Adjust for fees if desired (educational realism).
* Option to randomize within historical ranges (simulate uncertainty).

---

## 🖥️ **Core Features**

1. **Portfolio Allocation UI**

   * Sliders or pie chart allocation.
   * Immediate feedback on weights.

2. **Timeline Simulation**

   * Animation of portfolio growth over 10 years.
   * Line graph of portfolio vs. benchmarks.

3. **Results Dashboard**

   * Final value.
   * CAGR.
   * Asset class breakdown (stacked bar / pie).
   * Comparison to “top-decile venture” vs. “median venture.”

4. **Leaderboard**

   * Global ranks (percentile).
   * Customizable groups (friends, colleagues, classrooms).

5. **Replay / Try Again**

   * Ability to rerun different allocations.
   * Compare two portfolios side by side.

---

## 🎓 **Educational Elements**

* **Context Cards**: Before allocation, users can click each asset class to see:

  * Historical return ranges.
  * Typical risks (volatility, liquidity).
  * Accessibility (retail vs. institutional).
* **Retail Constraint Mode**:

  * Users can toggle “retail access only,” which removes or limits PE/VC allocations (to teach real-world access constraints).

---

## 🧩 **Requirements Breakdown**

### **Functional Requirements**

* User registration/login (for saving progress, leaderboards).
* Portfolio allocation input (sliders/pie chart).
* Data-driven simulation engine (runs performance calc).
* Visualization (graphs, animations).
* Leaderboard backend.
* Educational content integration (tooltips, explainer cards).

### **Non-Functional Requirements**

* Cross-platform (web-first, mobile-friendly).
* Lightweight backend (data storage, leaderboard, user profiles).
* Secure handling of user data (basic auth, GDPR/CCPA compliant if scaling).
* Scalable architecture (start small, grow with usage).

---

## 🚀 **MVP Scope**

1. Basic UI for allocating across asset classes.
2. Hard-coded historical return multipliers (2015–2025).
3. Simulation engine to compute final portfolio value.
4. Simple results screen with graphs.
5. Leaderboard (even simple global ranking).

---

## 🔮 **Future Enhancements**

* **Randomized scenarios**: Users can replay with different return environments (bull/bear cycles).
* **Events & Shocks**: Insert market crises (COVID dip, 2022 downturn) for realism.
* **Progressive levels**: Start with retail-only options, unlock “institutional” investing later.
* **Multi-decade play**: Expand beyond 2015–2025 to 20–30 year horizons.
* **AI-powered advisor mode**: Personalized allocation recommendations.

---

Do you want me to make a **clickable wireframe mockup** of the core game flow (allocation → simulation → results) so you can visualize it, or would you prefer I write out a **detailed data model and system architecture** first?
