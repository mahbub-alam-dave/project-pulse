// import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Please define JWT_SECRET in .env.local');
}

// Generate JWT Token
export async function generateToken(userId, role) {
const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })       
    .setIssuedAt()         
    .setExpirationTime('7d')   
    .sign(secret);

  return token
}


export async function verifyToken(token) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload; // { userId, role, iat, exp }
  } catch (error) {
    return null;
  }
}


// Get current user from cookies
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token');

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token.value);
    
    if (!decoded) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

// Middleware to check authentication
export async function requireAuth(requiredRoles = []) {
  const user = await getCurrentUser();

  if (!user) {
    return {
      authorized: false,
      error: 'Authentication required',
      status: 401,
    };
  }

  // Check if user has required role
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return {
      authorized: false,
      error: 'Insufficient permissions',
      status: 403,
    };
  }

  return {
    authorized: true,
    user,
  };
}