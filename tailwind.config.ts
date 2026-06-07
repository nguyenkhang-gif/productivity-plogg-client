import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
			surface:          'var(--color-surface)',
			'surface-raised': 'var(--color-surface-raised)',
			accent:           'var(--color-accent)',
			page:             'var(--color-page)',
			card:             'var(--color-card)',
			overlay:          'var(--color-overlay)',
			modal:            'var(--color-modal)',

			// Semantic text tokens — update CSS vars above to retheme
			'text-primary':   'var(--color-text-primary)',
			'text-secondary': 'var(--color-text-secondary)',
			'text-muted':     'var(--color-text-muted)',
			'accent-text':    'var(--color-accent-text)',
			'accent-hover':   'var(--color-accent-hover)',
			'accent-subtle':  'var(--color-accent-subtle)',
			'accent-subtle-hover': 'var(--color-accent-subtle-hover)',
			border:           'var(--color-border)',
			'border-muted':   'var(--color-border-muted)',

			dark:{
				1:"#1C1F2E",
				2:"#161925"
			},
			blue:{
				1: "#0E78F9"
			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
