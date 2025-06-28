import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import clientPromise from "./lib/mongodb";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";

// Custom adapter to remove emailVerified before saving user
function CustomMongoDBAdapter(clientPromise) {
  const baseAdapter = MongoDBAdapter(clientPromise);
  return {
    ...baseAdapter,
    async createUser(user) {
      // Remove emailVerified if present
      const { emailVerified, ...userWithoutEmailVerified } = user;
      // Add adminApproved field defaulting to false
      const userWithAdminApproved = { ...userWithoutEmailVerified, adminApproved: false };
      return baseAdapter.createUser(userWithAdminApproved);
    },
  };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  adapter: CustomMongoDBAdapter(clientPromise),
  session: {
    maxAge: 3600, // 1 hour in seconds
  },
  allowDangerousEmailAccountLinking: true, // Allow linking accounts with the same email
  callbacks: {
    async session({ session }) {
      const client = await clientPromise;
      const db = client.db();
      const dbUser = await db.collection("users").findOne({ email: session.user.email });
      if (dbUser) {
        session.user._id = dbUser._id.toString();
        session.user.isAdmin = dbUser.isAdmin || false;
        session.user.adminApproved = dbUser.adminApproved || false;
      }
      return session;
    },
  },
});
