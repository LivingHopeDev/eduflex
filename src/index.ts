import express, { Express } from "express";
import rootRouter from "./routes";
import { PrismaClient } from "@prisma/client";
import { routeNotFound, errorHandler } from "./middlewares";
import config from "./config";
import { serve, setup } from "swagger-ui-express";
// import swaggerSpec from "./swagger";
import log from "./utils/logger";
import cors from "cors";

const app: Express = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  log.info(`Received request: ${req.method} ${req.url}`, req.body);
  next();
});

app.use("/api/v1", rootRouter);
// app.use("/api/docs", serve, setup(swaggerSpec));
app.get("/api/v1", (req, res) => {
  res.json({
    status: "Success",
    message: "Welcome: I will responding to your requests",
  });
});

export const prismaClient = new PrismaClient({
  log: ["query"],
});

app.use(routeNotFound);
app.use(errorHandler);

app.listen(config.port, () => {
  log.info(`Server running on port ${config.port}`);
});

export default app;
