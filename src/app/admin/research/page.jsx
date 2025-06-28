"use client";
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default function ResearchPage() {
  const { status, data } = useSession();
  const router = useRouter();
  const [analysis, setAnalysis] = useState({ unapproved: [], approved: [] });
  const [loading, setLoading] = useState(true);

  // State for sellDate and updating for each approved item
  const [sellDateState, setSellDateState] = useState({});
  const [updatingState, setUpdatingState] = useState({});

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
      setLoading(true);
      fetch("/api/analysis/research")
        .then((res) => res.json())
        .then((result) => {
          // Sort unapproved and approved by date descending
          const sortByDateDesc = arr =>
            [...arr].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
          setAnalysis({
            unapproved: sortByDateDesc(result.unapproved || []),
            approved: sortByDateDesc(result.approved || [])
          });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, data]);

  // Update sellDateState when analysis.approved changes
  useEffect(() => {
    if (analysis.approved && Array.isArray(analysis.approved)) {
      const initialSellDates = {};
      analysis.approved.forEach(item => {
        initialSellDates[item._id] = item.sellDate ? new Date(item.sellDate).toISOString().split('T')[0] : '';
      });
      setSellDateState(initialSellDates);
    }
  }, [analysis.approved]);

  // Helper to convert Google Drive view links to direct image links
  function getDirectImageUrl(url) {
    if (!url) return url;
    const match = url.match(/https?:\/\/drive\.google\.com\/file\/d\/([\w-]+)\//);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
    return url;
  }

  if (status === "loading" || loading) {
    return <div className="flex items-center justify-center h-full min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Research Analysis</h1>
      <details open className="mb-4 border rounded-lg shadow">
        <summary className="cursor-pointer px-4 py-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 font-semibold rounded-t-lg">Unapproved Analysis</summary>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-b-lg">
          {/* Render unapproved analysis table or message */}
          {analysis.unapproved.length === 0 ? (
            <div>No unapproved analysis found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Stock Name</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Final Verdict</th>
                    <th className="px-4 py-2">Photo</th>
                    <th className="px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.unapproved.map((item, idx) => (
                    <tr key={item._id || idx} className="border-t">
                      <td className="px-4 py-2">{item.stockName || 'N/A'}</td>
                      <td className="px-4 py-2">{item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-4 py-2">{item.finalVerdict === 'S' ? 'Sell' : item.finalVerdict === 'B' ? 'Buy' : 'N/A'}</td>
                      <td className="px-4 py-2">
                        {item.photoUrl ? (
                          <a href={getDirectImageUrl(item.photoUrl)} target="_blank" rel="noopener noreferrer">
                            <Image
                              src={getDirectImageUrl(item.photoUrl)}
                              alt="photo"
                              width={40}
                              height={40}
                              className="object-cover rounded"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                const fallback = e.target.nextSibling;
                                if (fallback) fallback.style.display = 'block';
                              }}
                              style={{ cursor: 'pointer' }}
                            />
                            <img
                              src={getDirectImageUrl(item.photoUrl)}
                              alt="photo fallback"
                              width={40}
                              height={40}
                              style={{ display: 'none', objectFit: 'cover', borderRadius: '0.25rem', cursor: 'pointer' }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </a>
                        ) : (
                          <span className="text-gray-400">No Photo</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs mr-2"
                          onClick={async () => {
                            await fetch(`/api/analysis/research`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: item._id }),
                            });
                            setLoading(true);
                            fetch("/api/analysis/research")
                              .then((res) => res.json())
                              .then((result) => {
                                setAnalysis(result);
                                setLoading(false);
                              })
                              .catch(() => setLoading(false));
                          }}
                        >
                          Approve
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                          onClick={async () => {
                            await fetch('/api/analysis/research/delete', {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: item._id }),
                            });
                            setLoading(true);
                            fetch("/api/analysis/research")
                              .then((res) => res.json())
                              .then((result) => {
                                setAnalysis(result);
                                setLoading(false);
                              })
                              .catch(() => setLoading(false));
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </details>
      <details className="border rounded-lg shadow">
        <summary className="cursor-pointer px-4 py-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 font-semibold rounded-t-lg">Approved Analysis</summary>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-b-lg">
          {/* Render approved analysis table or message */}
          {analysis.approved.length === 0 ? (
            <div>No approved analysis found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Stock Name</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Final Verdict</th>
                    <th className="px-4 py-2">Photo</th>
                    <th className="px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.approved.map((item, idx) => (
                    <tr key={item._id || idx} className="border-t">
                      <td className="px-4 py-2">{item.stockName || 'N/A'}</td>
                      <td className="px-4 py-2">{item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-4 py-2">{item.finalVerdict === 'S' ? 'Sell' : item.finalVerdict === 'B' ? 'Buy' : 'N/A'}</td>
                      <td className="px-4 py-2">
                        {item.photoUrl ? (
                          <a href={getDirectImageUrl(item.photoUrl)} target="_blank" rel="noopener noreferrer">
                            <Image
                              src={getDirectImageUrl(item.photoUrl)}
                              alt="photo"
                              width={40}
                              height={40}
                              className="object-cover rounded"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                const fallback = e.target.nextSibling;
                                if (fallback) fallback.style.display = 'block';
                              }}
                              style={{ cursor: 'pointer' }}
                            />
                            <img
                              src={getDirectImageUrl(item.photoUrl)}
                              alt="photo fallback"
                              width={40}
                              height={40}
                              style={{ display: 'none', objectFit: 'cover', borderRadius: '0.25rem', cursor: 'pointer' }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </a>
                        ) : (
                          <span className="text-gray-400">No Photo</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="date"
                          value={sellDateState[item._id] || ''}
                          onChange={e => setSellDateState(prev => ({ ...prev, [item._id]: e.target.value }))}
                          className="border rounded px-2 py-1 text-xs mr-2"
                        />
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50 mr-2"
                          disabled={updatingState[item._id] || !sellDateState[item._id]}
                          onClick={async () => {
                            setUpdatingState(prev => ({ ...prev, [item._id]: true }));
                            await fetch('/api/analysis/research/sell-date', {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: item._id, sellDate: sellDateState[item._id] }),
                            });
                            setLoading(true);
                            fetch("/api/analysis/research")
                              .then((res) => res.json())
                              .then((result) => {
                                setAnalysis(result);
                                setLoading(false);
                              })
                              .catch(() => setLoading(false));
                            setUpdatingState(prev => ({ ...prev, [item._id]: false }));
                          }}
                        >
                          {updatingState[item._id] ? 'Updating...' : 'Update Sell Date'}
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                          onClick={async () => {
                            await fetch('/api/analysis/research/delete', {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: item._id }),
                            });
                            setLoading(true);
                            fetch("/api/analysis/research")
                              .then((res) => res.json())
                              .then((result) => {
                                setAnalysis(result);
                                setLoading(false);
                              })
                              .catch(() => setLoading(false));
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </details>
    </div>
  );
}
