/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			'2xl': '1.5rem',
  			'3xl': '2rem'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			// Sumi-inspired color palette
  			sumi: {
  				ink: {
  					50: '#F7FAFC',
  					100: '#EDF2F7',
  					200: '#E2E8F0',
  					300: '#CBD5E0',
  					400: '#A0AEC0',
  					500: '#718096',
  					600: '#4A5568',
  					700: '#2D3748',
  					800: '#1A202C',
  					900: '#171923'
  				},
  				gold: {
  					50: '#FFFBEB',
  					100: '#FEF3C7',
  					200: '#FDE68A',
  					300: '#FCD34D',
  					400: '#FBBF24',
  					500: '#F59E0B',
  					600: '#D97706',
  					700: '#B45309',
  					800: '#92400E',
  					900: '#78350F'
  				},
  				sage: {
  					50: '#F0FDF4',
  					100: '#DCFCE7',
  					200: '#BBF7D0',
  					300: '#86EFAC',
  					400: '#4ADE80',
  					500: '#22C55E',
  					600: '#16A34A',
  					700: '#15803D',
  					800: '#166534',
  					900: '#14532D'
  				},
  				cream: {
  					50: '#FEFEFE',
  					100: '#FDFDF9',
  					200: '#FBFBF2',
  					300: '#F8F8EA',
  					400: '#F4F4E0',
  					500: '#F0F0D5'
  				}
  			}
  		},
  		fontFamily: {
  			sans: ['Inter', 'system-ui', 'sans-serif'],
  			serif: ['Crimson Text', 'Georgia', 'serif'],
  			display: ['Playfair Display', 'Georgia', 'serif'],
  			mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace']
  		},
  		fontSize: {
  			xs: 'var(--font-size-xs)',
  			sm: 'var(--font-size-sm)',
  			base: 'var(--font-size-base)',
  			lg: 'var(--font-size-lg)',
  			xl: 'var(--font-size-xl)',
  			'2xl': 'var(--font-size-2xl)'
  		},
  		lineHeight: {
  			tight: 'var(--line-height-tight)',
  			normal: 'var(--line-height-normal)',
  			relaxed: 'var(--line-height-relaxed)'
  		},
  		fontWeight: {
  			normal: 'var(--font-weight-normal)',
  			medium: 'var(--font-weight-medium)',
  			bold: 'var(--font-weight-bold)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'ink-flow': {
  				'0%': { 
  					transform: 'scaleX(0)', 
  					opacity: '0' 
  				},
  				'50%': { 
  					opacity: '0.6' 
  				},
  				'100%': { 
  					transform: 'scaleX(1)', 
  					opacity: '1' 
  				}
  			},
  			'fade-in-up': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(10px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'brush-stroke': {
  				'0%': {
  					strokeDasharray: '0 100',
  				},
  				'100%': {
  					strokeDasharray: '100 0',
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'ink-flow': 'ink-flow 0.8s ease-out',
  			'fade-in-up': 'fade-in-up 0.6s ease-out',
  			'brush-stroke': 'brush-stroke 1.5s ease-in-out'
  		},
  		backdropBlur: {
  			xs: '2px',
  		},
  		boxShadow: {
  			'sumi': '0 4px 20px -2px rgba(45, 55, 72, 0.1), 0 2px 8px -2px rgba(45, 55, 72, 0.06)',
  			'sumi-lg': '0 10px 40px -4px rgba(45, 55, 72, 0.15), 0 4px 16px -4px rgba(45, 55, 72, 0.1)',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
