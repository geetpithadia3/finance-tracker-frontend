# Development Guide - Cove Finance Tracker Frontend

This guide provides detailed information for developers working on the Cove Finance Tracker frontend application.

## 🛠️ Development Environment Setup

### Prerequisites
- Node.js 18.0 or higher
- npm 8.0 or higher (or yarn)
- Git
- Code editor (VS Code recommended)

### Quick Setup
Run the setup script to automatically configure your development environment:

```bash
./setup.sh
```

For quick setup without checks:
```bash
./setup.sh --quick
```

### Manual Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd financetracker-frontend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your specific configuration
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🏗️ Architecture Overview

### Project Structure
```
src/
├── components/           # React components
│   ├── ui/              # Base UI components (Shadcn/ui)
│   ├── dashboard/       # Dashboard feature
│   ├── transactions/    # Transaction management
│   ├── budget/          # Budget planning
│   ├── account/         # Account management
│   ├── allocation/      # Smart allocation
│   ├── configuration/   # Settings
│   └── split/           # Transaction splitting
├── api/                 # API client and services
├── hooks/               # Custom React hooks
├── context/             # React Context providers
├── utils/               # Utility functions
├── styles/              # Styled components
├── types/               # TypeScript definitions
└── lib/                 # Library configurations
```

### Technology Stack
- **React 18** - Component library with hooks and concurrent features
- **Vite** - Build tool and development server
- **TypeScript** - Type safety (partial adoption)
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Component library
- **Material-UI** - Additional components
- **TanStack Table** - Advanced table functionality
- **Chart.js/Recharts** - Data visualization

## 🔧 Development Workflow

### Git Workflow
1. Create feature branch from main: `git checkout -b feature/feature-name`
2. Make changes and commit: `git commit -m "descriptive message"`
3. Push branch: `git push origin feature/feature-name`
4. Create pull request
5. Code review and merge

### Code Quality
Run before committing:
```bash
npm run lint          # Check linting
npm run lint:fix      # Auto-fix linting issues
npm run type-check    # TypeScript type checking
npm run test          # Run tests
```

### Git Hooks
Husky is configured to run pre-commit hooks:
- ESLint checking
- TypeScript type checking
- Formatting validation

## 🎨 UI Development Guidelines

### Component Development
1. **Use Shadcn/ui components** as the base
2. **Follow composition pattern** - compose complex components from simpler ones
3. **Implement proper TypeScript types** for all props
4. **Use custom hooks** for business logic
5. **Follow accessibility guidelines** (WCAG 2.1)

### Styling Guidelines
1. **Prefer Tailwind utility classes** over custom CSS
2. **Use CSS variables** for theming
3. **Implement responsive design** with mobile-first approach
4. **Follow design system** color palette and spacing

### Example Component Structure
```tsx
// Good component structure
interface ComponentProps {
  title: string;
  onAction: () => void;
  variant?: 'primary' | 'secondary';
}

export const MyComponent: React.FC<ComponentProps> = ({
  title,
  onAction,
  variant = 'primary'
}) => {
  const { data, loading } = useCustomHook();
  
  return (
    <Card className={cn(
      "p-4 rounded-lg",
      variant === 'primary' ? "bg-primary" : "bg-secondary"
    )}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton /> : <DataDisplay data={data} />}
      </CardContent>
      <CardFooter>
        <Button onClick={onAction}>Action</Button>
      </CardFooter>
    </Card>
  );
};
```

## 🔌 API Integration

### API Client Structure
```
src/api/
├── client.js           # Base HTTP client
├── config.js           # API configuration
├── smartClient.js      # Smart retry client
├── transactions.js     # Transaction endpoints
├── budgets.js          # Budget endpoints
├── categories.js       # Category endpoints
├── accounts.js         # Account endpoints
└── income.js           # Income endpoints
```

### Adding New API Endpoints
1. **Create service file** in `src/api/`
2. **Define API functions** with proper error handling
3. **Add TypeScript types** for request/response
4. **Use smart client** for retry logic
5. **Handle loading states** in components

### Example API Service
```javascript
// src/api/newFeature.js
import { smartClient } from './smartClient';

export const newFeatureApi = {
  getItems: async () => {
    return smartClient.get('/new-feature/items');
  },
  
  createItem: async (data) => {
    return smartClient.post('/new-feature/items', data);
  },
  
  updateItem: async (id, data) => {
    return smartClient.put(`/new-feature/items/${id}`, data);
  },
  
  deleteItem: async (id) => {
    return smartClient.delete(`/new-feature/items/${id}`);
  }
};
```

## 🪝 Custom Hooks

