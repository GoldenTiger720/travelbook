# Reservation Edit Module

This module contains all components, utilities, types, and hooks for the Reservation Edit page functionality. The code has been modularized for better maintainability and reusability.

## Structure

### Components

- **ReservationHeader.tsx** - Header section with navigation and save button
- **ActionButtons.tsx** - Action buttons for customer, email, print, share operations
- **PurchaseOrderCard.tsx** - Displays purchase order information and customer details
- **ReservationsTable.tsx** - Table showing reservation tours with status management
- **PaymentsSection.tsx** - Payment information and management section
- **CancelReservationDialog.tsx** - Modal for canceling reservations
- **EditPaymentDialog.tsx** - Modal for editing payment details

### Hooks

- **useReservationEdit.ts** - Custom hook managing all state and logic for reservation editing

### Utils

- **utils.ts** - Utility functions for:
  - Currency formatting
  - Status color mapping
  - Payment calculations
  - Grand total calculations

### Types

- **types.ts** - TypeScript interfaces for:
  - Payment
  - NewPayment
  - CancelModalState
  - TourModalState
  - PaymentSummary

## Usage

Import components and utilities from the barrel export:

```tsx
import {
  ReservationHeader,
  ActionButtons,
  PurchaseOrderCard,
  ReservationsTable,
  PaymentsSection,
  CancelReservationDialog,
  EditPaymentDialog,
  useReservationEdit,
  calculateGrandTotal,
  getCurrencySymbol
} from '@/components/reservation-edit'
```

## Benefits

1. **Modularity** - Each component has a single responsibility
2. **Reusability** - Components can be reused in other parts of the application
3. **Maintainability** - Easier to locate and fix bugs
4. **Testability** - Each component can be tested independently
5. **Readability** - Main page file reduced from 1628 lines to 596 lines
6. **Type Safety** - Centralized type definitions

## File Size Comparison

- **Before**: ReservationEditPage.tsx - 1628 lines
- **After**: ReservationEditPage.tsx - 596 lines (63% reduction)
- **Modular Components**: 11 separate, focused files
