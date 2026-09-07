import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
        xl: "2.5rem",
        "2xl": "3rem",
      },
      screens: {
        xs: "475px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    screens: {
      xs: "475px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1400px",
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Geist Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        canvas: "color-mix(in srgb, var(--canvas) calc(100% * <alpha-value>), transparent)",
        surface: {
          1: "color-mix(in srgb, var(--surface-1) calc(100% * <alpha-value>), transparent)",
          2: "color-mix(in srgb, var(--surface-2) calc(100% * <alpha-value>), transparent)",
          DEFAULT: "color-mix(in srgb, var(--surface-1) calc(100% * <alpha-value>), transparent)",
        },
        'surface-1': "color-mix(in srgb, var(--surface-1) calc(100% * <alpha-value>), transparent)",
        'surface-2': "color-mix(in srgb, var(--surface-2) calc(100% * <alpha-value>), transparent)",
        'border-subtle': "color-mix(in srgb, var(--border-subtle) calc(100% * <alpha-value>), transparent)",
        'border-strong': "color-mix(in srgb, var(--border-strong) calc(100% * <alpha-value>), transparent)",
        'text-primary': "color-mix(in srgb, var(--text-primary) calc(100% * <alpha-value>), transparent)",
        'text-muted': "color-mix(in srgb, var(--text-muted) calc(100% * <alpha-value>), transparent)",
        kbd: {
          bg: "var(--kbd-bg)",
          border: "var(--kbd-border)",
          text: "var(--kbd-text)",
        },
        coral: {
          DEFAULT: "var(--accent-coral)",
          hover: "#f85353",
        },
        emerald: {
          DEFAULT: "var(--accent-emerald)",
        },
        amber: {
          DEFAULT: "var(--accent-amber)",
        },
        cyan: {
          DEFAULT: "var(--accent-cyan)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      textColor: {
        primary: "color-mix(in srgb, var(--text-primary) calc(100% * <alpha-value>), transparent)",
        muted: "color-mix(in srgb, var(--text-muted) calc(100% * <alpha-value>), transparent)",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
