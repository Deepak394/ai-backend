import { pool } from "../config/db";

export async function addMessage(
  conversationId: number,
  role: "user" | "assistant",
  content: string
) {
  const result = await pool.query(
    `INSERT INTO messages (conversation_id, role, content)
     VALUES ($1, $2, $3)
     RETURNING id, role, content, created_at`,
    [conversationId, role, content]
  );

  // Bump the parent conversation's updated_at so conversation lists
  // can sort by "most recently active" — this is why listConversations
  // orders by updated_at, not created_at
  await pool.query(
    `UPDATE conversations SET updated_at = NOW() WHERE id = $1`,
    [conversationId]
  );

  return result.rows[0];
}

export async function listMessages(conversationId: number) {
  const result = await pool.query(
    `SELECT id, role, content, created_at
     FROM messages
     WHERE conversation_id = $1
     ORDER BY created_at ASC`,
    [conversationId]
  );
  return result.rows;
}

export async function getConversationHistory(conversationId: number) {
  const messages = await listMessages(conversationId); // from Day 7
  
  return messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));
}