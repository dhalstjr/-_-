# Multi‑Price Option Refactor

## Goal
Redesign the item row to support an unlimited number of price options, replace the fragile `convertToGroups` parsing with direct DOM extraction, and update the backup/load flow while preserving all existing features (accordion settings, layout branching, responsive rendering).

## Scope
- **HTML**: Change `.item-row` grid layout, add a `.price-options-wrapper` containing a `.price-option-list` and an *Add Price Option* button.
- **CSS**: Adjust grid columns, style the new price‑option rows and the add‑button.
- **JS**:
  1. Add `createPriceOption(unit = "", price = "")` that returns a `.price‑option‑row` element.
  2. Update `createItemRow` (now `addItemRow`) to build the new structure and accept an optional `rows` array for restoration.
  3. Remove `convertToGroups`; implement `extractGroupsFromDOM()` used by `generateImages` to build the `groups` array directly from the DOM.
  4. Update `saveProject` / `loadProject` to persist and restore the nested `rows` array.
  5. Ensure `debouncedGenerateImages` is called after any price‑option add/remove.
  6. Verify Canvas rendering logic for multiple price rows (height calculations already use `row.rowHeight`). No changes to `drawSingleCanvas` are required beyond confirming it reads `group.rows` correctly.

## Open Questions (User Review Required)
- **Default price‑option layout**: When a new item row is created without explicit `rows`, should it start with a single empty price option? (Recommended: yes, for UX consistency.)
- **Maximum width for price‑option inputs**: We will use `width: 90px` for the unit input and `width: 120px` for the price input. Confirm if these sizes match the design system.
- **Data migration**: Existing projects stored with the old flat `price`/`unit` fields will be loaded. Should we attempt to auto‑migrate them to a single‑element `rows` array, or treat them as legacy and create one price option from the old fields? (Recommended: auto‑migrate.)

## Verification Plan
- **Unit tests**: Manually add/remove price options, save and load a project, and ensure the UI state matches the saved JSON.
- **Canvas rendering**: Generate images with items that have multiple price options and verify no overlap and correct vertical centering.
- **Regression**: Verify that existing features (accordion toggle, layout switch, undo snackbar, drag‑and‑drop) continue to work.

---

*Please review the open questions above. Once approved, we will proceed with the implementation.*
