// seeds/seedDatabase.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.progress.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.module.deleteMany({});
  await prisma.course.deleteMany({});

  // Create courses
  const webDev = await prisma.course.create({
    data: {
      title: "Web Development",
      description: "Learn HTML, CSS, and JS basics to build websites",
      duration: "4 weeks",
    },
  });

  const digitalMarketing = await prisma.course.create({
    data: {
      title: "Digital Marketing",
      description: "Master social media and online campaigns",
      duration: "3 weeks",
    },
  });

  const dataEntry = await prisma.course.create({
    data: {
      title: "Data Entry Skills",
      description: "Learn Excel and data management",
      duration: "2 weeks",
    },
  });

  // Create modules for Web Development
  const htmlModule = await prisma.module.create({
    data: {
      title: "HTML Basics",
      courseId: webDev.id,
    },
  });

  const cssModule = await prisma.module.create({
    data: {
      title: "CSS Styling",
      courseId: webDev.id,
    },
  });

  // Create modules for Digital Marketing
  const socialModule = await prisma.module.create({
    data: {
      title: "Social Media",
      courseId: digitalMarketing.id,
    },
  });

  const seoModule = await prisma.module.create({
    data: {
      title: "SEO Basics",
      courseId: digitalMarketing.id,
    },
  });

  // Create modules for Data Entry
  const excelModule = await prisma.module.create({
    data: {
      title: "Excel Skills",
      courseId: dataEntry.id,
    },
  });

  // Create lessons with USSD-friendly content (chunked into small segments)
  // HTML Module Lessons
  await prisma.lesson.create({
    data: {
      title: "HTML Structure",
      content:
        "HTML forms the structure of web pages. It uses tags like <html>, <head>, and <body>.",
      moduleId: htmlModule.id,
      courseId: webDev.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: "HTML Elements",
      content:
        "Common HTML elements include <p> for paragraphs, <h1> for headings, and <a> for links.",
      moduleId: htmlModule.id,
      courseId: webDev.id,
    },
  });

  // CSS Module Lessons
  await prisma.lesson.create({
    data: {
      title: "CSS Selectors",
      content:
        "CSS selectors target HTML elements. Use # for IDs and . for classes.",
      moduleId: cssModule.id,
      courseId: webDev.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: "CSS Colors",
      content:
        "CSS colors can be set using names (red), hex codes (#FF0000), or RGB values (rgb(255,0,0)).",
      moduleId: cssModule.id,
      courseId: webDev.id,
    },
  });

  // Social Media Module Lessons
  await prisma.lesson.create({
    data: {
      title: "Facebook Marketing",
      content:
        "Facebook marketing involves creating engaging posts, using targeted ads, and building community.",
      moduleId: socialModule.id,
      courseId: digitalMarketing.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: "Instagram Growth",
      content:
        "Grow on Instagram by using relevant hashtags, posting consistently, and engaging with followers.",
      moduleId: socialModule.id,
      courseId: digitalMarketing.id,
    },
  });

  // SEO Module Lessons
  await prisma.lesson.create({
    data: {
      title: "Keyword Research",
      content:
        "Find keywords that potential visitors search for. Target terms with high volume and low competition.",
      moduleId: seoModule.id,
      courseId: digitalMarketing.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: "On-Page SEO",
      content:
        "Optimize title tags, meta descriptions, headings, and content with relevant keywords.",
      moduleId: seoModule.id,
      courseId: digitalMarketing.id,
    },
  });

  // Excel Module Lessons
  await prisma.lesson.create({
    data: {
      title: "Excel Formulas",
      content:
        "Basic Excel formulas: =SUM() adds numbers, =AVERAGE() finds the mean, =COUNT() counts cells.",
      moduleId: excelModule.id,
      courseId: dataEntry.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: "Data Sorting",
      content:
        "Sort data in Excel by selecting your data, clicking Data tab, then Sort button. Choose column and order.",
      moduleId: excelModule.id,
      courseId: dataEntry.id,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
