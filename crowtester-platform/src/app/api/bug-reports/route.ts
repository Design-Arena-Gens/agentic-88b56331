import { ensureDatabaseSeeded } from "@/lib/bootstrap";
import { prisma } from "@/lib/prisma";
import { serializeBugReport } from "@/lib/serializers";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  userId: z.string().min(3),
  title: z.string().min(3),
  severity: z.string().min(1),
  stepsToReproduce: z.string().min(5),
  expectedResult: z.string().min(3),
  actualResult: z.string().min(3),
  environment: z.string().min(3),
  testCycleId: z.string().min(3),
  attachments: z.array(z.string().url()).optional(),
});

export async function GET(request: Request) {
  await ensureDatabaseSeeded();

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "Missing userId" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      projects: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let bugReports;
  if (user.role === "TESTER") {
    bugReports = await prisma.bugReport.findMany({
      where: { reporterId: userId },
      include: {
        testCycle: {
          include: {
            project: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } else {
    bugReports = await prisma.bugReport.findMany({
      where: {
        testCycle: {
          project: {
            ownerId: userId,
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
    });
  }

  return NextResponse.json(bugReports.map(serializeBugReport));
}

export async function POST(request: Request) {
  await ensureDatabaseSeeded();

  const data = await request.json();
  const parsed = createSchema.safeParse(data);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid bug report payload" },
      { status: 400 },
    );
  }

  const {
    userId,
    title,
    severity,
    stepsToReproduce,
    expectedResult,
    actualResult,
    environment,
    testCycleId,
    attachments = [],
  } = parsed.data;

  const tester = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!tester || tester.role !== "TESTER") {
    return NextResponse.json(
      { error: "Only testers can submit issues" },
      { status: 403 },
    );
  }

  const bug = await prisma.bugReport.create({
    data: {
      title,
      severity,
      stepsToReproduce,
      expectedResult,
      actualResult,
      environment,
      attachments,
      reporterId: tester.id,
      testCycleId,
    },
    include: {
      testCycle: {
        include: {
          project: true,
        },
      },
    },
  });

  return NextResponse.json(serializeBugReport(bug));
}
