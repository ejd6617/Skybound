import * as dotenv from 'dotenv';
import { NextFunction, Request, Response } from "express";
import admin from "firebase-admin";

// Extend Express Request type to include our authenticated user
export interface AuthenticatedRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Get the test bypass token from .env.test.local
  const ENV_FILE = '/.env.test.local';
  dotenv.config({ path: ENV_FILE });
  const TEST_BYPASS_TOKEN = process.env.TEST_BYPASS_TOKEN;
  if (!TEST_BYPASS_TOKEN) {
    throw new Error(`TEST_BYPASS_TOKEN is not set in ${ENV_FILE}`);
  }

  // Check authorization header for id token in format "Bearer <token>"
  // and extract if it exists
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed Authorization header" });
  }
  const idToken = authHeader.split(" ")[1];
  
  // Immediately approve auth if it is the bypass
  if (idToken === TEST_BYPASS_TOKEN) {
    return next();
  }
  
  // Try to verify the token with firebase
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}
