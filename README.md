# Onion Growth Simulator

A single-page, static web app that simulates how soil pH and iron (Fe) affect onion chlorophyll, leaf color, and bulb growth. Built for onion growers in Bongabon, Nueva Ecija, the "onion capital" of the Philippines. No backend, no build step — runs entirely in the browser and deploys directly on GitHub Pages.

**[Live demo](#)** ← replace with your GitHub Pages URL once deployed

![status](https://img.shields.io/badge/stack-HTML%2FCSS%2FJS-informational) ![deploy](https://img.shields.io/badge/deploy-GitHub%20Pages-blue)

## What it does

- Simulates onion growth day by day (play/pause, speed control, manual step) rather than jumping straight to harvest
- Lets you adjust soil pH (0–14) and Fe concentration (0–400 ppm) in real time, mid-simulation
- Models **Transplanting vs. Direct Seeding**, which have different field durations (see below)
- Draws the plant on a canvas: bulb, roots, pseudostem, and individual leaves that grow in both count and size, colored by chlorophyll level
- Shows a live report: chlorophyll trend, Fe-deficient days, height, bulb diameter, leaf count, and a harvest interpretation

| Variety | Transplanting (DAT) | Direct Seeding (DAS) |
|---|---|---|
| Yellow Granex | 90 | 125 |
| Red Pinoy | 95 | 130 |
| Red Creole | 115 | 150 |

## Deploying on GitHub Pages

1. Push `index.html` (and this `README.md`) to a repository.
2. In the repo, go to **Settings → Pages**, set the source to the branch containing `index.html` (root folder).
3. Your simulator will be live at `https://<username>.github.io/<repo>/`.

No dependencies, no `npm install`, no build tools — it's one self-contained HTML file.

## The mathematical model

The simulation runs one simulated day at a time. Each day updates **effective iron supply → chlorophyll → accumulated growth**, in that order.

### 1. Effective iron supply

Soil pH and Fe concentration are combined — the model never infers deficiency from pH alone:

```
E = Fe × pHfactor(pH)
```

The pH factor is a logistic (S-curve) that falls as soil becomes more alkaline:

```
pHfactor(pH) = 1.2 / (1 + e^(1.25 × (pH − 6.9)))
```

This yields roughly:

| pH | 4 | 5 | 6 | 7 | 7.9 | 9 |
|---|---|---|---|---|---|---|
| pH factor | 1.17 | 1.10 | 0.91 | 0.56 | 0.27 | 0.08 |

reflecting the acidic → more Fe available, alkaline → less Fe available relationship from the source studies.

### 2. Chlorophyll target (saturating dose-response)

A Hill-type saturation curve models diminishing returns from added Fe:

```
sat(E) = 1 − e^(−(E/60)^1.6)
```

Two stress penalties are applied on top:

**High-Fe toxicity** — reduces the target once effective Fe passes ~200 ppm:

```
tox(E) = 1 − 0.25 × clamp((E − 200) / 300, 0, 1)
```

**Extreme-acidity penalty** (independent of Fe — very low pH is never assumed to be better):

```
acid(pH) = clamp((5.5 − pH) / 2.0, 0, 1)
```

Combined into a target chlorophyll index, on a 0–1 scale:

```
target = clamp( (0.25 + 0.75 × sat(E)) × tox(E) × (1 − 0.15 × acid), 0.05, 1 )
```

### 3. Chlorophyll dynamics (first-order lag)

Chlorophyll moves toward its target gradually rather than jumping instantly — a discrete exponential smoothing filter, so a pH/Fe fix takes several simulated days to show:

```
CI(day d) = CI(day d−1) + 0.12 × ( target(d) − CI(day d−1) )
```

### 4. Growth accumulation (logistic progress curves)

Two normalized logistic curves track how far along the plant is — one for top growth (height/leaves, centered ~36–42% of field duration), one for bulb growth (centered ~70%):

```
sigmoid(z) = 1 / (1 + e^−z)

g(x) = [ sigmoid(k×(x − x0)) − sigmoid(−k×x0) ]
       ─────────────────────────────────────────
       [ sigmoid(k×(1 − x0)) − sigmoid(−k×x0) ]
```

Each day's increment is the derivative of this progress curve times that day's chlorophyll-scaled growth factor, accumulated day by day:

```
Height(day n) = h0 + (hMax − h0) × Σ [ g_top(d) − g_top(d−1) ] × CI(d)^0.3 × pm(d)
                                    d=1..n
```

where `pm(d) = 1 − 0.5 × acid(d) − 0.15 × alk(d)` is a pH-stress multiplier. Bulb diameter and leaf count follow the same pattern with their own exponents and progress curve.

Because growth is accumulated day by day rather than computed from final inputs, pausing mid-simulation and changing pH or Fe only affects the days that follow — earlier growth is already locked in.

**Summary:** a Hill/logistic dose-response model for Fe availability and chlorophyll, an exponential-lag filter for how chlorophyll tracks its target over time, and cumulative logistic growth curves modulated day-by-day by that chlorophyll value.

## Model calibration note

Specific thresholds (e.g. "deficient" below ~60 ppm effective Fe) are a teaching model tuned to match the *direction and size* of the published results below — they are not measured field cutoffs. The app is meant to build intuition about pH–Fe–chlorophyll relationships, not to replace soil testing or agronomic advice.

## Scientific references

- [Frontiers in Sustainable Food Systems (2025) — green onion soil and plant characteristics](https://www.frontiersin.org/journals/sustainable-food-systems/articles/10.3389/fsufs.2025.1508115/full)
- [The effect of alginate:zeolite (3:1) Fe composite on shallots (Allium cepa L. 'Bima Brebes')](https://www.researchgate.net/publication/362885982_The_effect_of_alginate-zeolite_31_Fe_composite_on_physiological_characters_stomatal_density_and_yield_of_shallots_Allium_cepa_L_%27Bima_Brebes%27)
- [Response of onion growth and yield in semi-arid soils to foliar application of iron under water stress](https://www.researchgate.net/publication/353274080_Response_of_onion_growth_and_yield_grown_in_soils_of_semi-arid_regions_to_foliar_application_of_iron_under_water_stress_conditions)
- [Journal of Farm Sciences: effect of zinc and iron on growth, yield and quality parameters of onion](https://journaloffarmsciences.in/index.php/JFM/article/download/6/5)
- [Growth, health, quality and production of onions inoculated with systemic biological products (Guanajuato, Mexico)](https://www.researchgate.net/publication/390360750_Growth_Health_Quality_and_Production_of_Onions_Allium_cepa_L_Inoculated_with_Systemic_Biological_Products)
- Bongabon and Nueva Ecija onion production data: Red Pinoy, ~90–95 days after transplanting
- Direct seeding vs. transplanting duration comparisons: Ethiopia (~135 vs. 104 days), Brazil (~132 vs. 102 days)

## License

Add your preferred license here (e.g. MIT).
