# Preset Parameters Fix - Completed

## Summary
Fixed two critical issues with presets and installation margin:
1. Installation margin now allows 0% or negative values (company can bear cost without earning revenue)
2. All presets now include scenario-specific maintenance costs, hardware specs, and installation parameters

## Issues Fixed

### 1. Installation Margin Range ✅
**Problem**: Installation margin was limited to 0-100%, preventing scenarios where company bears installation cost without revenue.

**Solution**: 
- Changed slider range from `0-100%` to `-100% to 200%`
- Added description: "Set to 0% to break even, negative to bear cost"
- Updated Goal Seek bounds to allow `-100%` to `500%`

**File**: `components/InputPanel.tsx`, `components/GoalSeekAnalysis.tsx`

**Use Cases**:
- `0%` margin = Company breaks even on installation (cost = revenue)
- Negative margin = Company subsidizes installation (loses money)
- Positive margin = Company profits from installation

### 2. Preset-Specific Parameters ✅
**Problem**: Maintenance costs and hardware specs were treated as "settings" rather than scenario-specific parameters, causing all presets to use the same values.

**Solution**: Added scenario-specific values to all 17 presets:
- `unitCost` (hardware COGS)
- `installationCostPerUnit`
- `installationMargin`
- `annualMaintenanceCost`

**File**: `utils/presets.ts`

## Updated Presets

### Risk Profile Category
1. **Conservative**: GEVLR-2 ($35k), $3k install, 15% margin, $1,500 maintenance
2. **Moderate**: GEVLR-2 ($35k), $3k install, 20% margin, $1,000 maintenance
3. **Aggressive**: GEVLR-2 ($35k), $3k install, 25% margin, $800 maintenance
4. **Ultra Conservative**: GEVLR-2 ($35k), $3.5k install, 10% margin, $2,000 maintenance

### Regional Category
5. **Western Europe**: GEVLR-2 ($35k), $4k install, 18% margin, $1,200 maintenance
6. **Gulf Region**: GEVLR-3 ($50k), $5k install, 25% margin, $800 maintenance (high volume)
7. **North America**: GEVLR-2 ($35k), $3.5k install, 20% margin, $1,000 maintenance
8. **Asia Pacific**: GEVLR-2 ($35k), $2.8k install, 22% margin, $900 maintenance
9. **Agricultural Bank of Korea**: GEVLR-2 ($35k), $1.5k install, **0% margin**, $5,000 maintenance

### Station Size Category
10. **Small Station**: GEVLR-2 ($35k), $2.5k install, 18% margin, $1,200 maintenance
11. **Medium Station**: GEVLR-2 ($35k), $3k install, 20% margin, $1,000 maintenance
12. **Large Station**: GEVLR-3 ($50k), $5k install, 22% margin, $1,000 maintenance (high volume)
13. **Fleet/Industrial**: GEVLR-3 ($50k), $8k install, 20% margin, $1,000 maintenance (industrial)

### Business Model Category
14. **SaaS + Leasing**: GEVLR-2 ($35k), $3k install, 20% margin, $1,000 maintenance
15. **Direct Sales + SaaS**: GEVLR-2 ($35k), $3k install, 15% margin, $0 maintenance (client handles)
16. **Pure Direct Sales**: GEVLR-2 ($35k), $3k install, 18% margin, $0 maintenance (client handles)
17. **Debt Financed**: GEVLR-2 ($35k), $3k install, 20% margin, $1,000 maintenance

## Key Changes by Preset Type

### High Volume Stations (Gulf, Large, Fleet/Industrial)
- Use GEVLR-3 ($50k) instead of GEVLR-2 ($35k)
- Higher installation costs ($5k-$8k)
- Can handle 20k+ LPD

### Direct Sales Models
- Set `annualMaintenanceCost: 0` (client handles maintenance)
- Lower installation margins (15-18%)
- Include warranty and spare parts revenue

### Agricultural Bank of Korea
- **0% installation margin** (company bears $1,500 cost, no revenue)
- Explicitly set `installationPaidByClient: false`
- High maintenance cost ($5,000/year)
- 288 units, 3-year term

## Technical Implementation

### Installation Revenue Calculation
```typescript
// In calculator.ts
const installationPricePerUnit = params.installationCostPerUnit * (1 + (params.installationMargin || 0) / 100);

// Examples:
// Cost: $1,500, Margin: 0%   → Price: $1,500 (break even)
// Cost: $1,500, Margin: -20% → Price: $1,200 (company loses $300)
// Cost: $1,500, Margin: 20%  → Price: $1,800 (company earns $300)
```

### Preset Application
When a preset is selected:
1. All specified parameters override current values
2. Unspecified parameters retain their current values
3. Hardware specs, costs, and margins are scenario-specific
4. No more "global settings" for these parameters

## Benefits

### 1. Realistic Scenarios
- Each preset now has appropriate hardware for its volume
- Maintenance costs vary by region and station type
- Installation economics reflect real-world deals

### 2. Flexible Installation Economics
- Can model subsidized installations (negative margin)
- Can model break-even installations (0% margin)
- Can model profitable installations (positive margin)

### 3. Accurate Modeling
- Agricultural Bank of Korea: Company bears $1,500 cost with 0% margin = $432k total cost, $0 revenue
- Gulf Region: High volume justifies GEVLR-3 hardware
- Direct Sales: Client handles maintenance (cost = $0 for company)

## Testing Checklist

### Installation Margin
- [x] Slider allows -100% to 200%
- [x] 0% margin shows cost = revenue
- [x] Negative margin reduces revenue below cost
- [x] Positive margin increases revenue above cost
- [x] Goal Seek works with negative margins

### Preset Parameters
- [x] All 17 presets include unitCost
- [x] All 17 presets include installationCostPerUnit
- [x] All 17 presets include installationMargin
- [x] All 17 presets include annualMaintenanceCost
- [x] High volume presets use GEVLR-3
- [x] Direct sales presets have $0 maintenance
- [x] Korea preset has 0% margin

### Build & Compilation
- [x] No TypeScript errors
- [x] Vite build successful
- [x] All presets load correctly

## Example Calculations

### Agricultural Bank of Korea (0% Margin)
```
Installation Cost: $1,500 per unit
Installation Margin: 0%
Installation Price: $1,500 per unit (break even)
Units: 288
Total Installation Cost: $432,000
Total Installation Revenue: $432,000
Net Installation Profit: $0
```

### Aggressive Preset (25% Margin)
```
Installation Cost: $3,000 per unit
Installation Margin: 25%
Installation Price: $3,750 per unit
Units: 30
Total Installation Cost: $90,000
Total Installation Revenue: $112,500
Net Installation Profit: $22,500
```

### Hypothetical Subsidized Deal (-20% Margin)
```
Installation Cost: $5,000 per unit
Installation Margin: -20%
Installation Price: $4,000 per unit
Units: 50
Total Installation Cost: $250,000
Total Installation Revenue: $200,000
Net Installation Loss: -$50,000 (company subsidizes)
```

## Files Modified
1. `components/InputPanel.tsx` - Installation margin slider range and description
2. `components/GoalSeekAnalysis.tsx` - Goal Seek bounds for installation margin
3. `utils/presets.ts` - Added 4 parameters to all 17 presets

## Build Status
✅ TypeScript compilation successful
✅ Vite build successful (1.47s)
✅ No errors or warnings
✅ All 17 presets updated
