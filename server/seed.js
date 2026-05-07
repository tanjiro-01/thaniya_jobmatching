const mongoose = require("mongoose");
const dotenv = require("dotenv");

const User = require("./models/User");
const Job = require("./models/Job");
const Application = require("./models/Application");
const Notification = require("./models/Notification");

dotenv.config({ path: "./.env" });

const createResumeDataUrl = (name, role, summary, skills) => {
  const resumeHtml = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #111827;
            line-height: 1.6;
          }
          h1 {
            margin: 0 0 8px 0;
            font-size: 28px;
          }
          .role {
            margin: 0 0 20px 0;
            color: #2563eb;
            font-size: 16px;
            font-weight: 700;
          }
          .section {
            margin-top: 20px;
          }
          .label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #6b7280;
            margin-bottom: 6px;
            font-weight: 700;
          }
          ul {
            margin: 0;
            padding-left: 20px;
          }
        </style>
      </head>
      <body>
        <h1>${name}</h1>
        <p class="role">${role}</p>
        <div class="section">
          <div class="label">Professional Summary</div>
          <p>${summary}</p>
        </div>
        <div class="section">
          <div class="label">Key Skills</div>
          <ul>
            ${skills.map((skill) => `<li>${skill}</li>`).join("")}
          </ul>
        </div>
      </body>
    </html>
  `;

  return `data:text/html;base64,${Buffer.from(resumeHtml).toString("base64")}`;
};

async function seed() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in server/.env");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  await Promise.all([
    User.deleteMany({}),
    Job.deleteMany({}),
    Application.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  const admin = await User.create({
    name: "Admin User",
    email: "admin@jobportal.com",
    password: "admin123",
    role: "admin",
    location: "Remote",
    phone: "9999999999",
    avatar: "",
  });

  const recruiterOne = await User.create({
    name: "Aarav Sharma",
    email: "recruiter1@acme.com",
    password: "recruiter123",
    role: "recruiter",
    company: "Acme Technologies",
    location: "Bengaluru",
    phone: "9876543210",
    avatar: "",
  });

  const recruiterTwo = await User.create({
    name: "Meera Iyer",
    email: "recruiter2@nova.ai",
    password: "recruiter123",
    role: "recruiter",
    company: "Nova AI Labs",
    location: "Hyderabad",
    phone: "9876501234",
    avatar: "",
  });

  const candidateOne = await User.create({
    name: "Riya Patel",
    email: "candidate1@example.com",
    password: "candidate123",
    role: "candidate",
    resume: createResumeDataUrl(
      "Riya Patel",
      "Frontend Developer",
      "Frontend developer focused on React, clean UI architecture, and fast product delivery.",
      ["React", "TypeScript", "Node.js", "MongoDB", "CSS"],
    ),
    skills: ["React", "Node.js", "MongoDB"],
    age: 24,
    gender: "Female",
    experienceYears: 2,
    education: "B.Tech CSE",
    location: "Pune",
    phone: "9000011111",
    avatar: "",
  });

  const candidateTwo = await User.create({
    name: "Kabir Khan",
    email: "candidate2@example.com",
    password: "candidate123",
    role: "candidate",
    resume: createResumeDataUrl(
      "Kabir Khan",
      "Backend Engineer",
      "Backend engineer experienced in API design, data modeling, and reliable service development.",
      ["Python", "Django", "PostgreSQL", "REST APIs", "Redis"],
    ),
    skills: ["Python", "Django", "PostgreSQL"],
    age: 27,
    gender: "Male",
    experienceYears: 4,
    education: "B.Sc IT",
    location: "Delhi",
    phone: "9000022222",
    avatar: "",
  });

  const candidateThree = await User.create({
    name: "Sneha Nair",
    email: "candidate3@example.com",
    password: "candidate123",
    role: "candidate",
    resume: createResumeDataUrl(
      "Sneha Nair",
      "UI/UX Designer",
      "Designer creating clean user journeys, design systems, and polished product experiences.",
      ["Figma", "UI Design", "Wireframing", "Prototyping", "Tailwind CSS"],
    ),
    skills: ["UI/UX", "Figma", "Tailwind CSS"],
    age: 23,
    gender: "Female",
    experienceYears: 1,
    education: "B.Des",
    location: "Chennai",
    phone: "9000033333",
    avatar: "",
  });

  const jobs = await Job.create([
    {
      title: "Frontend React Developer",
      description:
        "Build responsive dashboards and candidate-facing interfaces using React and modern CSS.",
      company: "Acme Technologies",
      location: "Bengaluru",
      salary: "8-12 LPA",
      experienceLevel: "1-3",
      keywords: ["React", "JavaScript", "CSS", "Dashboard"],
      recruiter: recruiterOne._id,
    },
    {
      title: "Node.js Backend Engineer",
      description:
        "Develop APIs, authentication flows, and data models for a hiring platform.",
      company: "Nova AI Labs",
      location: "Hyderabad",
      salary: "10-16 LPA",
      experienceLevel: "4-7",
      keywords: ["Node.js", "Express", "MongoDB", "API"],
      recruiter: recruiterTwo._id,
    },
    {
      title: "UI/UX Designer",
      description:
        "Create polished design systems and user flows for web and mobile products.",
      company: "Acme Technologies",
      location: "Remote",
      salary: "7-11 LPA",
      experienceLevel: "fresher",
      keywords: ["Figma", "Design", "Wireframes", "Tailwind"],
      recruiter: recruiterOne._id,
    },
  ]);

  const applications = await Application.create([
    {
      job: jobs[0]._id,
      candidate: candidateOne._id,
      status: "applied",
      resume: candidateOne.resume,
      coverLetter:
        "I have built admin dashboards and job portals using React and Node.js.",
      contactPhone: candidateOne.phone,
      contactEmail: candidateOne.email,
    },
    {
      job: jobs[1]._id,
      candidate: candidateTwo._id,
      status: "shortlisted",
      resume: candidateTwo.resume,
      coverLetter:
        "I have worked on backend APIs and data-heavy applications with MongoDB.",
      contactPhone: candidateTwo.phone,
      contactEmail: candidateTwo.email,
    },
    {
      job: jobs[2]._id,
      candidate: candidateThree._id,
      status: "rejected",
      resume: candidateThree.resume,
      coverLetter:
        "I have strong UI design fundamentals and enjoy designing intuitive flows.",
      contactPhone: candidateThree.phone,
      contactEmail: candidateThree.email,
    },
  ]);

  await Notification.create([
    {
      recipient: recruiterOne._id,
      message: `${candidateOne.name} applied to your job: ${jobs[0].title}`,
      type: "new_applicant",
      relatedJob: jobs[0]._id,
    },
    {
      recipient: recruiterTwo._id,
      message: `${candidateTwo.name} applied to your job: ${jobs[1].title}`,
      type: "new_applicant",
      relatedJob: jobs[1]._id,
    },
    {
      recipient: candidateTwo._id,
      message: `Your application for ${jobs[1].title} was marked as: shortlisted`,
      type: "application_status",
      relatedJob: jobs[1]._id,
      isRead: true,
    },
    {
      recipient: admin._id,
      message: "Admin account created for testing platform-wide management.",
      type: "general",
    },
  ]);

  console.log("Seed complete.");
  console.log("Admin login: admin@jobportal.com / admin123");
  console.log("Recruiter login: recruiter1@acme.com / recruiter123");
  console.log("Candidate login: candidate1@example.com / candidate123");
  console.log(
    `Created ${jobs.length} jobs, ${applications.length} applications, and 4 notifications.`,
  );

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(async (error) => {
  console.error(error.message);
  try {
    await mongoose.disconnect();
  } catch (_) {}
  process.exit(1);
});
