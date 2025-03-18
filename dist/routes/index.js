"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ussd_routes_1 = require("./ussd.routes");
const course_routes_1 = require("./course.routes");
const rootRouter = (0, express_1.Router)();
rootRouter.use("/ussd", ussd_routes_1.ussdRouter);
rootRouter.use("/courses", course_routes_1.courseRouter);
exports.default = rootRouter;
