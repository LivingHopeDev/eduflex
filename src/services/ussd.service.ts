import { UserService } from "./userService";
import { SessionService } from "./sessionService";
import { CourseService } from "./courseService";
import log from "../utils/logger";
const userService = new UserService();
const sessionService = new SessionService();
const courseService = new CourseService();

export class UssdService {
  async handleUssdRequest(
    sessionId: string,
    phoneNumber: string,
    text: string,
    serviceCode: string
  ) {
    let numberToSubmit = "";
    if (!phoneNumber || phoneNumber.trim() === "") {
      numberToSubmit = "+2348065108161";
    } else {
      numberToSubmit = phoneNumber;
    }

    // Find or create user
    let user = await userService.findUser(numberToSubmit);
    console.error(user);
    if (!user) {
      user = await userService.createUser(numberToSubmit);
    }

    // Get or create session
    let session = await sessionService.getSessionState(user.id, sessionId);

    // Parse session data if it exists
    let sessionData = {};
    try {
      if (session.data && typeof session.data === "string") {
        sessionData = JSON.parse(session.data);
      } else if (session.data) {
        sessionData = session.data;
      }
    } catch (error) {
      log.error("Error parsing session data:", error);
    }

    // Process request based on text and session state
    let response = "";
    if (text === "") {
      // Initial menu
      response =
        "CON Welcome to EduFlex\n1. Browse Courses\n2. My Courses\n3. Help";
      await sessionService.updateSessionState(user.id, sessionId, "MAIN_MENU");
    } else {
      // Process navigation based on current state and input
      response = await this.processMenuNavigation(
        user,
        session,
        sessionData,
        text,
        sessionId
      );
    }

    return response;
  }

