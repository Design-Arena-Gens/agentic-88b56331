export type UserRole = "TESTER" | "CLIENT" | "MANAGER";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string | null;
  bio?: string | null;
  testerReputation: number;
  skills: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestCycle {
  id: string;
  name: string;
  scope: string;
  status: string;
  startDate: string;
  endDate?: string | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestAssignment {
  id: string;
  testerId: string;
  testCycleId: string;
  status: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  testCycle?: TestCycleWithProject;
}

export interface TestCycleWithProject extends TestCycle {
  project?: Project;
}

export interface BugReport {
  id: string;
  title: string;
  severity: string;
  stepsToReproduce: string;
  expectedResult: string;
  actualResult: string;
  environment: string;
  status: string;
  attachments?: string[];
  reporterId: string;
  testCycleId: string;
  createdAt: string;
  updatedAt: string;
  testCycle?: TestCycleWithProject;
}

export interface Payout {
  id: string;
  testerId: string;
  amount: number;
  currency: string;
  status: string;
  paidAt?: string | null;
  createdAt: string;
}

export interface DashboardSummary {
  user: User;
  stats: Record<string, number>;
  activeAssignments: TestAssignment[];
  focusProjects: Array<
    Project & {
      openIssues: number;
      cycleStatus: string;
      nextMilestone?: string | null;
    }
  >;
  recentIssues: BugReport[];
  payouts?: Payout[];
}
