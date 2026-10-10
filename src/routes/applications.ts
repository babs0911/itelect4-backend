import { Router } from "express";

export const applicationsRouter = Router();

applicationsRouter.get("/", (_req, res) => {
  res.json({
    applications: [],
    message: "Applications endpoint ready",
  });
});

applicationsRouter.get("/:id", (req, res) => {
  res.json({
    id: req.params.id,
    message: "Application not found",
  });
});

export default applicationsRouter;
