# Unit Cost Adjustability - Completed

## Summary
Made unit costs (COGS) easily adjustable to account for different shipping terms (EXW/FOB/DDP). Unit costs now prominently displayed and editable in Analyst mode, with clear guidance that costs vary by shipping terms.

## Problem
Unit costs were set by hardware presets but not easily adjustable. Since EXW (Ex Works), FOB (Free On Board), and DDP (Delivered Duty Paid) costs can vary significantly, users need to adjust these values based on their specific shipping arrangements.

**Example**: GEVLR-3 might be:
- $35k EXW (factory price)
- $42k FOB (delivered to port)
- $50k+ DDP (delivered to destination with all duties/taxes paid)

## Solution Implemented

### 1. Unit Cost Display (Both Personas) ✅
**File**: `components/InputPanel.tsx`

Added a prominent display box showing current unit cost for both Sales and Analyst personas:
```
┌─────────────────────────────────┐
│ Unit Cost (COGS): $35,000      │
└─────────────────────────────────┘
```

Located directly below hardware selector, always visible.

### 2. Unit Cost Input (Analyst Mode) ✅
**File**: `components/InputPanel.tsx`

Added editable TextInput in Analyst mode with helpful description:
- Label: "Unit Cost (COGS)"
- Description: "EXW/FOB/DDP cost varies by shipping terms"
- Currency symbol automatically adjusts
- Located in hardware specs section

### 3. Documentation & Comments ✅
**File**: `utils/presets.ts`

Added comprehensive comment at top of file:
```typescript
// NOTE: Unit costs in presets are base estimates and should be adjusted based on:
// - EXW (Ex Works): Factory price, buyer arranges shipping
// - FOB (Free On Board): Includes delivery to port
// - DDP (Delivered Duty Paid): Includes all shipping, duties, taxes to destination
// Example: GEVLR-3 may be $35k EXW, $42k FOB, or $50k+ DDP depending on destination
```

Updated hardware preset comment:
```typescript
// Machine Hardware Presets (Base EXW costs - adjust for FOB/DDP)
```

## User Workflow

### Sales Persona
1. Select hardware type from dropdown (GEVLR-2, GEVLR-3, MZ-1)
2. See unit cost displayed in read-only box
3. Switch to Analyst mode to adjust if needed

### Analyst Persona
1. Select hardware type from dropdown
2. See unit cost displayed in box
3. Edit unit cost field below to adjust for shipping terms
4. Enter actual EXW/FOB/DDP cost based on contract
5. All calculations update automatically

## Shipping Terms Explained

### EXW (Ex Works)
- **Lowest cost**: Factory gate price
- **Buyer responsibility**: All shipping, insurance, duties, taxes
- **Example**: GEVLR-2 at $30k EXW

### FOB (Free On Board)
- **Medium cost**: Includes delivery to departure port
- **Buyer responsibility**: Ocean freight, insurance, import duties, delivery
- **Example**: GEVLR-2 at $35k FOB Shanghai

### DDP (Delivered Duty Paid)
- **Highest cost**: All-inclusive delivered price
- **Seller responsibility**: All shipping, duties, taxes to destination
- **Example**: GEVLR-2 at $42k DDP Los Angeles

## Preset Cost Assumptions

All preset unit costs are **base estimates** and should be adjusted:

### GEVLR-2 (Standard)
- Preset: $35,000 (approximate FOB)
- Adjust to: $30k EXW, $35k FOB, $40-45k DDP

### GEVLR-3 (High Volume)
- Preset: $50,000 (approximate DDP to specific country)
- Adjust to: $35k EXW, $42k FOB, $50-60k DDP

### MZ-1 (Industrial)
- Preset: $50,000 (approximate DDP)
- Adjust to: $40k EXW, $48k FOB, $50-65k DDP

## Example Scenarios

### Scenario 1: US Customer, FOB Shanghai
```
Hardware: GEVLR-3
Preset Cost: $50,000 (DDP)
Actual Cost: $42,000 (FOB Shanghai)
Adjustment: Reduce by $8,000
```

### Scenario 2: European Customer, DDP Hamburg
```
Hardware: GEVLR-2
Preset Cost: $35,000 (FOB)
Actual Cost: $43,000 (DDP Hamburg with EU duties)
Adjustment: Increase by $8,000
```

### Scenario 3: Agricultural Bank of Korea
```
Hardware: GEVLR-2
Preset Cost: $35,000
Actual Cost: $35,000 (already set correctly)
No adjustment needed
```

## UI Layout

```
┌─────────────────────────────────────────┐
│ Hardware Type                           │
│ [Select hardware... ▼]                  │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Unit Cost (COGS):      $35,000     │ │ ← Always visible
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─ Analyst Mode Only ─────────────────┐ │
│ │ Unit Cost (COGS)                    │ │
│ │ [35000] $                           │ │
│ │ EXW/FOB/DDP cost varies by shipping │ │
│ │                                     │ │
│ │ Power Rating (kW)                   │ │
│ │ [4.0] kW                            │ │
│ │                                     │ │
│ │ Processing Rate (L/hr)              │ │
│ │ [42] L/hr                           │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Impact on Calculations

Unit cost affects:
1. **COGS**: Total hardware cost = unitCost × totalUnits
2. **ROI**: Higher costs reduce ROI percentage
3. **NPV**: Higher upfront costs reduce NPV
4. **Payback Period**: Higher costs extend payback time
5. **Financing**: Loan principal based on total investment including unit costs

## Benefits

### 1. Flexibility
- Adjust for any shipping arrangement
- Account for regional price variations
- Model different supplier quotes

### 2. Accuracy
- Reflect true landed costs
- Include all duties and taxes in DDP scenarios
- Compare EXW vs DDP economics

### 3. Transparency
- Clear labeling of what cost represents
- Visible to all users (editable in Analyst mode)
- Documentation explains shipping terms

### 4. Real-World Modeling
- Agricultural Bank of Korea: Can adjust for Korea-specific DDP costs
- Gulf Region: Can use lower FOB costs due to proximity
- Western Europe: Can include high EU import duties in DDP

## Testing Checklist

### Display
- [x] Unit cost box visible in Sales mode
- [x] Unit cost box visible in Analyst mode
- [x] Currency symbol updates with currency selection
- [x] Value updates when hardware preset selected

### Editing (Analyst Mode)
- [x] TextInput appears in Analyst mode
- [x] Can edit unit cost value
- [x] Description shows shipping terms guidance
- [x] Changes update calculations immediately
- [x] Value persists when switching personas

### Documentation
- [x] Comment added to presets file
- [x] Hardware preset comment updated
- [x] DEFAULT_PARAMS comment added
- [x] Clear explanation of EXW/FOB/DDP

### Build
- [x] No TypeScript errors
- [x] Vite build successful (1.30s)
- [x] All functionality working

## Files Modified
1. `components/InputPanel.tsx` - Added unit cost display box and editable input
2. `utils/presets.ts` - Added shipping terms documentation

## Build Status
✅ TypeScript compilation successful
✅ Vite build successful (1.30s)
✅ No errors or warnings
✅ Unit costs fully adjustable
