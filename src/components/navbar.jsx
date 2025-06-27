"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        background: "linear-gradient(90deg, #18181b 0%, #1e293b 100%)",
        color: "#fff",
        boxShadow: "0 2px 8px 0 rgba(0,0,0,0.15)",
        borderBottom: "1px solid #23272f",
      }}
    >
      <a
        href="/"
        style={{
          textDecoration: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 0,
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: "1.2rem",
            color: "#fbbf24",
            letterSpacing: 1,
            lineHeight: 1.1,
          }}
        >
          NiveshGuru
        </span>
        <span
          style={{
            fontWeight: 400,
            fontSize: "0.85rem",
            color: "#cbd5e1",
            fontStyle: "italic",
            letterSpacing: 0.5,
            marginLeft: "0.05rem",
            opacity: 0.85,
            lineHeight: 1.1,
          }}
        >
          by Niranjan Bagade
        </span>
      </a>
      {session ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <span
            style={{
              color: "#a3e635",
              fontWeight: 500,
            }}
          >
            Welcome, {session.user?.name}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "0.28rem 0.85rem",
              fontWeight: 500,
              fontSize: "0.88rem",
              cursor: "pointer",
              transition: "background 0.2s",
              boxShadow: "0 1px 4px 0 rgba(0,0,0,0.10)",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#dc2626")}
            onFocus={(e) => (e.currentTarget.style.background = "#dc2626")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#ef4444")}
            onBlur={(e) => (e.currentTarget.style.background = "#ef4444")}
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          onClick={() => signIn("google")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            background: "transparent",
            color: "#fff",
            border: "1.5px solid #fff",
            borderRadius: "6px",
            padding: "0.28rem 0.85rem",
            fontWeight: 500,
            fontSize: "0.88rem",
            cursor: "pointer",
            transition:
              "background 0.2s, box-shadow 0.2s, color 0.2s, border-color 0.2s",
            boxShadow: "none",
            outline: "none",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#fff";
            e.currentTarget.style.color = "#18181b";
            e.currentTarget.style.boxShadow = "0 2px 12px 0 rgba(66,133,244,0.10)";
            e.currentTarget.style.borderColor = "#4285f4";
          }}
          onFocus={(e) => {
            e.currentTarget.style.background = "#fff";
            e.currentTarget.style.color = "#18181b";
            e.currentTarget.style.boxShadow = "0 2px 12px 0 rgba(66,133,244,0.10)";
            e.currentTarget.style.borderColor = "#4285f4";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.borderColor = "#fff";
          }}
          onBlur={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.borderColor = "#fff";
          }}
        >
          <Image
            src="/google.svg"
            alt="Google logo"
            width={16}
            height={16}
            style={{ marginRight: 5 }}
          />
          <span>Sign in with Google</span>
        </button>
      )}
    </nav>
  );
}
