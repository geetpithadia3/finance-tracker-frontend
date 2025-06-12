# Sumi - Mindful Financial Management

A beautifully crafted React application inspired by Japanese aesthetics for mindful financial management. Experience the art of budgeting with Sumi's elegant, minimalist interface that brings zen to your financial planning.

## 🚀 Features

### Core Functionality
- **Dashboard** - Comprehensive financial overview with interactive charts
- **Transaction Management** - Add, edit, and categorize income/expenses
- **Budget Planning** - Create and track monthly budgets with real-time alerts
- **Smart Allocation** - Automated financial distribution for upcoming expenses
- **Account Management** - Multi-account support with balance tracking
- **CSV Import** - Bulk import transactions from bank statements
- **Transaction Splitting** - Split shared expenses between multiple people
- **Recurring Transactions** - Set up and manage recurring payments
- **Category Management** - Flexible expense categorization system

### UI/UX Features
- **Dark/Light Theme** - User preference-based theming
- **Responsive Design** - Mobile-first approach for all devices
- **Interactive Charts** - Real-time financial visualizations
- **Modern UI Components** - Built with Shadcn/ui and Material-UI
- **Accessibility** - WCAG compliant with screen reader support

## 🛠️ Technology Stack

### Core Framework
- **React 18.2** - Modern React with hooks and concurrent features
- **Vite 6.0** - Fast build tool and development server
- **TypeScript 5.3** - Type safety and better development experience
- **React Router 6.24** - Client-side routing and navigation

### UI Framework & Styling
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Shadcn/ui** - Modern, accessible component library
- **Material-UI 5.16** - Comprehensive React component library
- **Radix UI** - Headless UI primitives for accessibility
- **Lucide React** - Beautiful, customizable icons
- **Styled Components** - CSS-in-JS styling solution

### Data Visualization
- **Chart.js 4.4** - Flexible charting library
- **React Chart.js 2** - React wrapper for Chart.js
- **Recharts 2.13** - React-specific charting components

### Data Management
- **TanStack React Table 8.20** - Powerful table functionality
- **PapaParse 5.4** - CSV parsing for file imports
- **Date-fns 3.6** & **Moment.js 2.30** - Date manipulation utilities

### Development Tools
- **ESLint** - Code linting and formatting
- **Husky** - Git hooks for code quality
- **Jest** - Testing framework
- **PostCSS & Autoprefixer** - CSS processing

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js** (version 18.0 or higher)
- **npm** (version 8.0 or higher) or **yarn**
- **Backend API** running on `http://localhost:8080`

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd financetracker-frontend
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Start Development Server
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

### 4. Build for Production
```bash
npm run build
# or
yarn build
```

## 🔧 Configuration

### Environment Setup
The application uses Vite's built-in proxy configuration for API calls. The backend is expected to run on `http://localhost:8080`.

### API Endpoints
The frontend communicates with the following backend endpoints:
- `/auth` - Authentication and user management
- `/transactions` - Transaction CRUD operations
- `/budgets` - Budget planning and tracking
- `/categories` - Category management
- `/accounts` - Account management
- `/dashboard` - Dashboard data aggregation
- `/allocation` - Smart allocation features
- `/recurring-transactions` - Recurring payment management
- `/income` - Income tracking

### Backend Configuration
To change the backend URL, update the proxy configuration in `vite.config.ts`:

```typescript
server: {
  proxy: {
    '/auth': {
      target: 'http://your-backend-url:port',
      changeOrigin: true,
      secure: false,
    },
    // ... other endpoints
  }
}
```

## 📜 Available Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run preview` - Preview production build locally

### Building
- `npm run build` - Build for production
- `npm run build:prod` - Build with production optimizations

### Code Quality
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Automatically fix linting issues
- `npm run type-check` - Run TypeScript type checking

### Testing
- `npm run test` - Run test suite
- `npm run test:coverage` - Run tests with coverage report

