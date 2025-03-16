// services/ussdService.ts
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
    log.info({ sessionId, phoneNumber, text, serviceCode });

    if (!phoneNumber) {
      log.error("END Error: Phone number is missing.");
      return "END Error: Phone number is missing.";
    }
    // Find or create user
    let user = await userService.findUser(phoneNumber);
    console.log(user);
    if (!user) {
      user = await userService.createUser(phoneNumber);
    }

    // Get or create session
    let session = await sessionService.getSessionState(user.id, sessionId);

    // Process request based on text and session state
    let response = "";
    if (text === "") {
      // Initial menu
      response =
        "CON Welcome to EduFlex\n1. Browse Courses\n2. My Courses\n3. Help";
      await sessionService.updateSessionState(user.id, sessionId, "MAIN_MENU");
    } else {
      // Process navigation based on current state and input
      response = await this.processMenuNavigation(user, session, text);
    }

    return response;
  }

  async processMenuNavigation(user: any, session: any, text: string) {
    const { state } = session;
    const inputs = text.split("*");
    const currentInput = inputs[inputs.length - 1];

    switch (state) {
      case "MAIN_MENU":
        if (currentInput === "1") {
          const courses = await courseService.getCourses();
          await sessionService.updateSessionState(
            user.id,
            session.id,
            "BROWSE_COURSES"
          );
          return `CON Available Courses:\n${this.formatCourseList(courses)}`;
        } else if (currentInput === "2") {
          const enrollments = await courseService.getUserEnrollments(user.id);
          await sessionService.updateSessionState(
            user.id,
            session.id,
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
          await sessionService.updateSessionState(
            user.id,
            session.id,
            "COURSE_DETAILS"
          );
          return `CON ${course.title}\n${course.description}\n\n1. Enroll\n2. View Modules\n0. Back`;
        }
        return "END Invalid course selection. Please try again.";

      // Add more states as needed

      default:
        return "END An error occurred. Please try again.";
    }
  }

  formatCourseList(courses: any[]) {
    return courses
      .map((course, index) => `${index + 1}. ${course.title}`)
      .join("\n");
  }

  formatEnrollmentList(enrollments: any[]) {
    return enrollments.length > 0
      ? enrollments
          .map(
            (enrollment, index) => `${index + 1}. ${enrollment.course.title}`
          )
          .join("\n")
      : "You have no enrolled courses.";
  }
}
