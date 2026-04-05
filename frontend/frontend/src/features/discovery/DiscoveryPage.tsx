// @ts-nocheck
import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { connectToProfile, fetchDiscoveryFeed } from './discovery.transport'


export default function DiscoveryPage() {
  const { getAccessTokenSilently } = useAuth0()
  const [profiles, setProfiles] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [refreshSeed, setRefreshSeed] = useState(0)
  const selected = profiles.find(p => p.id === selectedId) || profiles[0]

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    setErrorMessage('')
    fetchDiscoveryFeed(getAccessTokenSilently)
      .then(data => {
        if (isMounted) {
          if (data?.length > 0) {
            setProfiles(data)
            setSelectedId(data[0].id)
          } else {
            setProfiles([])
            setSelectedId('')
          }
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setProfiles([])
          setSelectedId('')
          setErrorMessage('Unable to load discovery feed right now.')
          setIsLoading(false)
        }
      })
    return () => { isMounted = false }
  }, [getAccessTokenSilently, refreshSeed])

  const handlePass = () => {
    const remaining = profiles.filter(p => p.id !== selectedId)
    setProfiles(remaining)
    setSelectedId(remaining[0]?.id || '')
  }
  const handleConnect = async () => {
    try { await connectToProfile(selectedId, getAccessTokenSilently) } catch {}
    handlePass()
  }

  if (isLoading) {
    return (
      <section className="flex flex-1 p-4 md:p-6" aria-busy="true" aria-live="polite">
        <div className="flex min-h-[280px] w-full items-center justify-center rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex flex-col items-center gap-3" role="status">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-[#166534]" />
            <p className="text-xs font-mono text-slate-500">Loading discovery queue...</p>
          </div>
        </div>
      </section>
    )
  }

  if (errorMessage) {
    return (
      <section className="flex flex-1 p-4 md:p-6">
        <div className="flex min-h-[280px] w-full flex-col items-center justify-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-6 text-center shadow-sm" role="alert">
          <p className="text-sm font-semibold text-amber-900">Could not load discovery profiles.</p>
          <p className="text-xs text-amber-800">{errorMessage}</p>
          <button
            type="button"
            onClick={() => setRefreshSeed((seed) => seed + 1)}
            className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
          >
            Retry
          </button>
        </div>
      </section>
    )
  }

  if (!selected) {
    return (
      <section className="flex flex-1 p-4 md:p-6">
        <div className="flex min-h-[280px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-white px-6 text-center shadow-sm" role="status" aria-live="polite">
          <p className="text-sm font-semibold text-slate-700">No profiles available right now.</p>
          <p className="text-xs text-slate-500">Check back later to see new roommate candidates.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="flex h-full min-w-0 flex-1 p-4 md:p-6">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm lg:flex-row">
      {/* Queue Panel */}
      <section className="flex w-full shrink-0 flex-col overflow-hidden border-b border-neutral-200 bg-white lg:w-[320px] lg:border-b-0 lg:border-r xl:w-[360px]">
        <div className="p-4 border-b border-neutral-200 space-y-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[20px]">search</span>
            <input
              className="w-full cursor-not-allowed pl-10 pr-4 py-2.5 bg-neutral-100 border border-neutral-200 rounded-lg text-sm text-gray-400 placeholder:text-gray-400 font-mono"
              placeholder="Search coming soon"
              type="text"
              disabled
              aria-label="Search criteria coming soon"
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <h3 className="font-bold text-[11px] tracking-wider text-gray-500 uppercase">Queue ({profiles.length})</h3>
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="flex cursor-not-allowed items-center gap-1 text-[11px] font-bold uppercase text-gray-400"
              title="Filters are not wired in this phase"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span> Filters
            </button>
          </div>
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wide">Search and filters are preview-only.</p>
        </div>
        <div className="max-h-[320px] flex-1 overflow-y-auto p-3 space-y-2 lg:max-h-none">
          {profiles.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedId(p.id)}
              className={`w-full text-left flex items-center gap-3 p-3 rounded-lg cursor-pointer relative group transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#166534] focus-visible:ring-offset-1 ${
                p.id === selectedId ? 'bg-mint border border-[#166534] shadow-sm' : 'border border-transparent hover:border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              {p.id === selectedId && <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#166534] rounded-r" />}
              <div className={`bg-center bg-no-repeat bg-cover rounded-full size-11 shrink-0 border transition-all ${
                p.id === selectedId ? 'border-[#166534]/20' : 'border-neutral-200 grayscale group-hover:grayscale-0'
              }`} style={{ backgroundImage: `url('${p.img}')` }} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className={`text-sm truncate ${p.id === selectedId ? 'font-bold text-neutral-900' : 'font-medium text-neutral-900'}`}>{p.name}</p>
                  <span className={`font-mono text-xs ${p.id === selectedId ? 'text-[#166534] font-bold' : 'text-gray-400 font-medium'}`}>{p.score}%</span>
                </div>
                <p className={`text-xs truncate mt-0.5 font-mono ${p.id === selectedId ? 'text-[#166534]/70' : 'text-gray-500'}`}>{p.occupation} • {p.age}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Profile Detail */}
      <section className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-white">
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl p-5 pb-32 md:p-8">
            <div className="flex gap-8 mb-10">
              <div className="shrink-0">
                <div className="bg-center bg-no-repeat bg-cover rounded-lg size-32 border border-neutral-200" style={{ backgroundImage: `url('${selected.img}')` }} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start border-b border-neutral-200 pb-6 mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">{selected.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm font-mono">
                      <span className="flex items-center gap-1.5 text-neutral-800"><span className="material-symbols-outlined text-[18px]">cake</span> {selected.age}</span>
                      <span className="w-px h-4 bg-neutral-300" />
                      <span className="flex items-center gap-1.5 text-neutral-800"><span className="material-symbols-outlined text-[18px]">work</span> {selected.occupation}</span>
                      {selected.school && <><span className="w-px h-4 bg-neutral-300" /><span className="flex items-center gap-1.5 text-neutral-800"><span className="material-symbols-outlined text-[18px]">school</span> {selected.school}</span></>}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Compatibility</span>
                    <div className="font-mono text-4xl font-bold text-[#166534] tracking-tighter">{selected.score}%</div>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed text-sm max-w-2xl font-medium">{selected.bio || 'Looking for a clean, respectful roommate to share a great space.'}</p>
                {selected.tags && (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {selected.tags.map(t => <span key={t} className="inline-flex items-center rounded-lg border border-neutral-200 px-3 py-1 text-xs font-semibold text-gray-600 bg-neutral-50 font-mono">{t}</span>)}
                  </div>
                )}
              </div>
            </div>

            {/* Data Grid */}
            <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white">
              <div className="grid grid-cols-2">
                <div className="p-8 border-b border-r border-neutral-200">
                  <div className="flex items-center gap-2 mb-4 text-gray-400 uppercase tracking-widest text-[10px] font-bold">
                    <span className="material-symbols-outlined text-[16px]">payments</span> Monthly Budget
                  </div>
                  <div className="font-mono text-2xl font-bold text-neutral-900">{selected.budget || '$1,000 - $1,500'}<span className="text-lg text-gray-400 font-normal">/mo</span></div>
                  <div className="mt-4"><span className="inline-flex items-center rounded border border-[#166534]/20 px-2 py-1 text-[10px] font-bold text-[#166534] bg-mint uppercase tracking-wide">Includes Utilities</span></div>
                </div>
                <div className="p-8 border-b border-neutral-200">
                  <div className="flex items-center gap-2 mb-4 text-gray-400 uppercase tracking-widest text-[10px] font-bold">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span> Timeline
                  </div>
                  <div className="grid gap-4">
                    <div className="flex justify-between items-baseline border-b border-dashed border-neutral-200 pb-2">
                      <span className="text-sm text-gray-500 font-medium">Move-in</span>
                      <span className="font-mono text-lg font-bold text-neutral-900">{selected.moveIn || 'Flexible'}</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-1">
                      <span className="text-sm text-gray-500 font-medium">Duration</span>
                      <span className="font-mono text-sm font-bold text-neutral-900">{selected.duration || '6+ Months'}</span>
                    </div>
                  </div>
                </div>
                <div className="p-8 border-r border-neutral-200 bg-neutral-50/30">
                  <div className="flex items-center gap-2 mb-6 text-gray-400 uppercase tracking-widest text-[10px] font-bold">
                    <span className="material-symbols-outlined text-[16px]">home_health</span> Lifestyle
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 font-medium">Cleanliness</span>
                      <div className="flex gap-1">{[1,2,3,4].map(i => <div key={i} className={`w-6 h-1.5 rounded-sm ${i <= (selected.cleanliness || 3) ? 'bg-[#166534]' : 'bg-neutral-200'}`} />)}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 font-medium">Guests</span>
                      <span className="font-mono text-[10px] font-bold border border-neutral-200 bg-white px-2 py-0.5 rounded text-gray-600">{selected.guests || 'SOMETIMES'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 font-medium">Pets</span>
                      <span className="font-mono text-[10px] font-bold border border-neutral-200 bg-white px-2 py-0.5 rounded text-gray-600">{selected.pets || 'NONE'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 font-medium">Smoking</span>
                      <span className="font-mono text-[10px] font-bold border border-neutral-200 bg-white px-2 py-0.5 rounded text-gray-600">{selected.smoking || 'NEVER'}</span>
                    </div>
                  </div>
                </div>
                <div className="relative h-full min-h-[200px] group overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCu7x3ZCH9-wPrGGOZDBkib3Ua9q42BmmEqZ_7LZUhFbLncEwbdVropNGXiYNPNYTv4CpOqIAy5jZI5i4mWSuVEzlk7-_6OgHbUTuRy3HVKb2evj5kq937BD7WZAm038HgRR9HznMTBxft20C80ZbKW1nufEPPEMBPZJPxmUx_noTYTAXdKh05ndJVf21qWVMvaRR39R7aHN1uhumyA7p4otpmRr7NTvMcMdr8scJfEns9gd_YASJrP1Z0XYNsi7fEjxqpk0cRePg')" }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/40 to-transparent p-6 flex flex-col justify-end">
                    <div className="flex items-center gap-2 mb-1 text-white/90 uppercase tracking-widest text-[10px] font-bold">
                      <span className="material-symbols-outlined text-[14px]">location_on</span> Preferred Area
                    </div>
                    <p className="text-white font-bold text-lg tracking-tight">{selected.location || 'Downtown'}</p>
                    <p className="text-white/80 text-xs font-mono mt-1">{selected.city || 'New York, NY'} • +2mi radius</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-neutral-200 p-4 md:px-8 md:py-5 flex justify-between items-center z-20">
          <div className="flex items-center gap-3 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="flex cursor-not-allowed items-center gap-1 py-2 px-3 rounded"
              title="Previous and next queue shortcuts are not wired in this phase"
            >
              <span className="border border-gray-300 rounded w-5 h-5 flex items-center justify-center text-xs">←</span> Prev
            </button>
            <div className="h-4 w-px bg-neutral-200" />
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="flex cursor-not-allowed items-center gap-1 py-2 px-3 rounded"
              title="Previous and next queue shortcuts are not wired in this phase"
            >
              Next <span className="border border-gray-300 rounded w-5 h-5 flex items-center justify-center text-xs">→</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handlePass} className="h-12 px-8 rounded-lg border-2 border-neutral-200 text-neutral-900 font-bold hover:bg-neutral-50 transition-colors uppercase tracking-wide text-xs flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500">
              <span className="material-symbols-outlined text-[18px]">close</span> Pass
            </button>
            <button onClick={handleConnect} className="h-12 px-8 rounded-lg bg-[#166534] text-white font-bold hover:bg-[#14532d] transition-colors uppercase tracking-wide text-xs shadow-sm flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#166534] focus-visible:ring-offset-1">
              <span className="material-symbols-outlined text-[18px]">check</span> Connect
            </button>
          </div>
        </div>
      </section>
      </div>
    </section>
  )
}
