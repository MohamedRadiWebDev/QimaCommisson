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

## Commission Rules (Waseela)

### Active Type
- Default Rate: 1.00%
- Specific Collectors:
  - كريمه هانى: 1.50%
  - Others: 1.00%
- Type Total Rate: 0.50%

### W.O Type
- Default Rate: 1.50%
- Specific Collectors:
  - كريمه هانى: 2.00%
  - Others: 1.50%
- Type Total Rate: 0.75%

## Employee Roles

- **Collector**: Uses company default rates
- **Telesales**: Commission set to 0% (unless custom rate specified)
- **Production**: Commission set to 0% (unless custom rate specified)

Custom rates override all company defaults.

## Running the Application

```bash
npm install
npm run dev
```

The application runs on port 5000.

## Recent Changes

- Initial project setup with Next.js 15, TypeScript, and TailwindCSS
- Implemented complete commission calculation system
- Added dynamic column mapping with auto-detection
- Created hierarchical data table with expand/collapse functionality
- Built employee role management with localStorage persistence
