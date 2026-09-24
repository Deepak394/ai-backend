import { pool } from "../config/db";

export async function createConversation(userId: number, title?: string) {
  const result = await pool.query(
    `INSERT INTO conversations (user_id, title)
     VALUES ($1, $2)
     RETURNING id, title, created_at, updated_at`,
    [userId, title || "New Conversation"]
  );
  return result.rows[0];
}

export async function listConversations(userId: number) {
  const result = await pool.query(
    `SELECT id, title, created_at, updated_at
     FROM conversations
     WHERE user_id = $1
     ORDER BY updated_at DESC`,
    [userId]
  );
  return result.rows;
}

// Ownership check used before touching messages in a conversation
export async function conversationBelongsToUser(userId: number, conversationId: number) {
  const result = await pool.query(
    `SELECT id FROM conversations WHERE id = $1 AND user_id = $2`,
    [conversationId, userId]
  );
  return result.rows.length > 0;
}



export async function deleteConversation(userId: number, conversationId: number) {
  const result = await pool.query(
    `DELETE FROM conversations WHERE id = $1 AND user_id = $2 RETURNING id`,
    [conversationId, userId]
  );
  return result.rows.length > 0;
}


export async function updateConversationTitle(conversationId: number, title: string) {
  await pool.query(
    `UPDATE conversations SET title = $1, updated_at = updated_at WHERE id = $2`,
    [title, conversationId]
  );
}

export async function isDefaultTitle(conversationId: number): Promise<boolean> {
  const result = await pool.query(
    `SELECT title FROM conversations WHERE id = $1`,
    [conversationId]
  );
  return result.rows[0]?.title === "New Conversation";
}