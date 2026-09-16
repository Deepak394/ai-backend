import { pool } from "../config/db";

export async function createDocument(userId: number, title: string, rawText: string) {
  const result = await pool.query(
    `INSERT INTO documents (user_id, title, raw_text, type)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, raw_text, type, created_at, updated_at`,
    [userId, title, rawText]
  );
  return result.rows[0];
}

export async function listDocuments(userId: number, type:string) {
  
  const result = await pool.query(
    `SELECT id, title, created_at FROM documents WHERE user_id = $1   AND ($2 = 'all' OR type = $2)   ORDER BY created_at DESC`,
    [userId, type]
  );
 
  return result.rows;
}

export async function getDocumentById(userId: number, documentId: number) {
  const result = await pool.query(
    `SELECT id, title, raw_text, type, created_at FROM documents WHERE id = $1 AND user_id = $2`,
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


export async function updateDocument(
  userId: number,
  documentId: number,
  updates: { title?: string; raw_text?: string }
) {
  // Build the SET clause dynamically based on which fields were provided
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.title !== undefined) {
    fields.push(`title = $${paramIndex++}`);
    values.push(updates.title);
  }
  if (updates.raw_text !== undefined) {
    fields.push(`raw_text = $${paramIndex++}`);
    values.push(updates.raw_text);
  }
  fields.push(`updated_at = NOW()`);

  values.push(documentId, userId);

  const query = `
    UPDATE documents
    SET ${fields.join(", ")}
    WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
    RETURNING id, title, raw_text, type, created_at, updated_at
  `;

  const result = await pool.query(query, values);
  return result.rows[0] || null;
}