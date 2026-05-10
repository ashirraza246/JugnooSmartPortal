# Task 3-b: ServicesBrowser Multi-Step Flow Restructure

## Agent: Code Assistant
## Status: COMPLETED

## Summary
Restructured the ServicesBrowser component from a 4-step flow to a dynamic 9-step flow with auto-eligibility checking.

## Changes Made

### File Modified: `/home/z/my-project/src/components/customer/ServicesBrowser.tsx`

### Key Changes:

1. **New Imports**: Added `Clock` and `Info` icons from lucide-react

2. **New State Variables**:
   - `selectedTier` - tracks selected loan tier index
   - `loanAmount` - stores entered loan amount
   - `eligibilityResult` - stores auto-eligibility check result ('eligible' | 'possibly-ineligible' | null)
   - `showEligibilityDialog` - controls eligibility warning dialog visibility
   - `eligibilityReason` - stores reason for ineligibility

3. **Dynamic Step Count**:
   - `isLoanService` computed from `selectedService?.category === 'loan'`
   - `totalSteps = isLoanService ? 9 : 7` (skips loan tiers and loan amount for non-loan services)

4. **New Translation Labels**: Added step labels for Eligibility, Deadlines, Loan Tiers, Loan Amount, Important Details in both Urdu and Roman Urdu

5. **New Steps** (1-5):
   - Step 1: Eligibility Criteria (Shield icon) - shows eligibility text from govt-services-data
   - Step 2: Deadlines (Clock icon) - shows deadline data with green/amber badges
   - Step 3: Loan Tiers (Banknote icon) - ONLY for loan services, tier selection cards
   - Step 4: Loan Amount (Wallet icon) - ONLY for loan services, number input with validation
   - Step 5: Important Details (Info icon) - processing time, fee info, special notes, official URL, apply process

6. **Renumbered Existing Steps** (6-9):
   - Step 6: Personal Details (was Step 1)
   - Step 7: Required Documents (was Step 2)
   - Step 8: Payment (was Step 3) - screenshot now MANDATORY
   - Step 9: Review & Submit (was Step 4)

7. **Auto-Eligibility Analysis**:
   - Runs after Step 6 (Personal Details) is filled and user clicks Next
   - Checks income thresholds (25K, 50K limits)
   - Checks age for loans (18-45 range)
   - Checks government employee restrictions
   - Shows GREEN/RED dialog banner
   - User can still proceed even if RED

8. **Dynamic Step Indicator**: Shows different steps based on loan/non-loan service type

9. **goNext/goPrev**: Handle step skipping for non-loan services (skip steps 3-4)

10. **validateStep()**: Updated for new step numbers with loan tier/amount validation and mandatory payment screenshot

11. **Review & Submit**: Enhanced to show eligibility result, loan tier info, and loan amount

12. **Payment Screenshot**: Now mandatory with error message if not uploaded

## Verification
- No lint errors in the modified file
- Dev server compiles and serves successfully
- All existing functionality preserved
