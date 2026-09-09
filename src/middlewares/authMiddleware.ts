

import jwt from "jsonwebtoken";

export function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
    }
        // Extract the token from the "Bearer <token>" format
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Unauthorized User" });
    }
    try {
        const decoded:any = jwt.verify(token, process.env.JWT_SECRET as string);
        console.log("Decoded token:", decoded);
        req.user_email = decoded?.email; // Attach the decoded user info to the request object

        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        return res.status(401).json({ error: "Invalid token" });
    }
}
    