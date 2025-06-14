# Transactions Components Organization

This document outlines the reorganized structure of the transactions components for better maintainability and code reuse.

## New Structure

```
src/components/transactions/
├── components/
│   ├── table/                    # Table-related components
│   │   ├── TransactionTable.jsx       # Main table component
│   │   ├── TransactionTableHeader.jsx # Table header with sorting
│   │   ├── TransactionTableRow.jsx    # Individual table row
│   │   └── index.js                   # Exports
│   ├── views/                    # Different view components
│   │   ├── TransactionDetailsView.jsx # Consolidated transaction details
│   │   └── index.js                   # Exports
│   ├── EmptyState.jsx           # Empty state component
│   ├── FileUploadComponent.jsx  # File upload functionality
│   ├── RecurrenceView.jsx       # Recurring transactions view
│   ├── RecurringTransactionsList.jsx
│   ├── ShareView.jsx            # Share transaction view
│   ├── SplitItem.jsx           # Split item component
│   ├── SplitView.jsx           # Split transaction view
│   ├── TransactionDialog.jsx   # Main transaction dialog
│   ├── TransactionImportDialog.jsx
│   ├── TransactionManager.jsx  # Transaction manager (updated)
│   └── TransactionsList.jsx    # Main list component (updated)
├── context/
│   ├── SplitViewContext.js     # Split view context
│   └── TransactionContext.js   # New centralized context
├── hooks/
│   ├── useSplitCalculations.js
│   ├── useTransactionListManager.js
│   ├── useTransactionManager.js
│   ├── useTransactions.js
│   └── useTransactionsImport.jsx
└── utils/
    ├── transactionHelpers.js   # Shared utility functions
    └── index.js                # Exports
```

## Key Changes

### 1. Shared Utilities (`utils/transactionHelpers.js`)
- Consolidated repeated utility functions across components
- Functions include: `formatCurrency`, `getCategoryName`, `isSharedTransaction`, `isSplitTransaction`, etc.
- Eliminates code duplication and ensures consistency

### 2. Table Components Reorganization (`components/table/`)
- `TransactionTable.jsx` - Main table wrapper (replaces `TransactionsTable.jsx`)
- `TransactionTableHeader.jsx` - Extracted and improved header component
- `TransactionTableRow.jsx` - Enhanced row component using shared utilities

### 3. View Components (`components/views/`)
- `TransactionDetailsView.jsx` - Consolidated view component (replaces `TransactionView.jsx`)
- Better organized with helper components for actions and indicators
- Improved mobile responsiveness

### 4. Centralized Context (`context/TransactionContext.js`)
- New centralized state management for transaction-related operations
- Reduces prop drilling and improves state consistency
- Can be used alongside existing contexts

## Benefits

1. **Reduced Code Duplication**: Shared utilities eliminate repeated functions
2. **Better Organization**: Logical grouping of related components
3. **Improved Maintainability**: Easier to find and modify specific functionality
4. **Consistent Behavior**: Shared utilities ensure consistent behavior across components
5. **Enhanced Testability**: Smaller, focused components are easier to test

## Migration Notes

### Old vs New Imports

**Old:**
```javascript
import { TransactionsTable } from './TransactionsTable';
import { TransactionRow } from './TransactionRow';
import TransactionView from './TransactionView';
```

**New:**
```javascript
import { TransactionTable } from './table/TransactionTable';
import { TransactionTableRow } from './table/TransactionTableRow';
import { TransactionDetailsView } from './views/TransactionDetailsView';
// Or using index exports:
import { TransactionTable, TransactionTableRow } from './table';
import { TransactionDetailsView } from './views';
```

### Deprecated Files

The following files have been replaced and can be removed after testing:
- `TransactionsTable.jsx` → `table/TransactionTable.jsx`
- `TransactionRow.jsx` → `table/TransactionTableRow.jsx`
- `TransactionTableHeader.jsx` → `table/TransactionTableHeader.jsx`
- `TransactionView.jsx` → `views/TransactionDetailsView.jsx`

## Usage Examples

### Using Shared Utilities
```javascript
import { formatCurrency, getCategoryName, isSharedTransaction } from '../utils/transactionHelpers';

const amount = formatCurrency(transaction.amount);
const categoryName = getCategoryName(transaction);
const isShared = isSharedTransaction(transaction);
```

### Using New Table Components
```javascript
import { TransactionTable } from './table/TransactionTable';

<TransactionTable
  transactions={transactions}
  categories={categories}
  editMode={editMode}
  onEdit={handleEdit}
  onTransactionClick={handleTransactionClick}
  onRequestSort={handleRequestSort}
/>
```

### Using New Transaction Context
```javascript
import { TransactionProvider, useTransactionContext } from '../context/TransactionContext';

// In parent component
<TransactionProvider>
  <TransactionsList />
</TransactionProvider>

// In child component
const { transactions, setTransactions, editMode, setEditMode } = useTransactionContext();
```