import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/authService";
import { registerSchema, loginSchema } from "../validation/authValidation";

export async function register(req: Request, res: Response) {
  const parsed:any = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error:
       parsed.error.issues[0].message   
        });
  }

  try {
    const user = await registerUser(parsed.data.email, parsed.data.password);
    res.status(201).json({ user });
  } catch (err) {
    if ((err as Error).message === "EMAIL_ALREADY_EXISTS") {
      return res.status(409).json({ error: "Email already registered" });
    }
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function login(req: Request, res: Response) {
  const parsed:any = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 
    parsed.error.issues[0].message
        });
  }

  try {
    const result = await loginUser(parsed.data.email, parsed.data.password);
    res.json(result);
  } catch (err) {
    if ((err as Error).message === "INVALID_CREDENTIALS") {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    res.status(500).json({ error: "Something went wrong" });
  }
}