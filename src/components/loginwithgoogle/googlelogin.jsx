"use client";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function SignIn() {
  return (
    <button
      type="button"
      onClick={() => signIn("google")}
      className="bg-[#23272f] border border-gray-700 rounded-full px-6 py-3 flex items-center gap-3 shadow-md hover:bg-[#2d3748] transition-all text-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <Image src="/google.svg" alt="Google logo" width={24} height={24} />
      Login with Google
    </button>
  );
}
