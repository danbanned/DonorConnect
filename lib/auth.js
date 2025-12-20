// lib/auth.js
import jwt from 'jsonwebtoken'
import prisma from '@/lib/db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function verifyToken(token) {
  try {
    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET)
    
    // Check if session exists and is valid
    const session = await prisma.session.findFirst({
      where: {
        userId: decoded.userId,
        token: token,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            organizationId: true
          }
        }
      }
    })
    
    if (!session) {
      throw new Error('Invalid or expired session')
    }
    
    // Update last activity
    await prisma.session.update({
      where: { id: session.id },
      data: { lastActivityAt: new Date() }
    })
    
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      organizationId: session.user.organizationId,
      sessionId: session.id
    }
  } catch (error) {
    console.error('Token verification error:', error.message)
    throw error
  }
}

export async function refreshToken(refreshToken) {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    
    const session = await prisma.session.findFirst({
      where: {
        userId: decoded.userId,
        refreshToken: refreshToken,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    })
    
    if (!session) {
      throw new Error('Invalid refresh token')
    }
    
    // Generate new access token
    const newToken = jwt.sign(
      {
        userId: session.user.id,
        email: session.user.email,
        role: session.user.role,
        organizationId: session.user.organizationId
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    )
    
    // Update session with new token
    await prisma.session.update({
      where: { id: session.id },
      data: {
        token: newToken,
        lastActivityAt: new Date()
      }
    })
    
    return newToken
  } catch (error) {
    throw new Error('Refresh token failed')
  }
}

export function decodeToken(token) {
  try {
    return jwt.decode(token)
  } catch (error) {
    return null
  }
}