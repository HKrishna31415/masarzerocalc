# Goal Seek Ceiling Fix and Lease Analysis Enhancement

## Changes Applied

### 1. Goal Seek Lease Term - Ceiling Function Fix
**File**: `components/GoalSeekAnalysis.tsx`

Fixed the lease term Goal Seek algorithm to use ceiling function instead of floor when crossing the target value.

**Issue**: When year 11 is negative and year 12 is positive, the algorithm was using floor logic (returning 11), but should return 12 (ceiling) since you need the full year to achieve the target.

**Solution**: Changed the crossing detection logic to always return `currentYear` (the ceiling) when the target is crossed:

```typescript
// If we crossed the target, return the ceiling (current year)
if ((prevVal < targetValue && val > targetValue) || (prevVal > targetValue && val < targetValue)) {
    // For lease term, always use ceiling (current year) since you need the full year
    finish(currentYear, true, currentYear - low + 1);
    return;
}
```

This ensures that when the NPV/IRR crosses from negative to positive between years, we return the year where it becomes positive (the ceiling), not the previous year.

### 2. Lease Analysis - Parameters Display
**File**: `components/LeaseAnalysis.tsx`

Added a new "Parameters Used" card in the Lease Analysis section to show users what parameters are being used for the calculations.

**Parameters Displayed**:
- Gasoline Price ($/L)
- Revenue Share (%)
- Lease Term (years)
- Unit Cost/COGS ($)
- Electricity Price ($/kWh)
- Volume Growth Rate (%/yr)
- Discount Rate (%)
- Inflation Rate (%)

This gives users full transparency into the assumptions driving the station-by-station calculations, making it easier to understand and validate the results.

### 3. Settings Icon Change
**File**: `components/Sidebar.tsx`

Changed the Settings/Assumptions page icon from sliders (SlidersIcon) to a gear (CogIcon) for better visual clarity and standard UX conventions.

**Changes**:
- Imported `CogIcon` from icons
- Replaced both instances of `<SlidersIcon className="w-5 h-5"/>` with `<CogIcon className="w-5 h-5"/>` (mobile and desktop sidebars)

## Testing Notes

### Goal Seek Ceiling Test
Test with Agricultural Bank of Korea preset:
- 288 stations
- $15k unit cost
- $500 maintenance
- $0.13/kWh electricity
- $0.54/L gasoline price
- 3-year term

Run Goal Seek for lease term targeting positive NPV. If year 11 is negative and year 12 is positive, it should now correctly return 12 years.

### Lease Analysis Parameters
Navigate to Lease Analysis section and verify the new "Parameters Used" card displays all key parameters from the dashboard/settings.

### Settings Icon
Check both mobile and desktop sidebars - the Settings navigation item should now show a gear icon instead of sliders.

## Files Modified
1. `components/GoalSeekAnalysis.tsx` - Fixed ceiling logic for lease term
2. `components/LeaseAnalysis.tsx` - Added parameters display card
3. `components/Sidebar.tsx` - Changed settings icon to gear

## Status
✅ All changes applied successfully
✅ No TypeScript errors
✅ Ready for testing
