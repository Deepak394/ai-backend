import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/db";

const SALT_ROUNDS = 10;

export async function registerUser(data:any) {
  const {name,email,password}=data;
  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows.length > 0) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await pool.query(
    "INSERT INTO users (name , email, password_hash) VALUES ($1, $2, $3) RETURNING id, fullName , email, created_at",
    [email, passwordHash]
  );

  return result.rows[0];
}

export async function loginUser(email: string, password: string) {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  const user = result.rows[0];
  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET as string,
    {   expiresIn: process.env.JWT_EXPIRES_IN as any, }
  );

  return { token, user: { id: user.id, email: user.email, full_name: user.name } };
}