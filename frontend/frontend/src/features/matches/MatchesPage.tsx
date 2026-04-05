// @ts-nocheck
import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { apiRequest } from '@/services/api'

const DEMO_MATCHES = [
  { id: '1', name: 'Alex Chen', location: 'Downtown Loft', budget: '$1,200/mo', status: 'Matched', score: 94, lastActive: '2h ago', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxyikFXY2-6wl42CUfA5HbCTA7LCvKIxSPgENy8XRzQxUnH5V5TCQwIUT3np-zKLlNJyDjNy6jzpIwduPGSpIhhsLsriMwaUgjsu5dbLDwlyp6YhVRNpG4uZCio6zBuZ_1ScR74FmtAWXOSf2AVa9iDEjdg5XGlYnM2BBl5rojHv3UBmMNrsdYTHTnJFU6dIKR7bAt-_jqW9PFnvzSJJKaSnbEAFtXQrqy4qAZz-trmNCQG7LV0qUGysjdwM4pyO0piyfBzH3VYQ', sparkline: 'M0,15 L10,20 L20,10 L30,25 L40,15 L50,15 L60,5 L70,20 L80,10 L90,15 L100,10' },
  { id: '2', name: 'Jordan Smith', initials: 'JS', location: 'Brooklyn, NY', budget: '$1,800/mo', status: 'Passed', score: 62, lastActive: '5d ago', sparkline: 'M0,25 L10,25 L20,25 L30,25 L40,25 L50,25 L60,25 L70,25 L80,25 L90,25 L100,25', flat: true },
  { id: '3', name: 'Michael Ross', location: 'Austin, TX', budget: '$900/mo', status: 'Archived', score: 88, lastActive: '1mo ago', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJCUHI-o5kv8bfNtwtfIRrbbXLO4bdiw-jp_A7Q5mh8bvgnCff0B0ZWLhL6KjujbpIAd1-XjIXa2naTH3nHtZ8fo8ADdg_kTczFGhJd_lSWJny0cZ07UwnlzRNLrXZsoo1GNyQfrnVh-5PWiHAn2AcnLI0O_HAKU3SzG2QDi2wf3r6itmLlblW_g2JXzLG9vOgmr-9IlZHqeBGUEoBat-zPEMxid7Xtflp9wLTvhB_ga9683N6--2nLe0YVJ6FMrItreJYep-3Hw', sparkline: 'M0,20 L10,15 L20,18 L30,10 L40,12 L50,8 L60,15 L70,20 L80,25 L90,28 L100,28' },
  { id: '4', name: 'Sarah Jenkins', location: 'San Francisco', budget: '$2,400/mo', status: 'Matched', score: 91, lastActive: '12m ago', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC54YSNAh15AuDVMZ6l74v_SfUnmifemGlF07dS2Icjvjxm0VbIrr0M7pDeyGZNmC63ieUgT6DH5MplNAQA95dXEpVeBxjtN7gY3pHWTlS6mamXNHfK_M8X52DmleYpCTWOsjskths1ZoBbKDcjvhHoYLQAsKfqMvVajLyu3-VWqvirYaVL_BPFCRZybyr86r-WOYkFU1PjEsmz0YHrUEx6ks8SONumWP0733bfR_Aw9w8Mkvotxfl5hoL2CRi_yJAMhPe0d8wyiw', sparkline: 'M0,28 L10,25 L20,20 L30,15 L40,10 L50,15 L60,10 L70,5 L80,5 L90,10 L100,5' },
  { id: '5', name: 'David Wu', initials: 'DW', location: 'Seattle, WA', budget: '$1,500/mo', status: 'Passed', score: 45, lastActive: '2mo ago', sparkline: 'M0,15 L10,15 L20,15 L30,15 L40,15 L50,15 L60,15 L70,15 L80,15 L90,15 L100,15', flat: true },
]

function StatusBadge({ status }) {
  const styles = {
    Matched: 'bg-mint text-[#166534] border-[#166534]/20',
    Passed: 'bg-gray-100 text-gray-600 border-gray-200',
    Archived: 'bg-amber-50 text-amber-700 border-amber-200',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-sm text-[10px] font-mono font-medium border uppercase tracking-wide ${styles[status] || styles.Passed}`}>
      {status}
    </span>
  )
}

export default function MatchesPage() {
  const { getAccessTokenSilently } = useAuth0()
  const [matches, setMatches] = useState(DEMO_MATCHES)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    setErrorMessage('')
    apiRequest('/matches/me', {}, getAccessTokenSilently)
      .then(data => { if (data?.length > 0) setMatches(data) })
      .catch(() => { setErrorMessage('Unable to load matches right now.') })
      .finally(() => setIsLoading(false))
  }, [getAccessTokenSilently])

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-canvas">
      {/* Header */}
      <div className="flex flex-col bg-canvas border-b border-neutral-border">
        <div className="px-4 pb-4 pt-6 md:px-6 md:pt-8">
          <h2 className="text-2xl font-bold tracking-tight text-[#111318]">Match Archives</h2>
          <p className="text-[#616f89] text-sm">Review past interactions and manage archived roommate candidates.</p>
        </div>
        <div className="flex flex-wrap items-end gap-3 px-4 pb-6 pt-2 md:px-6">
          <div className="flex-1 min-w-[240px] max-w-sm">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Search</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-gray-400 text-[20px]">search</span>
              </div>
              <input
                className="block w-full cursor-not-allowed border border-neutral-border rounded-lg bg-neutral-100 pl-10 pr-3 py-2 text-sm text-gray-400 placeholder-gray-400"
                placeholder="Search coming soon"
                type="text"
                disabled
                aria-label="Search matches coming soon"
              />
            </div>
          </div>
          {[{ label: 'Status', options: ['All Statuses', 'Matched', 'Passed', 'Archived'] },
            { label: 'Date', options: ['Last 30 Days', 'Last 3 Months', 'Year to Date'] },
            { label: 'Budget', options: ['All Tiers', '$500 - $1k', '$1k - $2k', '$2k+'] }]
            .map(f => (
            <div key={f.label} className="w-40">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{f.label}</label>
              <select
                className="block w-full cursor-not-allowed border border-neutral-border rounded-lg bg-neutral-100 py-2 pl-3 pr-8 text-sm text-gray-500"
                disabled
                aria-label={`${f.label} filter coming soon`}
              >
                {f.options.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="h-[38px] cursor-not-allowed rounded-lg border border-transparent px-4 text-xs font-medium text-gray-400"
            title="Filters are preview-only in this phase"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-4 pt-5 md:p-6 md:pt-6">
        <div className="mx-auto w-full max-w-[1500px]">
          {isLoading ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-neutral-200 bg-white shadow-sm" aria-busy="true" aria-live="polite">
              <div className="flex flex-col items-center gap-3" role="status">
                <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-[#166534]" />
                <p className="text-xs font-mono text-slate-500">Loading match history...</p>
              </div>
            </div>
          ) : errorMessage ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-6 text-center shadow-sm" role="alert">
              <p className="text-sm font-semibold text-amber-900">Could not load matches.</p>
              <p className="text-xs text-amber-800">{errorMessage}</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-white px-6 text-center shadow-sm">
              <p className="text-sm font-semibold text-slate-700">No matches to review yet.</p>
              <p className="text-xs text-slate-500">Once new match activity appears, it will be listed here.</p>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-neutral-border bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-[860px] w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-neutral-border text-xs text-gray-500 uppercase tracking-wider font-semibold">
                <th className="px-6 py-3 w-16"><input className="h-4 w-4 cursor-not-allowed rounded border-gray-300 text-[#166534] focus:ring-[#166534]" type="checkbox" disabled aria-label="Bulk select coming soon" /></th>
                <th className="px-6 py-3">Candidate</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Match %</th>
                <th className="px-6 py-3">Engagement (30d)</th>
                <th className="px-6 py-3">Last Active</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-border">
              {matches.map(m => (
                <tr key={m.id} className={`group transition-colors ${m.status === 'Matched' ? 'hover:bg-mint/30' : 'hover:bg-gray-50'}`}>
                  <td className="px-6 py-3">
                    <input className="h-4 w-4 cursor-not-allowed rounded border-gray-300 text-[#166534] focus:ring-[#166534] opacity-40" type="checkbox" disabled aria-label={`Selection for ${m.name} coming soon`} />
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      {m.img ? (
                        <img className="h-9 w-9 rounded object-cover border border-gray-200" src={m.img} alt={m.name} />
                      ) : (
                        <div className="h-9 w-9 rounded bg-gray-50 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">{m.initials}</div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[#111318]">{m.name}</span>
                        <span className="text-xs text-[#616f89]">{m.location} • {m.budget}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3"><StatusBadge status={m.status} /></td>
                  <td className="px-6 py-3">
                    <span className={`text-sm font-mono font-medium ${m.score >= 80 ? 'text-[#111318]' : 'text-gray-500'}`}>{m.score}%</span>
                  </td>
                  <td className="px-6 py-3">
                    <div className={`w-24 h-8 flex items-center ${m.flat ? 'opacity-40 grayscale' : ''}`}>
                      <svg className={`w-full h-full ${m.status === 'Matched' ? 'stroke-[#166534]' : m.status === 'Archived' ? 'stroke-amber-500' : 'stroke-gray-500'}`} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 100 30">
                        <path d={m.sparkline} />
                      </svg>
                    </div>
                  </td>
                  <td className="px-6 py-3"><span className="text-sm font-mono text-gray-500">{m.lastActive}</span></td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button className="cursor-not-allowed p-1.5 text-gray-400 rounded transition-colors" title="Re-connect coming soon" disabled aria-label={`Re-connect with ${m.name} coming soon`}>
                        <span className="material-symbols-outlined text-[20px]">cached</span>
                      </button>
                      <button className="cursor-not-allowed p-1.5 text-gray-400 rounded transition-colors" title="Archive coming soon" disabled aria-label={`Archive ${m.name} coming soon`}>
                        <span className="material-symbols-outlined text-[20px]">archive</span>
                      </button>
                      <button className="cursor-not-allowed p-1.5 text-gray-400 rounded transition-colors" title="Delete coming soon" disabled aria-label={`Delete ${m.name} coming soon`}>
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 text-xs text-[#616f89]">
                <span>Showing 1-{matches.length} of {matches.length} candidates</span>
                <div className="flex items-center gap-2">
                  <button className="cursor-not-allowed rounded border border-neutral-border bg-white px-3 py-1 transition-colors disabled:opacity-50" disabled aria-disabled="true" title="Pagination is not wired in this phase">Previous</button>
                  <button className="cursor-not-allowed rounded border border-neutral-border bg-white px-3 py-1 transition-colors disabled:opacity-50" disabled aria-disabled="true" title="Pagination is not wired in this phase">Next</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
