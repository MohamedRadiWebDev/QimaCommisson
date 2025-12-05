# Commission Calculator

A dynamic full-stack Next.js 15 application for calculating collectors' commissions based on uploaded Excel files with flexible column mapping and multi-company support.

## Overview

This system processes Excel files containing payment data and calculates commissions based on company-specific rules. It supports dynamic column mapping, allowing it to work with any Excel structure.

## Key Features

- **Excel Upload**: Drag-and-drop file upload with support for .xlsx, .xls, and .csv files
- **Dynamic Column Mapping**: Map any Excel column to required fields (Payment, Type, Collector, S.V, Head)
- **Hierarchical Data Grouping**: Automatic grouping by Head → S.V → Type → Collector
- **Company Rules**: Waseela company rates with Active/W.O type-based commission calculations
- **Employee Role Management**: Assign roles (Collector, Telesales, Production) with custom rate overrides
- **localStorage Persistence**: Employee role settings are saved between sessions
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles with TailwindCSS
│   ├── layout.tsx           # Root layout with navigation
│   ├── page.tsx             # Home page
│   ├── upload/page.tsx      # Excel upload and commission calculation
│   └── roles/page.tsx       # Employee role management
├── components/
│   ├── Navigation.tsx       # Top navigation bar
│   ├── FileUploader.tsx     # Drag-and-drop file upload
│   ├── ColumnMapping.tsx    # Dynamic column mapping UI
│   ├── CompanySelector.tsx  # Company selection dropdown
│   ├── DataTable.tsx        # Hierarchical results table
│   └── RoleManager.tsx      # Employee role assignment
└── lib/
    ├── types.ts             # TypeScript type definitions
    ├── utils.ts             # Utility functions
    ├── store.ts             # Zustand state management
    ├── parseExcel.ts        # Excel file parsing with SheetJS
    ├── grouping.ts          # Data grouping logic
    └── calculator.ts        # Commission calculation with company rules
```

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: TailwindCSS 3.4
- **State Management**: Zustand 5 with localStorage persistence
- **Excel Parsing**: SheetJS (xlsx)

## Commission Rules

Commission rates are now dynamically loaded from `src/lib/companyRates.json`. The system supports multiple companies with different rate structures:

- **Raya, Waseela, Souhoola**: Unified structure with Active/W.O types and No Target/Target/Over Target levels
- **VALU, Tanmeyah**: Split structure with Active_Segments and wO_Segments
- **بنك الإسكندرية, بنك كريدي أجريكول**: Percentage-based ranges (0%-100%, 101%-125%, etc.)
- **Money_Fellows**: Complex structure with Active_Segments and CL_Segments
- **Seven**: Product-based with Ticket_Size_Segments and Revolving_Segments

### Employee Types
- **Collector**: Field collectors with higher rates
- **Tele/Telesales**: Phone-based with moderate rates
- **Production**: Fixed rates regardless of target
- **S.V (Supervisor)**: Lower percentage rates on team totals
- **Head**: Lowest percentage rates on department totals

## S.V and Head Summary Table

A dedicated summary table displays below the main results showing:
- Type (Active/W.O)
- Total Payment per type
- S.V Rate and Commission
- Head Rate and Commission

## Running the Application

```bash
npm install
npm run dev
```

The application runs on port 5000.

## Recent Changes

- December 2025: Updated commission calculation to read rates from companyRates.json
- December 2025: Added S.V and Head summary table below main results
- Initial project setup with Next.js 15, TypeScript, and TailwindCSS
- Implemented complete commission calculation system
- Added dynamic column mapping with auto-detection
- Created hierarchical data table with expand/collapse functionality
- Built employee role management with localStorage persistence
