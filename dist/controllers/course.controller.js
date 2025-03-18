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
exports.addLesson = exports.addModule = exports.deleteCourse = exports.updateCourse = exports.getCourse = exports.getCourses = exports.createCourse = void 0;
const courseService_1 = require("../services/courseService");
const courseService = new courseService_1.CourseService();
const createCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, duration } = req.body;
    const course = yield courseService.createCourse(title, description, duration);
    res.status(201).json({ status: "Success", data: course });
});
exports.createCourse = createCourse;
const getCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const courses = yield courseService.getCourses();
    res.json({ status: "Success", data: courses });
});
exports.getCourses = getCourses;
const getCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const course = yield courseService.getCourseDetails(id);
    res.json({ status: "Success", data: course });
});
exports.getCourse = getCourse;
const updateCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { title, description, duration } = req.body;
    const course = yield courseService.updateCourse(id, {
        title,
        description,
        duration,
    });
    res.json({ status: "Success", data: course });
});
exports.updateCourse = updateCourse;
const deleteCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    yield courseService.deleteCourse(id);
    res.json({ status: "Success", message: "Course deleted" });
});
exports.deleteCourse = deleteCourse;
const addModule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { title } = req.body;
    const module = yield courseService.addModule(id, title);
    res.status(201).json({ status: "Success", data: module });
});
exports.addModule = addModule;
const addLesson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { moduleId } = req.params;
    const { title, content } = req.body;
    const lesson = yield courseService.addLesson(moduleId, title, content);
    res.status(201).json({ status: "Success", data: lesson });
});
exports.addLesson = addLesson;
