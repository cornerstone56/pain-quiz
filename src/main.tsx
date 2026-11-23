import { createRoot } from "react-dom/client";
import App from "./App";
import { texts } from "./texts";

document.title = texts.meta.title;

const root = document.getElementById("root");
if (!root) throw new Error("root missing");
createRoot(root).render(<App />);
