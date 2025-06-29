"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function StatusPage() {
  const { data: session, status } = useSession();
  const [analysis, setAnalysis] = useState({ unapproved: [], approved: [] });
  const [loading, setLoading] = useState(true);
  const [notePopup, setNotePopup] = useState({ open: false, stockName: '', note: '' });

  // Helper to convert Google Drive view links to direct image links
  function getDirectImageUrl(url) {
    if (!url) return url;
    const match = url.match(
      /https?:\/\/drive\.google\.com\/file\/d\/([\w-]+)\//
    );
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
    return url;
  }

  useEffect(() => {
    if (status === "authenticated") {
      setLoading(true);
      fetch("/api/analysis/research")
        .then((res) => res.json())
        .then((result) => {
          const userEmail = session?.user?.email;
          // Sort approved by sellDate (desc), unapproved by date (desc)
          const approvedSorted = (result.approved || []).sort((a, b) => {
            const aDate = a.sellDate ? new Date(a.sellDate) : new Date(0);
            const bDate = b.sellDate ? new Date(b.sellDate) : new Date(0);
            return bDate - aDate;
          });
          const filteredUnapproved = (result.unapproved || []).filter(
            (item) => item.userEmail === userEmail
          );
          const unapprovedSorted = filteredUnapproved.sort((a, b) => {
            const aDate = a.date ? new Date(a.date) : new Date(0);
            const bDate = b.date ? new Date(b.date) : new Date(0);
            return bDate - aDate;
          });
          setAnalysis({
            unapproved: unapprovedSorted,
            approved: approvedSorted,
          });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, session]);

  function handleOpenNotePopup(item) {
    setNotePopup({ open: true, stockName: item.stockName || 'N/A', note: item.note || '' });
  }
  function handleCloseNotePopup() {
    setNotePopup({ open: false, stockName: '', note: '' });
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        Loading...
      </div>
    );
  }
  if (status === "unauthenticated") {
    return <div>Please log in to view your status.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 min-h-screen">
      <details
        open
        className="mb-4 border rounded-lg shadow dark:border-gray-700"
      >
        <summary className="cursor-pointer px-4 py-3 bg-green-100 text-green-700 font-semibold rounded-t-lg dark:bg-green-900 dark:text-green-200">
          Approved Analysis
        </summary>
        <div className="p-4 bg-white rounded-b-lg dark:bg-gray-800">
          {analysis.approved.length === 0 ? (
            <div className="text-gray-700 dark:text-gray-300">
              No approved items found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-gray-900 dark:text-gray-100">
                      Stock Name
                    </th>
                    <th className="px-4 py-2 text-gray-900 dark:text-gray-100">
                      Date
                    </th>
                    <th className="px-4 py-2 text-gray-900 dark:text-gray-100">
                      Final Verdict
                    </th>
                    <th className="px-4 py-2 text-gray-900 dark:text-gray-100">
                      Sell Date
                    </th>
                    <th className="px-4 py-2 text-gray-900 dark:text-gray-100">
                      Chart
                    </th>
                    <th className="px-4 py-2 text-gray-900 dark:text-gray-100">
                      Note
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.approved.map((item, idx) => (
                    <tr
                      key={item._id || idx}
                      className="border-t dark:border-gray-700"
                    >
                      <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                        {item.stockName || "N/A"}
                      </td>
                      <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                        {item.date
                          ? new Date(item.date).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                        {item.finalVerdict === "S"
                          ? "Sell"
                          : item.finalVerdict === "B"
                          ? "Buy"
                          : item.verdict || "N/A"}
                      </td>
                      <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                        {item.sellDate ? (
                          new Date(item.sellDate).toLocaleDateString()
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">
                            -
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {item.photoUrl ? (
                          <a
                            href={getDirectImageUrl(item.photoUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Image
                              src={getDirectImageUrl(item.photoUrl)}
                              alt="photo"
                              width={40}
                              height={40}
                              className="object-cover rounded border dark:border-gray-700"
                              onError={(e) => {
                                e.target.style.display = "none";
                                const fallback = e.target.nextSibling;
                                if (fallback) fallback.style.display = "block";
                              }}
                              style={{ cursor: "pointer" }}
                            />
                            <img
                              src={getDirectImageUrl(item.photoUrl)}
                              alt="photo fallback"
                              width={40}
                              height={40}
                              style={{
                                display: "none",
                                objectFit: "cover",
                                borderRadius: "0.25rem",
                                cursor: "pointer",
                              }}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          </a>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">
                            No Photo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {item.note && item.note.trim() !== "" ? (
                          <>
                            <span>{item.note.slice(0, 10)}...</span>
                            <button
                              className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
                              onClick={() => handleOpenNotePopup(item)}
                              title="View Note"
                              type="button"
                            >
                              {/* Info icon */}
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 17v-4m0-4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </details>
      <details className="border rounded-lg shadow dark:border-gray-700">
        <summary className="cursor-pointer px-4 py-3 bg-yellow-100 text-yellow-700 font-semibold rounded-t-lg dark:bg-yellow-900 dark:text-yellow-200">
          Your Unapproved Analysis
        </summary>
        <div className="p-4 bg-white rounded-b-lg dark:bg-gray-800">
          {analysis.unapproved.length === 0 ? (
            <div className="text-gray-700 dark:text-gray-300">
              No unapproved items found for your account.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-gray-900 dark:text-gray-100">
                      Stock Name
                    </th>
                    <th className="px-4 py-2 text-gray-900 dark:text-gray-100">
                      Date
                    </th>
                    <th className="px-4 py-2 text-gray-900 dark:text-gray-100">
                      Final Verdict
                    </th>
                    <th className="px-4 py-2 text-gray-900 dark:text-gray-100">
                      Sell Date
                    </th>
                    <th className="px-4 py-2 text-gray-900 dark:text-gray-100">
                      Chart
                    </th>
                    <th className="px-4 py-2 text-gray-900 dark:text-gray-100">
                      Note
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.unapproved.map((item, idx) => (
                    <tr
                      key={item._id || idx}
                      className="border-t dark:border-gray-700"
                    >
                      <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                        {item.stockName || "N/A"}
                      </td>
                      <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                        {item.date
                          ? new Date(item.date).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                        {item.finalVerdict === "S"
                          ? "Sell"
                          : item.finalVerdict === "B"
                          ? "Buy"
                          : item.verdict || "N/A"}
                      </td>
                      <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                        {item.sellDate ? (
                          new Date(item.sellDate).toLocaleDateString()
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">
                            -
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {item.photoUrl ? (
                          <a
                            href={getDirectImageUrl(item.photoUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Image
                              src={getDirectImageUrl(item.photoUrl)}
                              alt="photo"
                              width={40}
                              height={40}
                              className="object-cover rounded border dark:border-gray-700"
                              onError={(e) => {
                                e.target.style.display = "none";
                                const fallback = e.target.nextSibling;
                                if (fallback) fallback.style.display = "block";
                              }}
                              style={{ cursor: "pointer" }}
                            />
                            <img
                              src={getDirectImageUrl(item.photoUrl)}
                              alt="photo fallback"
                              width={40}
                              height={40}
                              style={{
                                display: "none",
                                objectFit: "cover",
                                borderRadius: "0.25rem",
                                cursor: "pointer",
                              }}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          </a>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">
                            No Photo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {item.note && item.note.trim() !== "" ? (
                          <>
                            <span>{item.note.slice(0, 10)}...</span>
                            <button
                              className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
                              onClick={() => handleOpenNotePopup(item)}
                              title="View Note"
                              type="button"
                            >
                              {/* Info icon */}
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 17v-4m0-4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </details>
      {notePopup.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none"
              onClick={handleCloseNotePopup}
              title="Close"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold mb-2">{notePopup.stockName}</h2>
            <div className="text-gray-800 dark:text-gray-100 whitespace-pre-line break-words">
              {notePopup.note}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
