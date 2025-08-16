import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
// https://vite.dev/config/
export default defineConfig({
	plugins: [tailwindcss(), react()],
	resolve: {
		extensions: [".js", ".jsx", ".json"],
	},
	base: import.meta.VITE_BASE_PATH || "/",
});
