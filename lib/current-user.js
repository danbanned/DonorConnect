// lib/current-user.ts
import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

function roleForEmail(email) {
  if (email === "admin@greenstreet.org") return "ADMIN"
  if (email === "staff@donorconnect.com") return "STAFF"
  return "USER"
}

export async function getCurrentUser() {
  const { userId } = auth()
  if (!userId) return null

  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const email = clerkUser.emailAddresses[0].emailAddress

  return prisma.user.upsert({
    where: { authId: clerkUser.id },
    update: {},
    create: {
      authId: clerkUser.id,
      email,
      role: roleForEmail(email)
    }
  })
}
