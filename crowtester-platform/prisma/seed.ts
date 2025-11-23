import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.bugComment.deleteMany();
  await prisma.bugReport.deleteMany();
  await prisma.testAssignment.deleteMany();
  await prisma.testCycle.deleteMany();
  await prisma.project.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("password123", 10);

  const [manager, client1, client2, tester1, tester2, tester3] =
    await Promise.all([
      prisma.user.create({
        data: {
          id: "user-manager",
          email: "manager@crowdtest.io",
          name: "Morgan Rivera",
          role: UserRole.MANAGER,
          passwordHash: password,
          avatarUrl:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
          bio: "Seasoned QA director overseeing distributed testing teams.",
          skills: ["Leadership", "Test Strategy", "Automation"],
          testerReputation: 0,
        },
      }),
      prisma.user.create({
        data: {
          id: "user-client-finpulse",
          email: "product@finpulse.io",
          name: "FinPulse PM",
          role: UserRole.CLIENT,
          passwordHash: password,
          avatarUrl:
            "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80",
          bio: "Fintech product owner focused on mobile banking excellence.",
          skills: ["Mobile QA", "Payments", "Compliance"],
        },
      }),
      prisma.user.create({
        data: {
          id: "user-client-healthsync",
          email: "cto@healthsync.io",
          name: "HealthSync CTO",
          role: UserRole.CLIENT,
          passwordHash: password,
          avatarUrl:
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
          bio: "Healthcare platform innovator working on patient apps.",
          skills: ["Healthcare", "Security", "Accessibility"],
        },
      }),
      prisma.user.create({
        data: {
          id: "user-tester-ava",
          email: "ava.dawson@testers.io",
          name: "Ava Dawson",
          role: UserRole.TESTER,
          passwordHash: password,
          avatarUrl:
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80",
          bio: "Mobile QA specialist with a passion for fintech apps.",
          skills: ["iOS", "Android", "Mobile Banking", "Payments"],
          testerReputation: 820,
        },
      }),
      prisma.user.create({
        data: {
          id: "user-tester-leon",
          email: "leon.kim@testers.io",
          name: "Leon Kim",
          role: UserRole.TESTER,
          passwordHash: password,
          avatarUrl:
            "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80",
          bio: "Automation-first QA with CI/CD integration expertise.",
          skills: ["Web", "API", "Cypress", "Postman"],
          testerReputation: 910,
        },
      }),
      prisma.user.create({
        data: {
          id: "user-tester-valentina",
          email: "valentina.ortiz@testers.io",
          name: "Valentina Ortiz",
          role: UserRole.TESTER,
          passwordHash: password,
          avatarUrl:
            "https://images.unsplash.com/photo-1550525811-e5869dd03032?auto=format&fit=crop&w=200&q=80",
          bio: "Accessibility advocate ensuring inclusive user experiences.",
          skills: ["Accessibility", "WCAG", "Screen Readers"],
          testerReputation: 740,
        },
      }),
    ]);

  const finpulseProject = await prisma.project.create({
    data: {
      id: "project-finpulse",
      name: "FinPulse Banking App",
      description:
        "Consumer mobile banking application supporting peer-to-peer payments and card management.",
      status: "IN_PROGRESS",
      ownerId: client1.id,
      testCycles: {
            create: [
              {
                id: "cycle-beta-launch",
                name: "Beta Launch Cycle",
            scope:
              "Regression testing across iOS and Android releases with focus on payments.",
            status: "ACTIVE",
            startDate: new Date(),
            assignments: {
              create: [
                {
                  id: "assignment-ava-beta",
                  testerId: tester1.id,
                  status: "IN_PROGRESS",
                },
                {
                  id: "assignment-leon-beta",
                  testerId: tester2.id,
                  status: "ASSIGNED",
                },
              ],
            },
            issues: {
              create: [
                {
                  id: "bug-payment-freeze",
                  title: "Payment confirmation screen freezes",
                  severity: "HIGH",
                  stepsToReproduce:
                    "1. Initiate transfer\n2. Confirm with FaceID\n3. Observe freeze on confirmation screen",
                  expectedResult:
                    "App should display success message and updated balance",
                  actualResult:
                    "Confirmation screen hangs indefinitely without updating balance.",
                  environment: "iPhone 14 Pro, iOS 17.2, WiFi",
                  reporterId: tester1.id,
                  comments: {
                    create: [
                      {
                        id: "comment-payment-followup",
                        content:
                          "Engineering reproduced on debug build; investigating network retries.",
                        authorId: manager.id,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      testCycles: true,
    },
  });

  await prisma.project.create({
    data: {
      id: "project-healthsync",
      name: "HealthSync Patient Portal",
      description:
        "Web portal enabling patients to manage appointments and medical records.",
      status: "RECRUITING_TESTERS",
      ownerId: client2.id,
    },
  });

  await prisma.payout.createMany({
    data: [
      {
        id: "payout-ava-1",
        testerId: tester1.id,
        amount: 250,
        status: "PAID",
        paidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      },
      {
        id: "payout-leon-1",
        testerId: tester2.id,
        amount: 180,
        status: "PENDING",
      },
      {
        id: "payout-valentina-1",
        testerId: tester3.id,
        amount: 320,
        status: "PAID",
        paidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      },
    ],
  });

  await prisma.testAssignment.create({
    data: {
      id: "assignment-valentina-beta",
      testerId: tester3.id,
      testCycleId: finpulseProject.testCycles[0]!.id,
      status: "AWAITING_FEEDBACK",
      notes:
        "Need accessibility audit for voiceover and high contrast mode coverage.",
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
