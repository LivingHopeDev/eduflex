"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaClient = void 0;
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const client_1 = require("@prisma/client");
const middlewares_1 = require("./middlewares");
const config_1 = __importDefault(require("./config"));
// import swaggerSpec from "./swagger";
const logger_1 = __importDefault(require("./utils/logger"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true, limit: "50mb" }));
app.use((req, res, next) => {
    logger_1.default.info(`Received request: ${req.method} ${req.url}`, req.body);
    next();
});
app.use("/api/v1", routes_1.default);
// app.use("/api/docs", serve, setup(swaggerSpec));
app.get("/api/v1", (req, res) => {
    res.json({
        status: "Success",
        message: "Welcome: I will responding to your requests",
    });
});
exports.prismaClient = new client_1.PrismaClient({
    log: ["query"],
});
app.use(middlewares_1.routeNotFound);
app.use(middlewares_1.errorHandler);
app.listen(config_1.default.port, () => {
    logger_1.default.info(`Server running on port ${config_1.default.port}`);
});
exports.default = app;
