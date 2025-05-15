import { getAuthSession } from "@/utils/auth";
import prisma from "@/utils/connect";
import { NextResponse } from "next/server";

//GET ALL COMMENTS

export const GET = async (req) => {
  const { searchParams } = new URL(req.url);
  const postSlug = searchParams.get("postSlug");
  try {
    const comments = await prisma.comment.findMany({
      where: { ...(postSlug && { postSlug }) },
      include: { user: true },
    });

    return new NextResponse(
      JSON.stringify(comments, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
  } catch (error) {
    console.log(error);
    return new NextResponse(
      JSON.stringify({ message: "something went wrong!" }, { status: 500 })
    );
  }
};

//CREATE COMMENTS
export const POST = async (req) => {
  const session = await getAuthSession();

  if (!session) {
    return new NextResponse(
      JSON.stringify({ message: "Not Authenticated" }, { status: 401 })
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const postSlug = searchParams.get("postSlug");
    const body = await req.json();

    const comment = await prisma.comment.create({
      data: {
        content: body.content,
        userEmail: session.user.email,
        ...(postSlug && { postSlug }),
      },
      include: { user: true },
    });

    return new NextResponse(JSON.stringify({ comment }, { status: 200 }));
  } catch (error) {
    console.log(error);
    return new NextResponse(
      JSON.stringify({ message: "something went wrong!" }, { status: 500 })
    );
  }
};