  async processMenuNavigation(
    user: any,
    session: any,
    sessionData: any,
    text: string,
    sessionId: string
  ) {
    const { state } = session;
    const inputs = text.split("*");
    const currentInput = inputs[inputs.length - 1];

    switch (state) {
      case "MAIN_MENU":
        if (currentInput === "1") {
          const courses = await courseService.getCourses();
          await sessionService.updateSessionState(
            user.id,
            sessionId,
            "BROWSE_COURSES"
          );
          return `CON Available Courses:\n${this.formatCourseList(courses)}`;
        } else if (currentInput === "2") {
          const enrollments = await courseService.getUserEnrollments(user.id);
          await sessionService.updateSessionState(
            user.id,
            sessionId,
            "MY_COURSES"
          );
          return `CON My Courses:\n${this.formatEnrollmentList(enrollments)}`;
        } else if (currentInput === "3") {
          return "END EduFlex Help:\nAccess courses via this USSD menu.\nNavigate using number options.\nLessons are delivered in small chunks.";
        }
        return "END Invalid option. Please try again.";

      case "BROWSE_COURSES":
        // Handle course selection logic
        const courseIndex = parseInt(currentInput) - 1;
        const courses = await courseService.getCourses();

        if (courseIndex >= 0 && courseIndex < courses.length) {
          const course = courses[courseIndex];
          // Store selected course ID in session data
          sessionData.selectedCourseId = course.id;

          await sessionService.updateSessionState(
            user.id,
            sessionId,
            "COURSE_DETAILS",
            sessionData
          );
          return `CON ${course.title}\n${course.description}\n\n1. Enroll\n2. View Modules\n0. Back`;
        }
        return "END Invalid course selection. Please try again.";

      case "COURSE_DETAILS":
        if (currentInput === "1") {
          // Check if user is already enrolled first
          const enrollments = await courseService.getUserEnrollments(user.id);
          const alreadyEnrolled = enrollments.some(
            (enrollment) => enrollment.courseId === sessionData.selectedCourseId
          );

          if (alreadyEnrolled) {
            return "END You are already enrolled in this course.";
          }

          // Enroll in course
          try {
            await courseService.enrollUserInCourse(
              user.id,
              sessionData.selectedCourseId
            );
            return "END You have successfully enrolled in this course!";
          } catch (error) {
            log.error("Enrollment error:", error);
            return "END Error enrolling in course. Please try again later.";
          }
        } else if (currentInput === "2") {
          // Ensure we have a valid course ID
          if (!sessionData.selectedCourseId) {
            return "END Session error. Please start over.";
          }

          // View modules for the specific course
          const modules = await courseService.getModules(
            sessionData.selectedCourseId
          );
          sessionData.modules = modules;

          await sessionService.updateSessionState(
            user.id,
            sessionId,
            "VIEW_MODULES",
            sessionData
          );
          return `CON Modules for this course:\n${this.formatModuleList(
            modules
          )}`;
        } else if (currentInput === "0") {
          // Go back to course list
          const courses = await courseService.getCourses();
          await sessionService.updateSessionState(
            user.id,
            sessionId,
            "BROWSE_COURSES"
          );
          return `CON Available Courses:\n${this.formatCourseList(courses)}`;
        }
        return "END Invalid option. Please try again.";

      case "VIEW_MODULES":
        const moduleIndex = parseInt(currentInput) - 1;

        // Ensure we have the modules in session data or fetch them
        let modules = [];
        if (sessionData.modules && Array.isArray(sessionData.modules)) {
          modules = sessionData.modules;
        } else if (sessionData.selectedCourseId) {
          modules = await courseService.getModules(
            sessionData.selectedCourseId
          );
          sessionData.modules = modules;
        } else {
          return "END Session error. Please start over.";
        }

        if (currentInput === "0") {
          // Go back to course details
          if (!sessionData.selectedCourseId) {
            return "END Session error. Please start over.";
          }

          const course = await courseService.getCourseDetails(
            sessionData.selectedCourseId
          );
          await sessionService.updateSessionState(
            user.id,
            sessionId,
            "COURSE_DETAILS",
            sessionData
          );
          return `CON ${course.title}\n${course.description}\n\n1. Enroll\n2. View Modules\n0. Back`;
        } else if (moduleIndex >= 0 && moduleIndex < modules.length) {
          const module = modules[moduleIndex];
          // Store selected module ID
          sessionData.selectedModuleId = module.id;

          // Get lessons for this specific module
          const lessons = await courseService.getLessons(module.id);
          sessionData.lessons = lessons;

          await sessionService.updateSessionState(
            user.id,
            sessionId,
            "VIEW_LESSONS",
            sessionData
          );

          const moduleName = module.title || "Module";
          return `CON ${moduleName}\n\nLessons:\n${this.formatLessonList(
            lessons
          )}\n0. Back`;
        }
        return "END Invalid module selection. Please try again.";

      case "VIEW_LESSONS":
        const lessonIndex = parseInt(currentInput) - 1;

        // Ensure we have the lessons in session data or fetch them
        let lessons = [];
        if (sessionData.lessons && Array.isArray(sessionData.lessons)) {
          lessons = sessionData.lessons;
        } else if (sessionData.selectedModuleId) {
          lessons = await courseService.getLessons(
            sessionData.selectedModuleId
          );
          sessionData.lessons = lessons;
        } else {
          return "END Session error. Please start over.";
        }

        if (currentInput === "0") {
          // Go back to module list
          if (!sessionData.selectedCourseId) {
            return "END Session error. Please start over.";
          }

          const modules = await courseService.getModules(
            sessionData.selectedCourseId
          );
          sessionData.modules = modules;

          await sessionService.updateSessionState(
            user.id,
            sessionId,
            "VIEW_MODULES",
            sessionData
          );
          return `CON Modules for this course:\n${this.formatModuleList(
            modules
          )}`;
        } else if (lessonIndex >= 0 && lessonIndex < lessons.length) {
          const lesson = lessons[lessonIndex];

          // Get full lesson content
          const lessonContent = await courseService.getLessonContent(lesson.id);

          // Track progress if we have all the required IDs
          if (sessionData.selectedCourseId && lesson.id) {
            try {
              await courseService.trackProgress(
                user.id,
                sessionData.selectedCourseId,
                lesson.id
              );
            } catch (error) {
              log.error("Error tracking progress:", error);
              // Continue anyway, this shouldn't block the user
            }
          }

          // Display lesson content
          return `END ${lessonContent.title}\n\n${lessonContent.content}`;
        }
        return "END Invalid lesson selection. Please try again.";

      case "MY_COURSES":
        const enrollmentIndex = parseInt(currentInput) - 1;
        const enrollments = await courseService.getUserEnrollments(user.id);

        if (currentInput === "0") {
          // Go back to main menu
          await sessionService.updateSessionState(
            user.id,
            sessionId,
            "MAIN_MENU"
          );
          return "CON Welcome to EduFlex\n1. Browse Courses\n2. My Courses\n3. Help";
        } else if (
          enrollmentIndex >= 0 &&
          enrollmentIndex < enrollments.length
        ) {
          const enrollment = enrollments[enrollmentIndex];
          // Store selected course ID
          sessionData.selectedCourseId = enrollment.courseId;

          await sessionService.updateSessionState(
            user.id,
            sessionId,
            "ENROLLED_COURSE_DETAILS",
            sessionData
          );
          return `CON ${enrollment.course.title}\n${
            enrollment.course.description || ""
          }\n\n1. Continue Learning\n2. View Progress\n0. Back`;
        }
        return "END Invalid course selection. Please try again.";

      case "ENROLLED_COURSE_DETAILS":
        if (currentInput === "1") {
          // Ensure we have a valid course ID
          if (!sessionData.selectedCourseId) {
            return "END Session error. Please start over.";
          }

          // Continue learning - show modules for the specific course
          const modules = await courseService.getModules(
            sessionData.selectedCourseId
          );
          sessionData.modules = modules;

          await sessionService.updateSessionState(
            user.id,
            sessionId,
            "VIEW_MODULES",
            sessionData
          );
          return `CON Modules for this course:\n${this.formatModuleList(
            modules
          )}`;
        } else if (currentInput === "2") {
          // View progress - placeholder for now
          return "END Progress tracking is being implemented. Check back soon!";
        } else if (currentInput === "0") {
          // Go back to my courses
          const enrollments = await courseService.getUserEnrollments(user.id);
          await sessionService.updateSessionState(
            user.id,
            sessionId,
            "MY_COURSES"
          );
          return `CON My Courses:\n${this.formatEnrollmentList(enrollments)}`;
        }
        return "END Invalid option. Please try again.";

      default:
        return "END An error occurred. Please try again.";
    }
  }

  formatCourseList(courses: any[]) {
    return courses && courses.length > 0
      ? courses
          .map((course, index) => `${index + 1}. ${course.title}`)
          .join("\n")
      : "No courses available.";
  }

  formatEnrollmentList(enrollments: any[]) {
    return enrollments && enrollments.length > 0
      ? enrollments
          .map(
            (enrollment, index) => `${index + 1}. ${enrollment.course.title}`
          )
          .join("\n") + "\n0. Back"
      : "You have no enrolled courses.\n0. Back";
  }

  formatModuleList(modules: any[]) {
    return modules && modules.length > 0
      ? modules
          .map(
            (module, index) =>
              `${index + 1}. ${module.title || `Module ${index + 1}`}`
          )
          .join("\n") + "\n0. Back"
      : "No modules available.\n0. Back";
  }

  formatLessonList(lessons: any[]) {
    return lessons && lessons.length > 0
      ? lessons
          .map(
            (lesson, index) =>
              `${index + 1}. ${lesson.title || `Lesson ${index + 1}`}`
          )
          .join("\n") + "\n0. Back"
      : "No lessons available.\n0. Back";
  }
}
