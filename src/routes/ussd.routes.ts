import { Router } from "express";
import { processUssdRequest } from "../controllers/ussd.controller";

const ussdRouter: Router = Router();
ussdRouter.post("/", processUssdRequest);

export { ussdRouter };
