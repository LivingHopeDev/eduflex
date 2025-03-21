"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processUssdRequest = void 0;
const asyncHandler_1 = __importDefault(require("../middlewares/asyncHandler"));
const ussd_service_1 = require("../services/ussd.service");
const ussdService = new ussd_service_1.UssdService();
exports.processUssdRequest = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sessionId, phoneNumber, text, serviceCode } = req.body;
    const response = yield ussdService.handleUssdRequest(sessionId, phoneNumber, text, serviceCode);
    res.set("Content-Type", "text/plain");
    res.send(response);
}));
