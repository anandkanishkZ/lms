# Batch Status Revert Feature

## Overview
Added the ability to revert batch status changes, preventing accidental status updates from being permanent.

## Problem Solved
Previously, if an admin accidentally clicked to move a batch from PLANNING → ACTIVE → COMPLETED, there was **no way to revert it back**. The status could only move forward in the flow.

## Solution Implemented

### 1. **Revert to Previous Status Button** (Orange Button)
- Appears when there's a previous status available
- Allows one-step backward movement in status flow
- Shows confirmation dialog before reverting
- Example: If status is COMPLETED, can revert to ACTIVE

### 2. **Change Status Dropdown** (Flexible Manual Override)
- Allows jumping to **any status** in the flow
- Provides full control for edge cases
- Shows all available statuses with color badges
- Current status is disabled and marked as "(Current)"
- Confirmation dialog prevents accidental changes

## Status Flow
```
PLANNING → ACTIVE → COMPLETED → GRADUATED → ARCHIVED
   ↑         ↑          ↑            ↑           ↑
   └─────────┴──────────┴────────────┴───────────┘
        (Can now revert or jump to any status)
```

## UI Changes

### Batch Detail Page Header
Now displays **three types of status controls**:

1. **"Move to [Next Status]"** (Blue Button)
   - Forward progression in status flow
   - Example: "Move to ACTIVE" when status is PLANNING

2. **"Revert to [Previous Status]"** (Orange Button)  ← NEW
   - Backward movement in status flow
   - Example: "Revert to PLANNING" when status is ACTIVE
   - Shows confirmation: "Are you sure you want to revert status back to PLANNING?"

3. **"Change Status"** (Dropdown with all statuses)  ← NEW
   - Flexible manual override
   - Can jump to any status (e.g., GRADUATED → PLANNING)
   - Current status is grayed out and disabled
   - Shows confirmation: "Are you sure you want to change status to [STATUS]?"

## Use Cases

### Accidental Forward Movement
**Scenario:** Admin accidentally clicked "Move to ACTIVE" when batch was in PLANNING
- **Solution:** Click "Revert to PLANNING" button (orange)
- **Result:** Batch status reverts to PLANNING immediately after confirmation

### Multiple Accidental Clicks
**Scenario:** Admin accidentally advanced from PLANNING → ACTIVE → COMPLETED
- **Solution:** Click "Revert to ACTIVE" (goes back one step), then "Revert to PLANNING" (goes back another step)
- **Alternative:** Use "Change Status" dropdown → Select "PLANNING" (jumps directly)

### Batch Needs Re-opening
**Scenario:** Batch was graduated but needs to be re-opened for additional classes
- **Solution:** Use "Change Status" dropdown → Select desired status (e.g., ACTIVE)
- **Result:** Batch status changes with confirmation

### Testing/Demo Purposes
**Scenario:** Need to test different status views without creating new batches
- **Solution:** Use "Change Status" dropdown to quickly switch between any statuses

## Safety Features

### 1. **Confirmation Dialogs**
- All status changes (forward, backward, or jump) require confirmation
- Prevents accidental clicks from changing critical data
- Clear message shows which status will be applied

### 2. **Visual Indicators**
- Current status shows as disabled in dropdown
- Status badges use color coding for quick recognition
- Button colors indicate action type (blue=forward, orange=revert)

### 3. **Disabled Current Status**
- Cannot select current status from dropdown
- Shows "(Current)" label for clarity

## Technical Implementation

### New Functions Added
```typescript
// Get previous status in flow (for reverting)
const getPreviousStatus = (): BatchStatus | null => {
  if (!batch) return null;
  const currentIndex = statusFlow.indexOf(batch.status);
  if (currentIndex === -1 || currentIndex === 0) return null;
  return statusFlow[currentIndex - 1];
};
```

### State Management
```typescript
const [showStatusDropdown, setShowStatusDropdown] = useState(false);
```

### API Integration
Uses existing `batchApiService.updateBatchStatus()` endpoint - no backend changes needed!

## Fixed Issues
1. ✅ **Optional endDate handling** - Shows "TBD" if endDate is not set
2. ✅ **Undefined statistics properties** - Added null checks for completionRate and passRate
3. ✅ **Missing revert functionality** - Added both one-step revert and flexible status dropdown

## Testing Checklist
- [ ] Test forward status progression (PLANNING → ACTIVE → COMPLETED)
- [ ] Test revert button (COMPLETED → ACTIVE → PLANNING)
- [ ] Test status dropdown (jump from any status to any other status)
- [ ] Test confirmation dialogs appear for all changes
- [ ] Test current status is disabled in dropdown
- [ ] Test clicking outside dropdown closes it
- [ ] Test status updates refresh page data correctly
- [ ] Test with batches that have endDate = null

## Benefits
- **Flexibility:** Admins can fix mistakes easily
- **Safety:** Confirmation dialogs prevent accidents
- **Control:** Full status management from any state
- **User-Friendly:** Clear visual feedback and intuitive UI
- **No Breaking Changes:** Uses existing API, backward compatible

## Migration Notes
- No database changes required
- No API changes required
- Frontend-only enhancement
- Backward compatible with existing data
