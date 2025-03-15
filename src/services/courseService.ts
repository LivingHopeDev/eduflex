// services/courseService.ts
import { prismaClient } from "..";

export class CourseService {
  async getCourses() {
    return await prismaClient.course.findMany({
      take: 5, // Limit for USSD display
    });
  }

  async getCourseDetails(courseId: string) {
    return await prismaClient.course.findUnique({
      where: { id: courseId },
      include: { modules: true },
    });
  }

  async getUserEnrollments(userId: string) {
    return await prismaClient.enrollment.findMany({
      where: { userId },
      include: { course: true },
    });
  }

  async getModules(courseId: string) {
    return await prismaClient.module.findMany({
      where: { courseId },
    });
  }

  async getLessons(moduleId: string) {
    return await prismaClient.lesson.findMany({
      where: { moduleId },
    });
  }

  async getLessonContent(lessonId: string) {
    return await prismaClient.lesson.findUnique({
      where: { id: lessonId },
    });
  }

  async enrollUserInCourse(userId: string, courseId: string) {
    return await prismaClient.enrollment.create({
      data: {
        userId,
        courseId,
      },
    });
  }

  async trackProgress(userId: string, courseId: string, lessonId: string) {
    return await prismaClient.progress.create({
      data: {
        userId,
        courseId,
        lessonId,
      },
    });
  }
}
