import { getSession } from "next-auth/react";
import prisma from "../../../../prisma";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const session = await getSession({ req });

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { title, description, content, topic } = req.body;

    try {
      const article = await prisma.article.create({
        data: {
          title,
          description,
          content,
          topic,
          author: session.user.email,
          user: { connect: { email: session.user.email } },
        },
      });
      res.status(201).json(article);
    } catch (error) {
      res.status(500).json({ message: "Failed to create article" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
