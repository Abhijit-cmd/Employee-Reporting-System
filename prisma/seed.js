const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

const DEPARTMENT_NAMES = ["Sales", "IT/Software Dev", "Administration", "Finance"];

// Section 1 — Key Performance Indicators (weighted, per department)
const KPI_TEMPLATES = {
  Sales: [
    { name: "Sales Revenue Achievement", weight: 25, displayOrder: 1 },
    { name: "Target vs Actual (%) or Volume Achievement (MT/Units)", weight: 15, displayOrder: 2 },
    {
      name: "New Customer Acquisition",
      weight: 10,
      displayOrder: 3,
      description: "Includes Customer/Supplier Registration & New Product Addition",
    },
    { name: "Gross Margin / Profitability", weight: 10, displayOrder: 4 },
    { name: "Collection / Payment Recovery", weight: 10, displayOrder: 5 },
    { name: "Product Mix / Upselling", weight: 5, displayOrder: 6 },
    { name: "Territory Coverage", weight: 5, displayOrder: 7 },
  ],
  "IT/Software Dev": [
    { name: "Code Quality & Delivery", weight: 34, displayOrder: 1 },
    { name: "Sprint Commitment Reliability", weight: 33, displayOrder: 2 },
    { name: "Technical Problem Solving", weight: 33, displayOrder: 3 },
  ],
  Administration: [
    { name: "Process Efficiency", weight: 34, displayOrder: 1 },
    { name: "Documentation Accuracy", weight: 33, displayOrder: 2 },
    { name: "Stakeholder Coordination", weight: 33, displayOrder: 3 },
  ],
  Finance: [
    { name: "Reporting Accuracy & Timeliness", weight: 34, displayOrder: 1 },
    { name: "Budget Adherence", weight: 33, displayOrder: 2 },
    { name: "Compliance", weight: 33, displayOrder: 3 },
  ],
};

// KPI names from the previous (pre-template-redesign) seed — removed for Sales
// since the PDF template replaces them with the weighted list above.
const OLD_SALES_KPI_NAMES = ["Revenue Target Achievement", "Client Acquisition", "Client Retention"];

// Section 2 — Competency & Behavioural (same 12 items for every department)
const COMPETENCY_TEMPLATES = [
  "Communication Skills",
  "Negotiation Skills",
  "Product Knowledge",
  "Customer Relationship Management",
  "Market Awareness",
  "Problem Solving",
  "Teamwork & Collaboration",
  "Reporting & Documentation",
  "Planning & Execution",
  "Initiative & Ownership",
  "Time Management/Punctuality",
  "Integrity & Ethics",
];

// Section 3 — Collections & Credit Control (Sales only)
const CREDIT_CONTROL_TEMPLATES = [
  "Timely Collection of Payments",
  "Reduction of Overdue Accounts",
  "Customer Ledger Reconciliation",
  "Risk Management of Credit Customers",
];

const PERMISSIONS = [
  { key: "portal.admin.access", description: "Access the Manager/Leadership admin portal" },
  { key: "portal.employee.access", description: "Access the Employee portal" },
  { key: "portal.leadership.access", description: "Access Leadership-only sections (Manager Management, Org Settings)" },
  { key: "employees.manage", description: "Create, edit and delete Employee accounts" },
  { key: "managers.manage", description: "Create, edit and delete Manager accounts" },
  { key: "departments.manage", description: "Manage the Department list" },
  { key: "kpi_templates.manage", description: "Manage per-department KPI templates" },
  { key: "targets.manage", description: "Create and view employee targets" },
  { key: "announcements.manage", description: "Create and delete announcements" },
  { key: "announcements.view", description: "View announcements" },
  { key: "analytics.view", description: "View analytics" },
  { key: "reports.manage", description: "View, review and download employee reports" },
  { key: "appraisals.raise.employee", description: "Raise a performance appraisal for an Employee" },
  { key: "appraisals.raise.manager", description: "Raise a performance appraisal for a Manager" },
  { key: "appraisals.view.own", description: "View appraisals raised for yourself" },
  { key: "targets.view.own", description: "View your own targets" },
  { key: "reports.view.own", description: "Create and view your own monthly reports" },
  { key: "notifications.view.own", description: "View your own notifications" },
];

const ROLE_PERMISSIONS = {
  Leadership: [
    "portal.admin.access",
    "portal.leadership.access",
    "employees.manage",
    "managers.manage",
    "departments.manage",
    "kpi_templates.manage",
    "targets.manage",
    "announcements.manage",
    "announcements.view",
    "analytics.view",
    "reports.manage",
    "appraisals.raise.manager",
    "notifications.view.own",
  ],
  Manager: [
    "portal.admin.access",
    "employees.manage",
    "targets.manage",
    "announcements.manage",
    "announcements.view",
    "analytics.view",
    "reports.manage",
    "appraisals.raise.employee",
    "appraisals.view.own",
    "notifications.view.own",
  ],
  Employee: [
    "portal.employee.access",
    "announcements.view",
    "appraisals.view.own",
    "targets.view.own",
    "reports.view.own",
    "notifications.view.own",
  ],
};

