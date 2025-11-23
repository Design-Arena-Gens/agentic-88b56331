import { ensureDatabaseSeeded } from "@/lib/bootstrap";
import { prisma } from "@/lib/prisma";
import {
  serializeAssignment,
  serializeBugReport,
  serializePayout,
  serializeProject,
  serializeUser,
} from "@/lib/serializers";
import { DashboardSummary, Project } from "@/types";
import { NextResponse } from "next/server";

function buildError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: Request) {
  await ensureDatabaseSeeded();

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return buildError("Missing userId");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return buildError("User not found", 404);
  }

  if (user.role === "TESTER") {
    const [assignments, bugReports, payouts] = await Promise.all([
      prisma.testAssignment.findMany({
        where: { testerId: user.id },
        include: {
          testCycle: {
            include: {
              project: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 6,
      }),
      prisma.bugReport.findMany({
        where: { reporterId: user.id },
        include: {
          testCycle: {
            include: {
              project: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.payout.findMany({
        where: { testerId: user.id },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);

    const assignmentsSerialized = assignments.map(serializeAssignment);
    const issuesSerialized = bugReports.map(serializeBugReport);
    const payoutsSerialized = payouts.map(serializePayout);

    const focusProjectsMap = new Map<
      string,
      Project & {
        openIssues: number;
        cycleStatus: string;
        nextMilestone: string | null;
      }
    >();

    assignments.forEach((assignment) => {
      const cycle = assignment.testCycle;
      if (!cycle?.project) {
        return;
      }
      const project = serializeProject(cycle.project);
      if (!focusProjectsMap.has(project.id)) {
        focusProjectsMap.set(project.id, {
          ...project,
          openIssues: issuesSerialized.filter(
            (issue) =>
              issue.status !== "RESOLVED" &&
              issue.testCycle?.projectId === project.id,
          ).length,
          cycleStatus: cycle.status,
          nextMilestone: cycle.endDate ? cycle.endDate.toISOString() : null,
        });
      }
    });

    const stats = {
      activeAssignments: assignmentsSerialized.filter(
        (assignment) => assignment.status !== "COMPLETED",
      ).length,
      totalBugsFiled: await prisma.bugReport.count({
        where: { reporterId: user.id },
      }),
      lifetimeEarnings: payoutsSerialized
        .filter((payout) => payout.status === "PAID")
        .reduce((sum, payout) => sum + payout.amount, 0),
    };

    const payload: DashboardSummary = {
      user: serializeUser(user),
      stats,
      activeAssignments: assignmentsSerialized,
      focusProjects: Array.from(focusProjectsMap.values()),
      recentIssues: issuesSerialized,
      payouts: payoutsSerialized,
    };

    return NextResponse.json(payload);
  }

  if (user.role === "CLIENT") {
    const projects = await prisma.project.findMany({
      where: { ownerId: user.id },
      include: {
        testCycles: {
          include: {
            issues: true,
          },
        },
      },
    });

    const focusProjects = projects.map((project) => {
      const activeCycle = project.testCycles.at(0);
      return {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        ownerId: project.ownerId,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        openIssues: project.testCycles.reduce(
          (sum, cycle) =>
            sum + cycle.issues.filter((issue) => issue.status !== "RESOLVED")
              .length,
          0,
        ),
        cycleStatus: activeCycle?.status ?? "PLANNING",
        nextMilestone: activeCycle?.endDate?.toISOString() ?? null,
      };
    });

    const recentIssuesRaw = await prisma.bugReport.findMany({
      where: {
        testCycle: {
          project: {
            ownerId: user.id,
          },
        },
      },
      include: {
        testCycle: {
          include: {
            project: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    const stats = {
      activeCycles: projects.reduce(
        (sum, project) =>
          sum + project.testCycles.filter((cycle) => cycle.status === "ACTIVE")
            .length,
        0,
      ),
      totalIssues: recentIssuesRaw.length,
      testersAssigned: await prisma.testAssignment.count({
        where: {
          testCycle: {
            projectId: {
              in: projects.map((project) => project.id),
            },
          },
        },
      }),
    };

    const payload: DashboardSummary = {
      user: serializeUser(user),
      stats,
      activeAssignments: [],
      focusProjects,
      recentIssues: recentIssuesRaw.map(serializeBugReport),
    };

    return NextResponse.json(payload);
  }

  // Manager / Admin view
  const [activeAssignments, projects, recentIssues, testerEarnings] =
    await Promise.all([
      prisma.testAssignment.findMany({
        include: {
          testCycle: {
            include: {
              project: true,
            },
          },
          tester: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 8,
      }),
      prisma.project.findMany({
        include: {
          testCycles: true,
        },
      }),
      prisma.bugReport.findMany({
        include: {
          testCycle: {
            include: { project: true },
          },
          reporter: true,
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.payout.aggregate({
        _sum: { amount: true },
      }),
    ]);

  const focusProjects = projects
    .map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      ownerId: project.ownerId,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      openIssues: recentIssues.filter(
        (issue) => issue.testCycle?.projectId === project.id,
      ).length,
      cycleStatus:
        project.testCycles.find((cycle) => cycle.status === "ACTIVE")
          ?.status ?? "PLANNING",
      nextMilestone:
        project.testCycles
          .filter((cycle) => cycle.endDate)
          .map((cycle) => cycle.endDate!.toISOString())
          .sort()[0] ?? null,
    }))
    .slice(0, 6);

  const stats = {
    testersEngaged: await prisma.user.count({
      where: { role: "TESTER" },
    }),
    activeCycles: await prisma.testCycle.count({
      where: { status: "ACTIVE" },
    }),
    totalPayouts: testerEarnings._sum.amount ?? 0,
  };

  const payload: DashboardSummary = {
    user: serializeUser(user),
    stats,
    activeAssignments: activeAssignments.map(serializeAssignment),
    focusProjects,
    recentIssues: recentIssues.map(serializeBugReport),
  };

  return NextResponse.json(payload);
}
