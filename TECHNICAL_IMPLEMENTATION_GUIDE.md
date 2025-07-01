# Technical Implementation Guide

*Companion to the Design Manifesto - Implementation Standards & Patterns*

---

## Component Architecture

### Base Component Structure
```jsx
// Standard component pattern
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

const ComponentName = ({ data, onAction }) => {
  // 1. Early returns for loading/error states
  if (!data) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  
  // 2. Data transformation
  const processedData = transformData(data);
  
  // 3. Render with proper accessibility
  return (
    <Card className="bg-white border-gray-200">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Component Title
        </h3>
        {/* Component content */}
      </CardContent>
    </Card>
  );
};

export default ComponentName;
```

### Status Component Pattern
```jsx
// Reusable status indicator
const StatusIndicator = ({ status, score, details }) => {
  const getStatusConfig = (status) => {
    const configs = {
      excellent: { color: 'green', bg: 'bg-green-100', text: 'text-green-600' },
      'on-track': { color: 'blue', bg: 'bg-blue-100', text: 'text-blue-600' },
      caution: { color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-600' },
      warning: { color: 'orange', bg: 'bg-orange-100', text: 'text-orange-600' },
      critical: { color: 'red', bg: 'bg-red-100', text: 'text-red-600' },
    };
    return configs[status] || { color: 'gray', bg: 'bg-gray-100', text: 'text-gray-600' };
  };

  const config = getStatusConfig(status);

  return (
    <div className={`p-2 rounded-lg ${config.bg}`}>
      <div className={`text-lg font-semibold ${config.text}`}>
        {status}
      </div>
      {score && <div className="text-xs text-gray-500">Score: {score}/100</div>}
      {details && <div className="text-xs text-gray-500 mt-1">{details[0]}</div>}
    </div>
  );
};
```

---

## Data Visualization Components

### Chart Wrapper Pattern
```jsx
// Consistent chart container
const ChartContainer = ({ title, children, isEmpty, emptyMessage }) => {
  if (isEmpty) {
    return (
      <Card className="h-full bg-gray-50 border border-gray-200">
        <CardContent className="h-full flex flex-col items-center justify-center p-8">
          <div className="text-4xl mb-3 text-gray-400">📊</div>
          <div className="font-medium text-gray-700 mb-1 text-center">{title}</div>
          <div className="text-sm text-gray-500 text-center max-w-xs">{emptyMessage}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-gray-200">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        {children}
      </CardContent>
    </Card>
  );
};
```

### Data Formatting Utilities
```jsx
// utils/formatters.js
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  
  return `${value.toFixed(decimals)}%`;
};

export const formatLargeNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export const formatDate = (date, format = 'MMM YYYY') => {
  return moment(date).format(format);
};
```

---

## State Management Patterns

### Custom Hook Pattern
```jsx
// hooks/useFinancialData.js
import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

export const useFinancialData = (endpoint, params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get(endpoint, { params });
      setData(response);
    } catch (err) {
      setError(err.message);
      console.error(`Error fetching ${endpoint}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(params)]);

  return { data, loading, error, refetch: fetchData };
};
```

### Context Pattern for Shared State
```jsx
// context/FinancialContext.js
import React, { createContext, useContext, useReducer } from 'react';

const FinancialContext = createContext();

const initialState = {
  selectedDate: moment().subtract(1, 'months'),
  dashboardData: null,
  loading: false,
  error: null,
};

