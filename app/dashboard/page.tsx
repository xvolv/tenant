import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

  // Fetch rooms for this user only
  const rooms = await prisma.room.findMany({
    where: { ownerId: user.id },
    include: {
      renters: {
        where: { ownerId: user.id }, // Ensure renters are also filtered by ownerId
        orderBy: [
          { moveOutYear: { sort: "asc", nulls: "first" } },
          { moveInYear: "asc" },
          { moveInMonth: "asc" },
          { moveInDay: "asc" },
        ],
      },
      rentPayments: {
        orderBy: [{ year: "asc" }, { monthIndex: "asc" }],
      },
    },
    orderBy: { name: "asc" },
  });

  return <DashboardClient rooms={rooms} />;
}
