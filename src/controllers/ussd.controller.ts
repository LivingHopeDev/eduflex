import { Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import { UssdService } from "../services/ussd.service";
import log from "../utils/logger";

const ussdService = new UssdService();
export const processUssdRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId, phoneNumber, text, serviceCode } = req.body;
    console.log(req.body);
    const response = await ussdService.handleUssdRequest(
      sessionId,
      phoneNumber,
      text,
      serviceCode
    );
    res.set("Content-Type", "text/plain");
    res.send(response);
  }
);
