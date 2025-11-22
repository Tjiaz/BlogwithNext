import { hash } from "bcryptjs";
import prisma from "@/utils/connect";

export async function POST(req) {
  const { email, password } = await req.json();

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return new Response(JSON.stringify({ message: "User already exists" }), {
      status: 400,
    });
  }

  // Hash the password
  const hashedPassword = await hash(password, 10);

  // Create new user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  return new Response(JSON.stringify(user), {
    status: 201,
  });
}
