/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				gw: {
					mint: "#E6F4EA",
					"mint-soft": "#D9EAD3",
					cream: "#F9F8F3",
					sand: "#F9F9F5",
					forest: "#0B7326",
					"forest-deep": "#007A1D",
					brand: "#1a9d4a",
					"brand-dark": "#15803d",
					navy: "#0f1f2e",
					"navy-deep": "#0a1628",
					page: "#eef1f4",
					warning: "#fef3c7",
					"warning-border": "#fcd34d",
				},
			},
			fontFamily: {
				sans: ['"Noto Sans TC"', "system-ui", "sans-serif"],
				/** 標題與短句：與正文的無襯線形成對比，維持中文易讀性 */
				display: ['"Noto Serif TC"', '"Noto Sans TC"', "ui-serif", "Georgia", "serif"],
			},
			borderRadius: {
				"3xl": "1.375rem",
				"4xl": "1.75rem",
			},
			boxShadow: {
				card: "0 8px 24px rgba(15, 31, 46, 0.08)",
				"card-lg":
					"0 20px 50px -16px rgba(15, 31, 46, 0.14), 0 0 0 1px rgba(255, 255, 255, 0.85) inset, 0 1px 0 rgba(26, 157, 74, 0.05) inset",
				"card-sm": "0 4px 20px rgba(15, 31, 46, 0.06), 0 0 0 1px rgba(15, 31, 46, 0.04)",
				btn: "0 4px 14px rgba(26, 157, 74, 0.28)",
				"btn-lg":
					"0 14px 36px rgba(26, 157, 74, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.2) inset",
				header: "0 1px 0 rgba(15, 31, 46, 0.06)",
				"glow-brand": "0 0 32px rgba(26, 157, 74, 0.2)",
			},
			backgroundImage: {
				"gw-page-mesh":
					"radial-gradient(ellipse 120% 80% at 50% -20%, rgba(26, 157, 74, 0.09) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 100% 50%, rgba(125, 211, 252, 0.12) 0%, transparent 45%), radial-gradient(ellipse 60% 40% at 0% 80%, rgba(217, 234, 211, 0.35) 0%, transparent 50%)",
				"gw-shell-shine": "linear-gradient(180deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 255, 255, 0) 36%)",
				"gw-cta":
					"linear-gradient(135deg, #1a9d4a 0%, #16a34a 45%, #0B7326 100%)",
				"gw-cta-navy":
					"linear-gradient(135deg, #0f1f2e 0%, #0a1628 55%, #0f1f2e 100%)",
			},
		},
	},
	plugins: [],
};