async function main() {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables");
  }

  // SEED ROLES
  await prisma.role.createMany({
    data: [
      { roleName: "Leadership" },
      { roleName: "Manager" },
      { roleName: "Employee" },
    ],
    skipDuplicates: true,
  });

  console.log("Roles seeded successfully");

  const leadershipRole = await prisma.role.findFirst({
    where: { roleName: "Leadership" },
  });

  if (!leadershipRole) {
    throw new Error("Leadership role not found after seeding — check for DB errors");
  }

  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

  // SEED LEADERSHIP USER
  await prisma.user.createMany({
    data: [
      {
        employeeId: "SUPER-ADMIN",
        name: "Admin",
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        roleId: leadershipRole.id,
        phone: "+919876543210",
      },
    ],
    skipDuplicates: true,
  });

  // Upgrade an existing seeded admin from before the Leadership role existed
  await prisma.user.updateMany({
    where: { email: process.env.ADMIN_EMAIL },
    data: { roleId: leadershipRole.id },
  });

  console.log("Leadership user seeded successfully");

  // SEED REPORT STATUSES
  await prisma.reportStatus.createMany({
    data: [
      { statusName: "Pending" },
      { statusName: "Submitted" },
      { statusName: "Reviewed" },
    ],
    skipDuplicates: true,
  });

  console.log("Statuses inserted");

  // SEED DEPARTMENTS
  await prisma.department.createMany({
    data: DEPARTMENT_NAMES.map((name) => ({ name })),
    skipDuplicates: true,
  });

  console.log("Departments seeded successfully");

  // SEED KPI / COMPETENCY / CREDIT CONTROL TEMPLATES
  const departments = await prisma.department.findMany({
    where: { name: { in: DEPARTMENT_NAMES } },
  });

  for (const department of departments) {
    if (department.name === "Sales") {
      // Remove the generic KPIs from the previous seed — replaced by the
      // weighted list below from the company appraisal template.
      await prisma.kpiTemplate.deleteMany({
        where: { departmentId: department.id, name: { in: OLD_SALES_KPI_NAMES } },
      });
    }

    const kpiList = KPI_TEMPLATES[department.name] || [];
    for (const kpi of kpiList) {
      await prisma.kpiTemplate.upsert({
        where: { departmentId_name: { departmentId: department.id, name: kpi.name } },
        update: {
          section: "KPI",
          weight: kpi.weight,
          displayOrder: kpi.displayOrder,
          description: kpi.description ?? null,
        },
        create: {
          departmentId: department.id,
          name: kpi.name,
          description: kpi.description ?? null,
          displayOrder: kpi.displayOrder,
          section: "KPI",
          weight: kpi.weight,
        },
      });
    }

    await prisma.kpiTemplate.createMany({
      data: COMPETENCY_TEMPLATES.map((name, index) => ({
        departmentId: department.id,
        name,
        displayOrder: index + 1,
        section: "COMPETENCY",
      })),
      skipDuplicates: true,
    });

    if (department.name === "Sales") {
      await prisma.kpiTemplate.createMany({
        data: CREDIT_CONTROL_TEMPLATES.map((name, index) => ({
          departmentId: department.id,
          name,
          displayOrder: index + 1,
          section: "CREDIT_CONTROL",
        })),
        skipDuplicates: true,
      });
    }
  }

  console.log("KPI templates seeded successfully");

  // SEED PERMISSIONS
  await prisma.permission.createMany({
    data: PERMISSIONS,
    skipDuplicates: true,
  });

  console.log("Permissions seeded successfully");

  // SEED ROLE PERMISSIONS
  const allPermissions = await prisma.permission.findMany();
  const permissionIdByKey = new Map(allPermissions.map((p) => [p.key, p.id]));

  const allRoles = await prisma.role.findMany({
    where: { roleName: { in: Object.keys(ROLE_PERMISSIONS) } },
  });

  for (const role of allRoles) {
    const keys = ROLE_PERMISSIONS[role.roleName] || [];
    await prisma.rolePermission.createMany({
      data: keys
        .map((key) => permissionIdByKey.get(key))
        .filter((permissionId) => permissionId !== undefined)
        .map((permissionId) => ({ roleId: role.id, permissionId })),
      skipDuplicates: true,
    });
  }

  console.log("Role permissions seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
