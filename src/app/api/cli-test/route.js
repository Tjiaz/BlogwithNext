// app/api/cli-test/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const subscribers = await prisma.subscriber.findMany({
      where: { active: true },
    });

    console.log("Subscribers:", subscribers);

    return NextResponse.json({
      success: true,
      subscribers,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