### Creating Custom Hooks
1. **Extract business logic** from components
2. **Handle loading and error states**
3. **Provide proper TypeScript types**
4. **Follow React hooks rules**

### Example Custom Hook
```tsx
// src/hooks/useNewFeature.js
import { useState, useEffect } from 'react';
import { newFeatureApi } from '../api/newFeature';

export const useNewFeature = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await newFeatureApi.getItems();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createItem = async (itemData) => {
    try {
      const newItem = await newFeatureApi.createItem(itemData);
      setData(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    data,
    loading,
    error,
    createItem,
    refetch: fetchData
  };
};
```

## 🧪 Testing

### Testing Strategy
1. **Unit tests** for utility functions
2. **Component tests** for UI components
3. **Integration tests** for API interactions
4. **E2E tests** for critical user flows (future)

### Running Tests
```bash
npm run test              # Run all tests
npm run test:coverage     # Run with coverage
npm run test:watch        # Watch mode
```

### Example Component Test
```javascript
// src/components/__tests__/MyComponent.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders with title', () => {
    render(<MyComponent title="Test Title" onAction={() => {}} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('calls onAction when button clicked', () => {
    const mockAction = jest.fn();
    render(<MyComponent title="Test" onAction={mockAction} />);
    
    fireEvent.click(screen.getByText('Action'));
    expect(mockAction).toHaveBeenCalled();
  });
});
```

## 🎯 Performance Optimization

### Best Practices
1. **Use React.memo** for expensive components
2. **Implement code splitting** with lazy loading
3. **Optimize bundle size** with tree shaking
4. **Cache API responses** appropriately
5. **Use virtual scrolling** for large lists

### Bundle Analysis
```bash
npm run build
npx vite-bundle-analyzer dist
```

### Performance Monitoring
- Use React DevTools Profiler
- Monitor Core Web Vitals
- Analyze bundle size regularly

## 🐛 Debugging

### Development Tools
1. **React Developer Tools** - Component inspection
2. **Redux DevTools** - State management (if used)
3. **Network tab** - API request monitoring
4. **Vite DevTools** - Build analysis

### Common Debugging Scenarios

**API Issues**
- Check network tab for request/response
- Verify backend is running on port 8080
- Check proxy configuration in `vite.config.ts`

**Styling Issues**
- Use browser dev tools to inspect CSS
- Check Tailwind class conflicts
- Verify theme variables

**State Issues**
- Use React DevTools to inspect component state
- Add console.logs in custom hooks
- Check context providers

## 🚀 Build and Deployment

### Development Build
```bash
npm run build          # Standard build
npm run build:prod     # Production optimized build
npm run preview        # Preview production build
```

### Environment Configuration
Create environment-specific files:
- `.env.development` - Development environment
- `.env.staging` - Staging environment
- `.env.production` - Production environment

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 📝 Code Style Guide

### TypeScript Guidelines
1. **Use strict mode** - Enable strict TypeScript checking
2. **Define interfaces** for all data structures
3. **Use enums** for constants with multiple values
4. **Avoid `any` type** - Use proper types or `unknown`

### React Guidelines
1. **Use functional components** with hooks
2. **Destructure props** in function parameters
3. **Use default exports** for components
4. **Use named exports** for utilities

### File Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Hooks**: camelCase starting with 'use' (e.g., `useUserData.js`)
- **Utilities**: camelCase (e.g., `formatCurrency.js`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.js`)

## 🔧 VS Code Configuration

### Recommended Extensions
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- Auto Rename Tag
- Bracket Pair Colorizer

### Workspace Settings (.vscode/settings.json)
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  }
}
```

## 🚨 Troubleshooting

### Common Issues

**Node.js Version Issues**
```bash
# Check version
node --version

# Use nvm to manage versions
nvm install 18
nvm use 18
```

**Port Already in Use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Use different port
npm run dev -- --port 3001
```

**Module Resolution Issues**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript Errors**
```bash
# Check for type errors
npm run type-check

# Update @types packages
npm update @types/react @types/react-dom
```

## 📚 Learning Resources

### React
- [React Documentation](https://react.dev/)
- [React Hooks](https://react.dev/reference/react)
- [React Patterns](https://react.dev/learn)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### Tailwind CSS
- [Tailwind Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/)

### Vite
- [Vite Guide](https://vitejs.dev/guide/)
- [Vite Configuration](https://vitejs.dev/config/)

## 🤝 Contributing

### Before Contributing
1. Read this development guide
2. Check existing issues and PRs
3. Follow the established code style
4. Write tests for new features
5. Update documentation

### Pull Request Process
1. Create descriptive PR title and description
2. Link related issues
3. Ensure all checks pass
4. Request review from team members
5. Address review feedback

For more information, see the main README.md file.