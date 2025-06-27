"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "../../components/loading/Loading";
import PropTypes from "prop-types";

export default function ProfilePage({ params }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading />
      </div>
    );
  }

  if (session?.user?.adminApproved === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-xl font-semibold mb-2">
          Message admin to approve your request to use this portal
        </h2>
        <p className="text-md mt-2">
          Or contact admin at:{" "}
          <a
            href="mailto:niranjanbagade909@gmail.com"
            className="text-blue-600 underline"
          >
            niranjanbagade909@gmail.com
          </a>
        </p>
      </div>
    );
  }

  if (session?.user?.adminApproved === true) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-2">
          Welcome, {session.user.name || session.user.email}!
        </h1>
        <p className="text-lg">
          Your user ID:{" "}
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">
            {params.userId}
          </span>
        </p>
      </div>
    );
  }

  // fallback (should not reach here)
  return <Loading />;
}

ProfilePage.propTypes = {
  params: PropTypes.shape({
    userId: PropTypes.string.isRequired,
  }).isRequired,
};
