import "dotenv/config";

import { askLibraryAssistant } from "./ai/gemini.js";

async function tryAi(): Promise<void> {
  const reply = await askLibraryAssistant(
    "I enjoy historical fiction and want to reserve a book. How should I start?",
  );
  console.log(JSON.stringify(reply, null, 2));
}

tryAi().catch((error: unknown) => {
  console.error("Library assistant request failed:", error);
  process.exitCode = 1;
});
