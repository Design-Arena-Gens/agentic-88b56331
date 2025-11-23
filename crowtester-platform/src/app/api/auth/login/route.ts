import { ensureDatabaseSeeded } from "@/lib/bootstrap";
import { prisma } from "@/lib/prisma";
import { serializeUser } from "@/lib/serializers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  await ensureDatabaseSeeded();

  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid login payload" },
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 },
    );
  }

  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 },
    );
  }

  return NextResponse.json({ user: serializeUser(user) });
}
