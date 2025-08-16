import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

async function deferRender() {
	if (import.meta.env.VITE_USE_MOCK === "true") {
		const { worker } = await import("./mocks/browser");
		await worker.start();
	}
}

deferRender().then(() => {
	createRoot(document.getElementById("root")).render(
		<StrictMode>
			<AuthProvider>
				<App />
			</AuthProvider>
		</StrictMode>
	);
});
