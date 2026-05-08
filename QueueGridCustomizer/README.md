# QueueGridCustomizer

**Version:** 0.0.1  
**Namespace:** `pl.controls`  
**Control Type:** Standard PCF (Power Apps Component Framework)

## Purpose

QueueGridCustomizer is a Power Apps grid customizer PCF that enhances the visual display of queue-related data in model-driven app grids. It hooks into the PA OneGrid framework via a configurable event name, injecting custom cell renderers that add contextual icons and color-coded formatting to specific columns.

## How It Works

On initialization, the control fires a named event (configured via the `EventName` input property) and passes a `PAOneGridCustomizer` payload containing cell renderer overrides. These overrides apply custom rendering logic to grid cells based on column identity, without replacing the underlying data.

## Main Components

### `index.ts` — Control Entry Point
Implements the `ComponentFramework.StandardControl` interface. On `init`, it reads the `EventName` property, builds the customizer object, and fires the event into the grid framework so the overrides are registered.

### `QueueGridCustomizer/customizers/CellRendererOverrides.tsx` — Cell Rendering Logic
Contains all custom rendering logic applied to grid cells:

- **Origin column** — Detects columns named or displaying as "Origin" and prepends a contextual icon based on the cell value:
  - `Phone` → ☎ (blue)
  - `Mail` → ✉ (blue)
  - `Online` → ◉ (blue)
- **Entered Queue column** — Detects columns named or displaying as "Entered Queue" and colors the date text:
  - Current year (2026) → green (`#1a7f37`)
  - Prior years → red (`#cf222e`)

Overrides are registered for all text-based column types: `Text`, `OptionSet`, `Multiple`, `DateAndTime`, and `DateOnly`.

### `QueueGridCustomizer/types.ts` — Type Definitions
Defines the shared TypeScript interfaces used across the control:
- `ColumnDefinition` / `GetRendererParams` — describe column metadata passed to renderers
- `CellRendererProps` — the value and formatted value for a cell
- `CellRendererOverrides` — map of column data types to renderer functions
- `PAOneGridCustomizer` — the payload interface fired into the grid framework

### `QueueGridCustomizer/ControlManifest.Input.xml` — Control Manifest
Declares the control metadata, namespace, version, and the single input property:
- **`EventName`** *(required, SingleLine.Text)* — the event name used to register the customizer with the hosting grid.

