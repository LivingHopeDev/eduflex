import { Router } from "express";
import { ussdRouter } from "./ussd.routes";

const rootRouter = Router();

rootRouter.use("/ussd", ussdRouter);

export default rootRouter;
