import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Soft delete the user by setting isDeleted = true
    await prisma.user.update({
      where: { email: session.user.email },
      data: { isDeleted: true },
    });

    return NextResponse.json({ message: "บัญชีถูกลบเรียบร้อยแล้ว" }, { status: 200 });
  } catch (error) {
    console.error("[ACCOUNT_DELETE]", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