const financialReducer = (state, action) => {
  switch (action.type) {
    case 'SET_DATE':
      return { ...state, selectedDate: action.payload };
    case 'SET_DATA':
      return { ...state, dashboardData: action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

export const FinancialProvider = ({ children }) => {
  const [state, dispatch] = useReducer(financialReducer, initialState);

  return (
    <FinancialContext.Provider value={{ state, dispatch }}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within FinancialProvider');
  }
  return context;
};
```

---

## Form Patterns

### Form Validation Pattern
```jsx
// components/forms/ValidatedForm.jsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ValidatedForm = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name, value) => {
    const validations = {
      amount: (val) => val > 0 ? null : 'Amount must be greater than 0',
      description: (val) => val.trim().length > 0 ? null : 'Description is required',
      date: (val) => val ? null : 'Date is required',
    };

    return validations[name] ? validations[name](value) : null;
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={formData.amount || ''}
          onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
          className={errors.amount ? 'border-red-500' : ''}
        />
        {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
      </div>
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save'}
      </Button>
    </form>
  );
};
```

---

## Error Handling Patterns

### Error Boundary
```jsx
// components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6 text-center">
            <div className="text-red-600 text-2xl mb-2">⚠️</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
```

### API Error Handling
```jsx
// api/errorHandler.js
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        return 'Please log in to continue';
      case 403:
        return 'You don\'t have permission to perform this action';
      case 404:
        return 'The requested resource was not found';
      case 422:
        return data.message || 'Please check your input and try again';
      case 500:
        return 'Server error. Please try again later';
      default:
        return data.message || 'An unexpected error occurred';
    }
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection';
  } else {
    // Other error
    return error.message || 'An unexpected error occurred';
  }
};
```

---

## Performance Optimization

### Memoization Patterns
```jsx
// Optimized component with memoization
import React, { useMemo, useCallback } from 'react';

const OptimizedChart = React.memo(({ data, onDataPointClick }) => {
  // Memoize expensive calculations
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      percentage: (item.value / data.reduce((sum, d) => sum + d.value, 0)) * 100
    }));
  }, [data]);

  // Memoize callback functions
  const handleClick = useCallback((item) => {
    onDataPointClick(item);
  }, [onDataPointClick]);

  return (
    <div>
      {processedData.map(item => (
        <div key={item.id} onClick={() => handleClick(item)}>
          {item.label}: {item.percentage.toFixed(1)}%
        </div>
      ))}
    </div>
  );
});
```

### Lazy Loading Pattern
```jsx
// Lazy load heavy components
import React, { Suspense } from 'react';

const HeavyChart = React.lazy(() => import('./HeavyChart'));

const Dashboard = () => {
  return (
    <div>
      <Suspense fallback={<ChartSkeleton />}>
        <HeavyChart />
      </Suspense>
    </div>
  );
};
```

---

## Testing Patterns

### Component Testing
```jsx
// __tests__/components/StatusIndicator.test.jsx
import { render, screen } from '@testing-library/react';
import StatusIndicator from '../StatusIndicator';

describe('StatusIndicator', () => {
  it('renders correct status with appropriate styling', () => {
    render(<StatusIndicator status="excellent" score={95} />);
    
    expect(screen.getByText('excellent')).toBeInTheDocument();
    expect(screen.getByText('Score: 95/100')).toBeInTheDocument();
  });

  it('handles missing data gracefully', () => {
    render(<StatusIndicator status="no-data" />);
    
    expect(screen.getByText('no-data')).toBeInTheDocument();
  });
});
```

### Hook Testing
```jsx
// __tests__/hooks/useFinancialData.test.js
import { renderHook, waitFor } from '@testing-library/react';
import { useFinancialData } from '../useFinancialData';

