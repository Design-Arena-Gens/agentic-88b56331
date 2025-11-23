import { ensureDatabaseSeeded } from "@/lib/bootstrap";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  await ensureDatabaseSeeded();

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const cycles = await prisma.testCycle.findMany({
    where:
      user.role === "TESTER"
        ? {
            assignments: {
              some: {
                testerId: userId,
              },
            },
          }
        : {
            project: {
              ownerId: userId,
            },
          },
    include: {
      project: true,
    },
    orderBy: { startDate: "desc" },
  });

  return NextResponse.json(
    cycles.map((cycle) => ({
      id: cycle.id,
      name: cycle.name,
      scope: cycle.scope,
      status: cycle.status,
      startDate: cycle.startDate.toISOString(),
      endDate: cycle.endDate?.toISOString() ?? null,
      project: {
        id: cycle.project.id,
        name: cycle.project.name,
      },
    })),
  );
}
