# Agricultural Bank of Korea Preset & Updates

## Completed Changes

### 1. Agricultural Bank of Korea Preset ✅
**File**: `utils/presets.ts`

**Category**: Regional (5th regional preset)

**Specifications**:
- **Stations**: 288 units
- **Install Cost**: $1,500 (company bears cost entirely)
- **Annual Maintenance**: $5,000 per unit
- **Recovery Rate**: 42%
- **Daily Volume**: 10,000 LPD per station
- **Hardware**: GEVLR-2 (4 kW per day)
- **Electricity**: Variable cost, client responsibility
- **Volume Growth**: -0.5% (EV transition in Korea)
- **Inflation**: 2.5%
- **Machine Uptime**: 99.5%
- **Revenue Share**: 50/50
- **Term**: 3 years
- **No**: SaaS fees, debt financing, carbon credits
- **Discount Rate**: 10%
- **Gasoline Price**: $1.20/L (Korea market rate)
- **Electricity Price**: $0.22/kWh (Korea market rate)

**Key Features**:
- Company handles and pays for installation
- Realistic negative growth due to EV adoption
- Short 3-year term
- High station count (288)
- Korea-specific pricing

---

### 2. Smart Alert - Always Show on Negative NPV ✅
**File**: `components/ResultsPanel.tsx`

**Before**:
```typescript
const showSmartAlert = profitability.npv < 0 && profitability.roi > 0;
```

**After**:
```typescript
const showSmartAlert = profitability.npv < 0;
```

**Change**: Smart Alert now appears whenever NPV is negative, regardless of ROI. This provides optimization opportunities for all unprofitable scenarios.

---

## Remaining Tasks (To Be Implemented)

### 3. Enhanced Goal Seek Parameters ⏳
**File**: `components/GoalSeekAnalysis.tsx`

**Current Parameters**:
- Installation Cost
- Customer Acquisition Cost (CAC)

**Requested Additional Parameters**:
- [ ] Unit COGS
- [ ] Annual Maintenance Cost
- [ ] Lease Term
- [ ] Recovery Rate
- [ ] Revenue Share
- [ ] Gasoline Price
- [ ] Electricity Price
- [ ] Volume Growth Rate

**Implementation Plan**:
1. Add dropdown to select which parameter to optimize
2. Add input fields for each parameter
3. Update goal seek algorithm to handle multiple parameters
4. Add validation for each parameter type

---

### 4. Hardware Specifications Settings ⏳
**New Component**: `components/HardwareSettings.tsx`

**Requirements**:
- Settings page to view/edit hardware specs
- Support for GEVLR-2, GEVLR-3, GEVLR-4 (MZ-1)
- Editable fields:
  - Unit COGS
  - Power rating (kW)
  - Processing rate (LPH)
  - Electricity consumption (kWh/day)
  - Default maintenance cost
  - Default warranty period

**Location**: Add to Assumptions page or create new Settings tab

---

### 5. Enhanced Sidebar Breakdown ⏳
**File**: `components/ResultsPanel.tsx` or new `components/DetailedBreakdown.tsx`

**Current**: Shows "Unit COGS: $25,000"

**Requested**: Show calculation breakdown
- Unit COGS: $25,000
  - Per unit cost: $25,000
  - × Number of units: 50
  - = Total: $1,250,000

**Implementation**:
- Add expandable/collapsible sections
- Show formula and calculation steps
- Add tooltips for each component
- Include all major cost categories:
  - COGS breakdown
  - Installation costs breakdown
  - Maintenance costs breakdown
  - Electricity costs breakdown
  - Revenue breakdown

---

### 6. Electricity Cost Responsibility ⏳
**Files**: `types.ts`, `components/InputPanel.tsx`, `utils/calculator.ts`

**Current**: Electricity cost always included in company costs

**Requested**: Option for client to bear electricity costs

**Implementation**:
1. Add new field to InputParams:
   ```typescript
   electricityPaidByClient?: boolean;
   ```

2. Add toggle in InputPanel:
   - "Electricity Cost Responsibility"
   - Options: Company / Client

3. Update calculator logic:
   - If `electricityPaidByClient === true`, exclude from costs
   - Update cost breakdown display
   - Add note in reports

---

### 7. Installation Payment Responsibility ⏳
**Files**: `types.ts`, `components/InputPanel.tsx`, `utils/calculator.ts`

**Current**: `companyHandlesInstallation` implies company pays

**Issue**: Company can handle installation but client pays

**Requested**: Separate fields for:
- Who handles installation (Company / Client)
- Who pays for installation (Company / Client)

**Implementation**:
1. Add new field to InputParams:
   ```typescript
   installationPaidByClient?: boolean;
   ```

2. Update InputPanel:
   - "Installation Handled By": Company / Client
   - "Installation Paid By": Company / Client

3. Update calculator logic:
   - If `installationPaidByClient === true`, exclude from costs
   - If `companyHandlesInstallation === false`, adjust revenue/costs
   - Update cost breakdown

---

## Implementation Priority

### High Priority (Core Functionality)
1. **Enhanced Goal Seek Parameters** - Critical for optimization
2. **Installation Payment Responsibility** - Affects cost calculations
3. **Electricity Cost Responsibility** - Affects cost calculations

### Medium Priority (User Experience)
4. **Enhanced Sidebar Breakdown** - Better transparency
5. **Hardware Specifications Settings** - Better customization

### Low Priority (Nice to Have)
6. Additional preset scenarios
7. More detailed tooltips
8. Export enhancements

---

## Technical Notes

### Agricultural Bank of Korea Preset
- Uses realistic Korea market rates
- Negative growth rate models EV transition
- Short term reflects pilot/trial nature
- High unit count (288) tests scalability
- Company bears installation cost (realistic for market entry)

### Smart Alert Change
- More proactive optimization suggestions
- Helps users identify unprofitable scenarios earlier
- Consistent with "always optimize" philosophy

---

## Testing Checklist

### Agricultural Bank of Korea Preset
- [ ] Preset appears in Regional category
- [ ] All 288 units calculated correctly
- [ ] Negative growth rate applied properly
- [ ] Installation cost not charged to client
- [ ] 3-year term calculations correct
- [ ] Korea pricing reflected in results
- [ ] NPV calculation accurate
- [ ] ROI calculation accurate

### Smart Alert
- [ ] Appears when NPV < 0 and ROI > 0
- [ ] Appears when NPV < 0 and ROI < 0
- [ ] Does not appear when NPV > 0
- [ ] "Optimize Now" button works
- [ ] Navigates to Goal Seek correctly

---

## Build Status

✅ Build successful
✅ No TypeScript errors
✅ Agricultural Bank of Korea preset added
✅ Smart Alert logic updated
✅ 17 total presets now available

---

## Next Steps

1. Implement enhanced Goal Seek with more parameters
2. Add installation/electricity payment responsibility options
3. Create hardware specifications settings page
4. Add detailed cost breakdown in sidebar
5. Test all changes thoroughly
6. Update documentation

---

Ready for testing! 🇰🇷