describe('useFinancialData', () => {
  it('fetches data successfully', async () => {
    const { result } = renderHook(() => useFinancialData('/test-endpoint'));
    
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.data).toBeDefined();
  });
});
```

---

## Accessibility Implementation

### ARIA Patterns
```jsx
// Accessible chart component
const AccessibleChart = ({ data, title }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div role="region" aria-label={title}>
      <h3 id="chart-title">{title}</h3>
      <div role="list" aria-labelledby="chart-title">
        {data.map((item, index) => (
          <div
            key={item.id}
            role="listitem"
            aria-label={`${item.label}: ${formatCurrency(item.value)} (${((item.value / total) * 100).toFixed(1)}%)`}
          >
            <span className="sr-only">
              {item.label}: {formatCurrency(item.value)} - {((item.value / total) * 100).toFixed(1)}% of total
            </span>
            {/* Visual chart element */}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Keyboard Navigation
```jsx
// Keyboard accessible interactive elements
const KeyboardAccessibleList = ({ items, onSelect }) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const handleKeyDown = (e, index) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(Math.min(index + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(Math.max(index - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect(items[index]);
        break;
    }
  };

  return (
    <div role="listbox" aria-label="Selectable items">
      {items.map((item, index) => (
        <div
          key={item.id}
          role="option"
          tabIndex={focusedIndex === index ? 0 : -1}
          aria-selected={focusedIndex === index}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onClick={() => onSelect(item)}
          className={`p-2 cursor-pointer ${
            focusedIndex === index ? 'bg-blue-100' : 'hover:bg-gray-100'
          }`}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
};
```

---

## Code Quality Standards

### ESLint Configuration
```json
// .eslintrc.json
{
  "extends": [
    "react-app",
    "react-app/jest"
  ],
  "rules": {
    "react/prop-types": "error",
    "react/jsx-key": "error",
    "react/jsx-no-duplicate-props": "error",
    "react/jsx-no-undef": "error",
    "react/no-array-index-key": "warn",
    "react/no-unused-state": "error",
    "react/no-unused-prop-types": "error",
    "react/self-closing-comp": "error",
    "react/sort-comp": "error",
    "react/jsx-sort-props": "error"
  }
}
```

### Prettier Configuration
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "jsxBracketSameLine": false,
  "arrowParens": "avoid"
}
```

---

## Documentation Standards

### Component Documentation
```jsx
/**
 * StatusIndicator - Displays financial health status with color coding
 * 
 * @component
 * @param {Object} props
 * @param {string} props.status - Status level ('excellent', 'on-track', 'caution', 'warning', 'critical')
 * @param {number} [props.score] - Numerical score (0-100)
 * @param {string[]} [props.details] - Additional details or insights
 * @param {Function} [props.onClick] - Click handler for interactive status
 * 
 * @example
 * <StatusIndicator 
 *   status="excellent" 
 *   score={95} 
 *   details={["All categories within healthy limits"]}
 * />
 */
const StatusIndicator = ({ status, score, details, onClick }) => {
  // Component implementation
};
```

### API Documentation
```jsx
/**
 * Fetches dashboard data for a specific month
 * 
 * @async
 * @param {string} yearMonth - Format: 'YYYY-MM' (e.g., '2024-01')
 * @returns {Promise<Object>} Dashboard data including:
 *   - total_income: {number} Total income for the month
 *   - total_expenses: {number} Total expenses for the month
 *   - financial_status: {Object} Health status and score
 *   - budget_categories: {Array} Budget progress by category
 * 
 * @throws {Error} When API request fails
 * 
 * @example
 * const data = await fetchDashboardData('2024-01');
 * console.log(data.financial_status.status); // 'excellent'
 */
export const fetchDashboardData = async (yearMonth) => {
  // Implementation
};
```

---

## Deployment & CI/CD

### Build Optimization
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts', 'd3'],
          utils: ['moment', 'lodash'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'recharts'],
  },
});
```

### Environment Configuration
```javascript
// config/environment.js
const config = {
  development: {
    apiUrl: 'http://localhost:8000',
    enableDebug: true,
    logLevel: 'debug',
  },
  staging: {
    apiUrl: 'https://api-staging.financetracker.com',
    enableDebug: false,
    logLevel: 'info',
  },
  production: {
    apiUrl: 'https://api.financetracker.com',
    enableDebug: false,
    logLevel: 'error',
  },
};

export default config[process.env.NODE_ENV] || config.development;
```

---

*This technical guide should be used in conjunction with the Design Manifesto to ensure consistent, high-quality implementation across the entire application.* 