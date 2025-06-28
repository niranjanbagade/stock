"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading/Loading";

export default function ApprovalsPage() {
  const { status, data } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (
      status === "unauthenticated" ||
      (status === "authenticated" && !data?.user?.isAdmin)
    ) {
      router.replace("/");
    }
  }, [status, data, router]);

  useEffect(() => {
    if (status === "authenticated" && data?.user?.isAdmin) {
      fetchUsers();
    }
    // eslint-disable-next-line
  }, [status, data]);

  const fetchUsers = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/admin/unapproved-users");
      const json = await res.json();
      setUsers(json.users || []);
    } catch (e) {
      setUsers([]);
    }
    setFetching(false);
  };

  const handleApprove = async (userId) => {
    setLoading(userId);
    setShowModal(true);
    try {
      const res = await fetch("/api/admin/approve-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        await fetchUsers();
      }
    } catch (e) {
      // Optionally log or handle error
    }
    setLoading(false);
    setShowModal(false);
  };

  if (status === "loading" || fetching) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center h-full w-full p-4 bg-gray-950 min-h-screen">
      {/* Modal popup for loading */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-900 rounded-lg p-8 flex flex-col items-center shadow-lg">
            <Loading />
            <span className="mt-4 text-gray-200">Approving user...</span>
          </div>
        </div>
      )}
      {/* Top section with continue to profile */}
      <div className="w-full max-w-xl flex items-center justify-between mt-8 mb-2 p-4 bg-gray-900 rounded shadow border border-gray-800">
        <span className="text-lg font-semibold text-blue-300">
          Want to manage your profile?
        </span>
        <button
          className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded shadow"
          onClick={() => router.push("/profile")}
        >
          Go to Profile
        </button>
      </div>
      {/* Section to go to research */}
      <div className="w-full max-w-xl flex items-center justify-between mb-6 p-4 bg-gray-900 rounded shadow border border-gray-800">
        <span className="text-lg font-semibold text-purple-300">
          Want to view or manage research?
        </span>
        <button
          className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded shadow"
          onClick={() => router.push("/admin/research")}
        >
          Go to Research
        </button>
      </div>
      <h1 className="text-2xl font-bold mb-4 text-gray-100">
        Pending Approvals
      </h1>
      {users.length === 0 ? (
        <p className="text-gray-400">No users pending approval.</p>
      ) : (
        <ul className="w-full max-w-xl space-y-3">
          {users.map((user) => {
            let userInitial = "?";
            if (user.name) {
              userInitial = user.name.charAt(0).toUpperCase();
            } else if (user.email) {
              userInitial = user.email.charAt(0).toUpperCase();
            }
            return (
              <li
                key={user._id}
                className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg shadow p-4 hover:shadow-lg transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-800 rounded-full w-10 h-10 flex items-center justify-center text-gray-400 font-bold text-lg">
                    {userInitial}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-100">
                      {user.name || "No Name"}
                    </span>
                    <span className="text-gray-400 text-sm">{user.email}</span>
                  </div>
                </div>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow disabled:opacity-50 flex items-center justify-center min-w-[90px] min-h-[32px]"
                  onClick={() => handleApprove(user._id)}
                  disabled={!!loading}
                >
                  Approve
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
