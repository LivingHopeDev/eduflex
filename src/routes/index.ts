import { Router } from "express";
import { ussdRouter } from "./ussd.routes";
import { courseRouter } from "./course.routes";
const rootRouter = Router();

rootRouter.use("/ussd", ussdRouter);
rootRouter.use("/courses", courseRouter);

export default rootRouter;
