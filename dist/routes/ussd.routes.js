"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ussdRouter = void 0;
const express_1 = require("express");
const ussd_controller_1 = require("../controllers/ussd.controller");
const ussdRouter = (0, express_1.Router)();
exports.ussdRouter = ussdRouter;
ussdRouter.post("/", ussd_controller_1.processUssdRequest);
