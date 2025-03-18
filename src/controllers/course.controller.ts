// controllers/courseController.ts
import { Request, Response } from "express";
import { CourseService } from "../services/courseService";

const courseService = new CourseService();

export const createCourse = async (req: Request, res: Response) => {
  const { title, description, duration } = req.body;
  const course = await courseService.createCourse(title, description, duration);
  res.status(201).json({ status: "Success", data: course });
};

export const getCourses = async (req: Request, res: Response) => {
  const courses = await courseService.getCourses();
  res.json({ status: "Success", data: courses });
};

export const getCourse = async (req: Request, res: Response) => {
  const { id } = req.params;
  const course = await courseService.getCourseDetails(id);
  res.json({ status: "Success", data: course });
};

export const updateCourse = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, duration } = req.body;
  const course = await courseService.updateCourse(id, {
    title,
    description,
    duration,
  });
  res.json({ status: "Success", data: course });
};

export const deleteCourse = async (req: Request, res: Response) => {
  const { id } = req.params;
  await courseService.deleteCourse(id);
  res.json({ status: "Success", message: "Course deleted" });
};

export const addModule = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title } = req.body;
  const module = await courseService.addModule(id, title);
  res.status(201).json({ status: "Success", data: module });
};

export const addLesson = async (req: Request, res: Response) => {
  const { moduleId } = req.params;
  const { title, content } = req.body;
  const lesson = await courseService.addLesson(moduleId, title, content);
  res.status(201).json({ status: "Success", data: lesson });
};
