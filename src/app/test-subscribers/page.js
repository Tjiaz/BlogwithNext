// app/test-subscribers/page.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function TestSubscribers() {
  let subscribers = [];
  let error = null;

  try {
    subscribers = await prisma.subscriber.findMany({
      where: { active: true },
    });
  } catch (err) {
    error = err.message;
  } finally {
    await prisma.$disconnect();
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Subscribers Test</h1>

      {error && (
        <div style={{ color: "red", marginBottom: "20px" }}>Error: {error}</div>
      )}

      <h2>Active Subscribers ({subscribers.length})</h2>
      <ul>
        {subscribers.map((sub) => (
          <li key={sub.id}>{sub.email}</li>
        ))}
      </ul>
    </div>
  );
}
