import { Router } from "express";
import {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  addModule,
  addLesson,
} from "../controllers";
const courseRouter: Router = Router();
courseRouter.post("/", createCourse);
courseRouter.get("/", getCourses);

courseRouter.post("/module", addModule);
courseRouter.post("/lesson", addLesson);

courseRouter.get("/:id", getCourse);
courseRouter.patch("/:id", updateCourse);
courseRouter.delete("/:id", deleteCourse);

export { courseRouter };
