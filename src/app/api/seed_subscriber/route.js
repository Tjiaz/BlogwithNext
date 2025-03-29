// app/api/seed-subscribers/route.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Clear existing test subscribers
    await prisma.subscriber.deleteMany({
      where: { email: "test@example.com" },
    });

    // Create fresh test subscriber
    const testSub = await prisma.subscriber.create({
      data: {
        email: "test@example.com",
        active: true,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        subscriber: testSub,
      })
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
