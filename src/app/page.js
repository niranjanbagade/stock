"use client";
import Image from "next/image";
import GoogleLogin from "@/components/loginwithgoogle/googlelogin";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="h-[93vh] flex flex-col items-center justify-center w-full bg-gradient-to-br from-[#18181b] to-[#1e293b] overflow-hidden text-white transition-colors duration-300">
      <header className="flex flex-col items-center mb-8">
        <Image
          src="/stock.svg"
          alt="Stock Market Icon"
          width={64}
          height={64}
          className="mb-4 drop-shadow-lg"
        />
        {/*
        <Image
          src="https://ui-avatars.com/api/?name=Niranjan+Bagade&background=1e293b&color=fbbf24&size=96&rounded=true"
          alt="Instructor: Niranjan Bagade"
          width={80}
          height={80}
          className="mb-2 rounded-full border-2 border-orange-300 shadow-lg"
        />
        */}
        <h1 className="text-4xl sm:text-5xl font-bold text-orange-300 mb-2 text-center drop-shadow-lg">
          NiveshGuru
        </h1>
        <p className="text-lg sm:text-xl text-orange-100 text-center max-w-xl">
          Unlock the secrets of the Indian stock market with step-by-step
          guidance from{" "}
          <span className="text-orange-400 font-bold italic">
            Mr. Niranjan Bagade
          </span>
          . Learn proven strategies to confidently identify{" "}
          <span className="font-semibold text-green-400">
            the best times to buy
          </span>{" "}
          and{" "}
          <span className="font-semibold text-red-400">
            the right moments to sell
          </span>
          —all from an experienced Indian trader and mentor.
        </p>
      </header>
      <main className="flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <span className="text-base text-gray-300">
            Get started with your journey
          </span>
          {session ? (
            <button
              className="flex items-center gap-2 px-5 py-2 rounded-md bg-green-500 hover:bg-green-600 text-white font-semibold shadow transition-colors duration-200 group cursor-pointer"
              style={{ fontSize: "1rem" }}
              onClick={() => {
                if (session && session.user && session.user.isAdmin) {
                  window.location.href = "/admin/approvals";
                } else {
                  window.location.href = "/profile";
                }
              }}
            >
              Continue
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                className="ml-1 transition-transform duration-300 group-hover:translate-x-1 group-active:scale-110"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ) : (
            <GoogleLogin />
          )}
        </div>
      </main>
      <footer className="absolute bottom-4 left-0 w-full flex justify-center text-xs text-gray-400">
        Made with ❤️ by Niranjan Bagade, an Indian stock market enthusiast
      </footer>
    </div>
  );
}
