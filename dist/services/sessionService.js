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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const __1 = require("..");
class SessionService {
    getSessionState(userId, sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield __1.prismaClient.session.findUnique({
                where: { userId },
            });
            if (!session) {
                return yield __1.prismaClient.session.create({
                    data: {
                        userId,
                        state: "NEW",
                        data: "{}",
                    },
                });
            }
            return session;
        });
    }
    updateSessionState(userId_1, sessionId_1, state_1) {
        return __awaiter(this, arguments, void 0, function* (userId, sessionId, state, data = {}) {
            return yield __1.prismaClient.session.update({
                where: { userId },
                data: {
                    state,
                    data: typeof data === "string" ? data : JSON.stringify(data),
                },
            });
        });
    }
}
exports.SessionService = SessionService;
