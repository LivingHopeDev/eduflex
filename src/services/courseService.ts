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

  // Admin

  // services/courseService.ts
  // Add these methods to your existing CourseService class

  async createCourse(title: string, description: string, duration: string) {
    return await prismaClient.course.create({
      data: {
        title,
        description,
        duration,
      },
    });
  }

  async updateCourse(
    id: string,
    data: { title?: string; description?: string; duration?: string }
  ) {
    return await prismaClient.course.update({
      where: { id },
      data,
    });
  }

  async deleteCourse(id: string) {
    return await prismaClient.course.delete({
      where: { id },
    });
  }

  async addModule(courseId: string, title: string) {
    return await prismaClient.module.create({
      data: {
        title,
        courseId,
      },
    });
  }

  async addLesson(moduleId: string, title: string, content: string) {
    return await prismaClient.lesson.create({
      data: {
        title,
        content,
        moduleId,
      },
    });
  }
}
