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
exports.UssdService = void 0;
const userService_1 = require("./userService");
const sessionService_1 = require("./sessionService");
const courseService_1 = require("./courseService");
const logger_1 = __importDefault(require("../utils/logger"));
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
            // Store relevant context in session data
            let sessionData = session.data || {};
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
                        // Store selected course ID in session data
                        sessionData.selectedCourseId = course.id;
                        yield sessionService.updateSessionState(user.id, session.id, "COURSE_DETAILS");
                        return `CON ${course.title}\n${course.description}\n\n1. Enroll\n2. View Modules\n0. Back`;
                    }
                    return "END Invalid course selection. Please try again.";
                case "COURSE_DETAILS":
                    if (currentInput === "1") {
                        // Enroll in course
                        try {
                            yield courseService.enrollUserInCourse(user.id, sessionData.selectedCourseId);
                            return "END You have successfully enrolled in this course!";
                        }
                        catch (error) {
                            logger_1.default.error("Enrollment error:", error);
                            return "END Error enrolling in course. You may already be enrolled.";
                        }
                    }
                    else if (currentInput === "2") {
                        // View modules - use getModules instead of getCourseModules
                        const modules = yield courseService.getModules(sessionData.selectedCourseId);
                        sessionData.modules = modules;
                        yield sessionService.updateSessionState(user.id, session.id, "VIEW_MODULES");
                        return `CON Modules for this course:\n${this.formatModuleList(modules)}`;
                    }
                    else if (currentInput === "0") {
                        // Go back to course list
                        const courses = yield courseService.getCourses();
                        yield sessionService.updateSessionState(user.id, session.id, "BROWSE_COURSES");
                        return `CON Available Courses:\n${this.formatCourseList(courses)}`;
                    }
                    return "END Invalid option. Please try again.";
                case "VIEW_MODULES":
                    const moduleIndex = parseInt(currentInput) - 1;
                    const modules = sessionData.modules ||
                        (yield courseService.getModules(sessionData.selectedCourseId));
                    if (currentInput === "0") {
                        // Go back to course details
                        const course = yield courseService.getCourseDetails(sessionData.selectedCourseId);
                        yield sessionService.updateSessionState(user.id, session.id, "COURSE_DETAILS");
                        return `CON ${course.title}\n${course.description}\n\n1. Enroll\n2. View Modules\n0. Back`;
                    }
                    else if (moduleIndex >= 0 && moduleIndex < modules.length) {
                        const module = modules[moduleIndex];
                        // Store selected module ID
                        sessionData.selectedModuleId = module.id;
                        // Get lessons for this module - use getLessons instead of getModuleLessons
                        const lessons = yield courseService.getLessons(module.id);
                        sessionData.lessons = lessons;
                        yield sessionService.updateSessionState(user.id, session.id, "VIEW_LESSONS");
                        return `CON ${module.title}\n\nLessons:\n${this.formatLessonList(lessons)}\n0. Back`;
                    }
                    return "END Invalid module selection. Please try again.";
                case "VIEW_LESSONS":
                    const lessonIndex = parseInt(currentInput) - 1;
                    const lessons = sessionData.lessons ||
                        (yield courseService.getLessons(sessionData.selectedModuleId));
                    if (currentInput === "0") {
                        // Go back to module list
                        const modules = yield courseService.getModules(sessionData.selectedCourseId);
                        sessionData.modules = modules;
                        yield sessionService.updateSessionState(user.id, session.id, "VIEW_MODULES");
                        return `CON Modules for this course:\n${this.formatModuleList(modules)}`;
                    }
                    else if (lessonIndex >= 0 && lessonIndex < lessons.length) {
                        const lesson = lessons[lessonIndex];
                        // Get full lesson content if needed
                        const lessonContent = yield courseService.getLessonContent(lesson.id);
                        // Track progress (optional)
                        try {
                            yield courseService.trackProgress(user.id, sessionData.selectedCourseId, lesson.id);
                        }
                        catch (error) {
                            logger_1.default.error("Error tracking progress:", error);
                            // Continue anyway, this shouldn't block the user
                        }
                        // Display lesson content
                        return `END ${lessonContent.title}\n\n${lessonContent.content}`;
                    }
                    return "END Invalid lesson selection. Please try again.";
                case "MY_COURSES":
                    const enrollmentIndex = parseInt(currentInput) - 1;
                    const enrollments = yield courseService.getUserEnrollments(user.id);
                    if (enrollmentIndex >= 0 && enrollmentIndex < enrollments.length) {
                        const enrollment = enrollments[enrollmentIndex];
                        // Store selected course ID
                        sessionData.selectedCourseId = enrollment.course.id;
                        yield sessionService.updateSessionState(user.id, session.id, "ENROLLED_COURSE_DETAILS");
                        return `CON ${enrollment.course.title}\n${enrollment.course.description}\n\n1. Continue Learning\n2. View Progress\n0. Back`;
                    }
                    else if (currentInput === "0") {
                        // Go back to main menu
                        yield sessionService.updateSessionState(user.id, session.id, "MAIN_MENU");
                        return "CON Welcome to EduFlex\n1. Browse Courses\n2. My Courses\n3. Help";
                    }
                    return "END Invalid course selection. Please try again.";
                case "ENROLLED_COURSE_DETAILS":
                    if (currentInput === "1") {
                        // Continue learning - show modules
                        const modules = yield courseService.getModules(sessionData.selectedCourseId);
                        sessionData.modules = modules;
                        yield sessionService.updateSessionState(user.id, session.id, "VIEW_MODULES");
                        return `CON Modules for this course:\n${this.formatModuleList(modules)}`;
                    }
                    else if (currentInput === "2") {
                        // View progress - we don't have a direct method for this
                        // So let's simulate with a placeholder response
                        return "END Progress tracking is being implemented. Check back soon!";
                    }
                    else if (currentInput === "0") {
                        // Go back to my courses
                        const enrollments = yield courseService.getUserEnrollments(user.id);
                        yield sessionService.updateSessionState(user.id, session.id, "MY_COURSES");
                        return `CON My Courses:\n${this.formatEnrollmentList(enrollments)}`;
                    }
                    return "END Invalid option. Please try again.";
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
                .join("\n") + "\n0. Back"
            : "You have no enrolled courses.\n0. Back";
    }
    formatModuleList(modules) {
        return (modules
            .map((module, index) => `${index + 1}. ${module.title}`)
            .join("\n") + "\n0. Back");
    }
    formatLessonList(lessons) {
        return lessons
            .map((lesson, index) => `${index + 1}. ${lesson.title}`)
            .join("\n");
    }
}
exports.UssdService = UssdService;
