import { Router, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";

import { auth } from "../middleware/auth.js";
import { askLibraryAssistant } from "../ai/gemini.js";
import { aiRequestSchema } from "../schemas/ai.js";

const aiRouter = Router();

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  keyGenerator: (req: Request) => req.userId!,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "You have reached the library assistant limit. Try again in a minute.",
  },
});

aiRouter.use(auth);
aiRouter.use(aiLimiter);

aiRouter.post("/", async (req: Request, res: Response) => {
  const parsed = aiRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: "Enter a request between 20 and 2000 characters.",
      errors: parsed.error.issues.map((issue) => issue.message),
    });
    return;
  }

  try {
    const reply = await askLibraryAssistant(parsed.data.prompt);
    res.json(reply);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      error.status === 429
    ) {
      res.status(429).json({
        message: "The library assistant is temporarily out of AI requests. Please try again later.",
      });
      return;
    }

    console.error("Library assistant request failed", error);
    res.status(502).json({
      message: "The library assistant could not provide a valid answer. Please try again.",
    });
  }
});

export { aiRouter };