### Security
- `npm run security-check` - Check for security vulnerabilities

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (Shadcn/ui)
│   ├── dashboard/       # Dashboard-specific components
│   ├── transactions/    # Transaction management components
│   ├── budget/          # Budget planning components
│   ├── account/         # Account management components
│   ├── allocation/      # Smart allocation components
│   └── configuration/   # Settings and configuration
├── api/                 # API client and service functions
├── hooks/               # Custom React hooks
├── context/             # React Context providers
├── utils/               # Utility functions
├── styles/              # Global styles and styled components
├── types/               # TypeScript type definitions
└── lib/                 # Third-party library configurations
```

## 🎨 Theming & Customization

### Dark/Light Mode
The application supports automatic theme switching based on user preference. Themes are implemented using CSS variables and can be customized in:
- `src/index.css` - Global theme variables
- `tailwind.config.js` - Tailwind theme configuration

### Component Customization
UI components can be customized through:
- **Tailwind Classes** - Utility-first styling
- **CSS Variables** - Theme-based customization
- **Styled Components** - Component-specific styling
- **Shadcn/ui Configuration** - `components.json`

## 🔐 Authentication

The application uses token-based authentication. Users need to:
1. Register a new account or login with existing credentials
2. The frontend stores authentication state
3. API requests include authentication headers automatically

## 📊 Features Deep Dive

### Smart Allocation
- Analyzes income patterns and upcoming expenses
- Provides intelligent suggestions for fund allocation
- Considers recurring transactions and variable expenses
- Helps optimize financial planning

### Budget Management
- Create monthly budgets with category-specific limits
- Real-time spending tracking against budgets
- Visual indicators for budget status (under/near/over budget)
- Historical budget comparison and reporting

### Transaction Splitting
- Split shared expenses between multiple people
- Track personal share vs. owed amounts
- Flexible splitting options (equal, percentage, custom amounts)
- Generate settlement reports

### CSV Import
- Import transactions from bank statements
- Intelligent category matching and suggestions
- Duplicate transaction detection
- Batch processing for large imports

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
- Ensure Node.js version is 18.0 or higher
- Clear `node_modules` and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check for TypeScript errors: `npm run type-check`

**API Connection Issues**
- Verify backend is running on `http://localhost:8080`
- Check proxy configuration in `vite.config.ts`
- Ensure CORS is properly configured on the backend

**Styling Issues**
- Rebuild Tailwind CSS: `npm run build`
- Check for conflicting CSS classes
- Verify component imports are correct

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and commit: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

### Development Guidelines
- Follow ESLint rules and fix any linting errors
- Write TypeScript types for new features
- Test components before submitting
- Follow existing code patterns and conventions

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Search existing issues in the repository
3. Create a new issue with detailed information about the problem

## 🚀 Deployment

### Netlify Deployment (Recommended)

The easiest way to deploy Cove is using Netlify:

#### Quick Deploy
```bash
# Automated deployment script
./deploy-to-netlify.sh --prod
```

#### Manual Netlify Setup
1. **Connect to GitHub**: Push code to GitHub repository
2. **New Site**: Go to Netlify → "New site from Git"
3. **Configure**: 
   - Build command: `npm run build:prod`
   - Publish directory: `dist`
4. **Environment Variables**: Add production environment variables
5. **Deploy**: Site will be live at `https://your-app.netlify.app`

For detailed instructions, see **[NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md)**

### Alternative Deployment Options

#### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build:prod
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

#### Vercel Deployment
```bash
npm install -g vercel
vercel --prod
```

#### Traditional Hosting
```bash
npm run build:prod
# Upload 'dist' folder to your web server
```

### Environment Variables
Create a `.env.production` file for production-specific configurations:
```env
VITE_API_BASE_URL=https://your-production-api.com
VITE_APP_NAME=Sumi
VITE_NODE_ENV=production
```

---

**Sumi** - Mindful financial management inspired by the art of Japanese ink painting. Built with ❤️ and attention to every detail, bringing harmony to your financial journey.