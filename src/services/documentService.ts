import { pool } from "../config/db";

export async function createDocument(userId: number, title: string, rawText: string) {
  const result = await pool.query(
    `INSERT INTO documents (user_id, title, raw_text)
     VALUES ($1, $2, $3)
     RETURNING id, title, raw_text, created_at`,
    [userId, title, rawText]
  );
  return result.rows[0];
}

export async function listDocuments(userId: number) {
  const result = await pool.query(
    `SELECT id, title, created_at FROM documents WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function getDocumentById(userId: number, documentId: number) {
  const result = await pool.query(
    `SELECT id, title, raw_text, created_at FROM documents WHERE id = $1 AND user_id = $2`,
    [documentId, userId]
  );
  return result.rows[0] || null;
}

export async function deleteDocument(userId: number, documentId: number) {
  const result = await pool.query(
    `DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING id`,
    [documentId, userId]
  );
  return result.rows.length > 0;
}