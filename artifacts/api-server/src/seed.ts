import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import {
  usersTable,
  eventsTable,
  notificationsTable,
} from "@workspace/db/schema";
import { randomUUID } from "crypto";

const PASSWORD = "password123";

async function seed() {
  console.log("Seeding database...");

  const hash = await bcrypt.hash(PASSWORD, 10);

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextMonth = new Date(now);
  nextMonth.setDate(nextMonth.getDate() + 30);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const users = [
    {
      id: "u1",
      name: "Dr. Sarah Mitchell",
      email: "principal@university.edu",
      passwordHash: hash,
      role: "principal",
      department: "Administration",
      year: null,
      section: null,
      avatar: null,
    },
    {
      id: "u2",
      name: "Prof. Rajesh Kumar",
      email: "hod.cs@university.edu",
      passwordHash: hash,
      role: "hod",
      department: "Computer Science",
      year: null,
      section: null,
      avatar: null,
    },
    {
      id: "u3",
      name: "Ms. Priya Sharma",
      email: "staff.cs@university.edu",
      passwordHash: hash,
      role: "staff",
      department: "Computer Science",
      year: null,
      section: null,
      avatar: null,
    },
    {
      id: "u4",
      name: "Arjun Patel",
      email: "cr.cs3a@university.edu",
      passwordHash: hash,
      role: "cr",
      department: "Computer Science",
      year: 3,
      section: "A",
      avatar: null,
    },
  ];

  for (const user of users) {
    await db
      .insert(usersTable)
      .values(user)
      .onConflictDoNothing();
  }
  console.log("✓ Users seeded");

  const events = [
    {
      id: "e1",
      title: "Annual Tech Symposium 2026",
      description:
        "Join us for the biggest tech event of the year featuring keynotes from industry leaders, hands-on workshops, hackathon, and networking sessions. Topics include AI/ML, Cloud Computing, Cybersecurity, and Blockchain. All departments are welcome.",
      date: nextWeek.toISOString().split("T")[0],
      time: "09:00",
      endTime: "18:00",
      venue: "Main Auditorium",
      organizer: "Dr. Sarah Mitchell",
      organizerId: "u1",
      department: "Administration",
      status: "published",
      priority: "urgent",
      category: "Technical",
      maxCapacity: 500,
      registeredCount: 312,
      tags: ["tech", "hackathon", "AI", "networking"],
      target: { departments: [], years: [], sections: [], includeAll: true },
      registrationUrl: "https://forms.google.com/symposium2026",
      registrationDeadline: tomorrow.toISOString().split("T")[0],
      fee: 0,
      viewCount: 1250,
      approvedBy: "Dr. Sarah Mitchell",
      approvedAt: yesterday,
    },
    {
      id: "e2",
      title: "CS Department Inter-Year Quiz",
      description:
        "Test your knowledge in the annual Computer Science quiz competition! Categories include Data Structures, Algorithms, Operating Systems, Networks, and DBMS. Teams of 3 required. Exciting prizes for top 3 teams.",
      date: tomorrow.toISOString().split("T")[0],
      time: "14:00",
      endTime: "17:00",
      venue: "Seminar Hall 2",
      organizer: "Prof. Rajesh Kumar",
      organizerId: "u2",
      department: "Computer Science",
      status: "published",
      priority: "upcoming",
      category: "Academic",
      maxCapacity: 120,
      registeredCount: 87,
      tags: ["quiz", "competition", "CS"],
      target: {
        departments: ["Computer Science"],
        years: [1, 2, 3, 4],
        sections: [],
        includeAll: false,
      },
      registrationDeadline: now.toISOString().split("T")[0],
      fee: 0,
      viewCount: 456,
    },
    {
      id: "e3",
      title: "Cultural Night: Rang De Campus",
      description:
        "An evening filled with music, dance, drama, and art! Students showcase their cultural talents in a vibrant celebration of diversity. Food stalls, art exhibitions, and live performances throughout the night.",
      date: nextWeek.toISOString().split("T")[0],
      time: "18:00",
      endTime: "22:00",
      venue: "Open Air Theatre",
      organizer: "Ms. Priya Sharma",
      organizerId: "u3",
      department: "Student Affairs",
      status: "approved",
      priority: "upcoming",
      category: "Cultural",
      maxCapacity: 800,
      registeredCount: 234,
      tags: ["cultural", "music", "dance", "food"],
      target: { departments: [], years: [], sections: [], includeAll: true },
      fee: 50,
      viewCount: 789,
    },
    {
      id: "e4",
      title: "Workshop: Machine Learning with Python",
      description:
        "Hands-on workshop covering Python basics for ML, Scikit-learn, TensorFlow fundamentals, model training and evaluation. Bring your laptops! Prerequisites: Basic Python knowledge. Certificate of participation provided.",
      date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      time: "10:00",
      endTime: "16:00",
      venue: "Computer Lab 3",
      organizer: "Ms. Priya Sharma",
      organizerId: "u3",
      department: "Computer Science",
      status: "under_review",
      priority: "regular",
      category: "Workshop",
      maxCapacity: 40,
      registeredCount: 38,
      tags: ["ML", "Python", "workshop", "AI"],
      target: {
        departments: ["Computer Science", "Electronics"],
        years: [2, 3, 4],
        sections: [],
        includeAll: false,
      },
      fee: 0,
      viewCount: 203,
    },
    {
      id: "e5",
      title: "Entrepreneurship Talk: From Idea to IPO",
      description:
        "Learn from successful alumni entrepreneurs about their journey from college projects to funded startups. Panel discussion on funding, team building, and scaling. Q&A session included.",
      date: nextMonth.toISOString().split("T")[0],
      time: "15:00",
      endTime: "17:30",
      venue: "Seminar Hall 1",
      organizer: "Dr. Sarah Mitchell",
      organizerId: "u1",
      department: "Administration",
      status: "published",
      priority: "upcoming",
      category: "Talk",
      maxCapacity: 200,
      registeredCount: 145,
      tags: ["startup", "entrepreneurship", "alumni"],
      target: { departments: [], years: [3, 4], sections: [], includeAll: false },
      fee: 0,
      viewCount: 567,
    },
    {
      id: "e6",
      title: "Sports Day: Cricket & Football",
      description:
        "Annual inter-department sports competition. Register your department team for Cricket (11 players) or Football (7-a-side). Knockout format. Trophy and medals for winners.",
      date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      time: "08:00",
      endTime: "18:00",
      venue: "Sports Ground",
      organizer: "Arjun Patel",
      organizerId: "u4",
      department: "Computer Science",
      status: "submitted",
      priority: "regular",
      category: "Sports",
      maxCapacity: 300,
      registeredCount: 0,
      tags: ["sports", "cricket", "football", "competition"],
      target: { departments: [], years: [], sections: [], includeAll: true },
      fee: 100,
      viewCount: 89,
    },
    {
      id: "e7",
      title: "Library: Research Paper Writing Workshop",
      description:
        "Learn to write impactful research papers. Topics: Literature review, IEEE/APA citation formats, LaTeX basics, journal selection, and avoiding plagiarism. Handout materials provided.",
      date: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      time: "11:00",
      endTime: "13:00",
      venue: "Library Conference Room",
      organizer: "Ms. Priya Sharma",
      organizerId: "u3",
      department: "Library",
      status: "draft",
      priority: "regular",
      category: "Academic",
      maxCapacity: 30,
      registeredCount: 0,
      tags: ["research", "writing", "academic"],
      target: { departments: [], years: [3, 4], sections: [], includeAll: false },
      fee: 0,
      viewCount: 12,
    },
  ];

  for (const event of events) {
    await db.insert(eventsTable).values(event as Parameters<typeof db.insert>[0] extends { values: infer V } ? V : never).onConflictDoNothing();
  }
  console.log("✓ Events seeded");

  const notifications = [
    {
      id: "n1",
      title: "Registration Closing Soon!",
      body: "CS Quiz competition registration closes today at 11:59 PM. Only 3 spots left!",
      priority: "critical",
      type: "reminder",
      eventId: "e2",
      isRead: false,
    },
    {
      id: "n2",
      title: "New Event: ML Workshop",
      body: "A Machine Learning with Python workshop has been submitted. 2 spots remaining!",
      priority: "high",
      type: "event_created",
      eventId: "e4",
      isRead: false,
    },
    {
      id: "n3",
      title: "Event Published",
      body: "Entrepreneurship Talk has been approved and is now visible to all students.",
      priority: "high",
      type: "event_approved",
      eventId: "e5",
      isRead: false,
    },
    {
      id: "n4",
      title: "Reminder: Tech Symposium",
      body: "Annual Tech Symposium is in 7 days. Have you registered yet?",
      priority: "medium",
      type: "reminder",
      eventId: "e1",
      isRead: true,
    },
    {
      id: "n5",
      title: "Cultural Night Update",
      body: "Venue for Cultural Night changed to Open Air Theatre. Check the updated event details.",
      priority: "high",
      type: "update",
      eventId: "e3",
      isRead: true,
    },
    {
      id: "n6",
      title: "New Announcement",
      body: "Campus WiFi will be upgraded this weekend. Please plan accordingly.",
      priority: "low",
      type: "announcement",
      isRead: true,
    },
  ];

  for (const notif of notifications) {
    await db.insert(notificationsTable).values(notif).onConflictDoNothing();
  }
  console.log("✓ Notifications seeded");

  console.log("\nDone! All accounts use password: password123");
  console.log("  principal@university.edu");
  console.log("  hod.cs@university.edu");
  console.log("  staff.cs@university.edu");
  console.log("  cr.cs3a@university.edu");

  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
