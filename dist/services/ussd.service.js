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
exports.UssdService = void 0;
// services/ussdService.ts
const userService_1 = require("./userService");
const sessionService_1 = require("./sessionService");
const courseService_1 = require("./courseService");
const userService = new userService_1.UserService();
const sessionService = new sessionService_1.SessionService();
const courseService = new courseService_1.CourseService();
class UssdService {
    handleUssdRequest(sessionId, phoneNumber, text, serviceCode) {
        return __awaiter(this, void 0, void 0, function* () {
            let numberToSubmit = "";
            if (!phoneNumber || phoneNumber.trim() === "") {
                numberToSubmit = "+2348065108161";
            }
            else {
                numberToSubmit = phoneNumber;
            }
            // Find or create user
            let user = yield userService.findUser(numberToSubmit);
            console.error(user);
            if (!user) {
                user = yield userService.createUser(numberToSubmit);
            }
            // Get or create session
            let session = yield sessionService.getSessionState(user.id, sessionId);
            // Process request based on text and session state
            let response = "";
            if (text === "") {
                // Initial menu
                response =
                    "CON Welcome to EduFlex\n1. Browse Courses\n2. My Courses\n3. Help";
                yield sessionService.updateSessionState(user.id, sessionId, "MAIN_MENU");
            }
            else {
                // Process navigation based on current state and input
                response = yield this.processMenuNavigation(user, session, text);
            }
            return response;
        });
    }
    processMenuNavigation(user, session, text) {
        return __awaiter(this, void 0, void 0, function* () {
            const { state } = session;
            const inputs = text.split("*");
            const currentInput = inputs[inputs.length - 1];
            switch (state) {
                case "MAIN_MENU":
                    if (currentInput === "1") {
                        const courses = yield courseService.getCourses();
                        yield sessionService.updateSessionState(user.id, session.id, "BROWSE_COURSES");
                        return `CON Available Courses:\n${this.formatCourseList(courses)}`;
                    }
                    else if (currentInput === "2") {
                        const enrollments = yield courseService.getUserEnrollments(user.id);
                        yield sessionService.updateSessionState(user.id, session.id, "MY_COURSES");
                        return `CON My Courses:\n${this.formatEnrollmentList(enrollments)}`;
                    }
                    else if (currentInput === "3") {
                        return "END EduFlex Help:\nAccess courses via this USSD menu.\nNavigate using number options.\nLessons are delivered in small chunks.";
                    }
                    return "END Invalid option. Please try again.";
                case "BROWSE_COURSES":
                    // Handle course selection logic
                    const courseIndex = parseInt(currentInput) - 1;
                    const courses = yield courseService.getCourses();
                    if (courseIndex >= 0 && courseIndex < courses.length) {
                        const course = courses[courseIndex];
                        yield sessionService.updateSessionState(user.id, session.id, "COURSE_DETAILS");
                        return `CON ${course.title}\n${course.description}\n\n1. Enroll\n2. View Modules\n0. Back`;
                    }
                    return "END Invalid course selection. Please try again.";
                // Add more states as needed
                default:
                    return "END An error occurred. Please try again.";
            }
        });
    }
    formatCourseList(courses) {
        return courses
            .map((course, index) => `${index + 1}. ${course.title}`)
            .join("\n");
    }
    formatEnrollmentList(enrollments) {
        return enrollments.length > 0
            ? enrollments
                .map((enrollment, index) => `${index + 1}. ${enrollment.course.title}`)
                .join("\n")
            : "You have no enrolled courses.";
    }
}
exports.UssdService = UssdService;
