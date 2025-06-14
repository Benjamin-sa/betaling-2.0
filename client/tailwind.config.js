// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Scout theme colors following design guide
        primary: "#10b981", // emerald-500
        "primary-dark": "#059669", // emerald-600
        "primary-light": "#6ee7b7", // emerald-300
        secondary: "#16a34a", // green-600
        "secondary-dark": "#15803d", // green-700

        // Functional colors
        success: "#10b981", // emerald-500
        "success-bg": "#d1fae5", // emerald-100
        warning: "#f59e0b", // amber-500
        "warning-bg": "#fef3c7", // amber-100
        error: "#ef4444", // red-500
        "error-bg": "#fee2e2", // red-100
        info: "#3b82f6", // blue-500
        "info-bg": "#dbeafe", // blue-100

        // Legacy support (gradually remove these)
        background: "#f9fafb", // gray-50
        text: "#111827", // gray-900
        navBackground: "#ffffff",
        navText: "#4b5563", // gray-600
        cardBackground: "#ffffff",
      },
      borderRadius: {
        DEFAULT: "0.75rem", // 12px - following design guide
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"], // More modern font stack
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
        "bounce-subtle": "bounceSubtle 0.3s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
    },
  },
  plugins: [],
};
