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
exports.CourseService = void 0;
// services/courseService.ts
const __1 = require("..");
class CourseService {
    getCourses() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield __1.prismaClient.course.findMany({
                take: 5, // Limit for USSD display
            });
        });
    }
    getCourseDetails(courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield __1.prismaClient.course.findUnique({
                where: { id: courseId },
                include: { modules: true },
            });
        });
    }
    getUserEnrollments(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield __1.prismaClient.enrollment.findMany({
                where: { userId },
                include: { course: true },
            });
        });
    }
    getModules(courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield __1.prismaClient.module.findMany({
                where: { courseId },
            });
        });
    }
    getLessons(moduleId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield __1.prismaClient.lesson.findMany({
                where: { moduleId },
            });
        });
    }
    getLessonContent(lessonId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield __1.prismaClient.lesson.findUnique({
                where: { id: lessonId },
            });
        });
    }
    enrollUserInCourse(userId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield __1.prismaClient.enrollment.create({
                data: {
                    userId,
                    courseId,
                },
            });
        });
    }
    trackProgress(userId, courseId, lessonId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield __1.prismaClient.progress.create({
                data: {
                    userId,
                    courseId,
                    lessonId,
                },
            });
        });
    }
    // Admin
    // services/courseService.ts
    // Add these methods to your existing CourseService class
    createCourse(title, description, duration) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield __1.prismaClient.course.create({
                data: {
                    title,
                    description,
                    duration,
                },
            });
        });
    }
    updateCourse(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield __1.prismaClient.course.update({
                where: { id },
                data,
            });
        });
    }
    deleteCourse(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield __1.prismaClient.course.delete({
                where: { id },
            });
        });
    }
    addModule(courseId, title) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield __1.prismaClient.module.create({
                data: {
                    title,
                    courseId,
                },
            });
        });
    }
    addLesson(moduleId, title, content) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield __1.prismaClient.lesson.create({
                data: {
                    title,
                    content,
                    moduleId,
                },
            });
        });
    }
}
exports.CourseService = CourseService;
