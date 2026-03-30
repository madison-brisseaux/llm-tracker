'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Model, PROVIDERS, PROVIDER_COLORS, SortField, SortDir, sortModels, formatDate } from '@/lib/models';

interface Props {
  models: Model[];
  lastUpdated: string | null;
}

function ProviderBadge({ provider }: { provider: string }) {
  const colors = PROVIDER_COLORS[provider] ?? { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${colors.bg} ${colors.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {provider}
    </span>
  );
}

function SortIcon({ field, current, dir }: { field: SortField; current: SortField; dir: SortDir }) {
  const active = field === current;
  return (
    <span className={`ml-1 text-xs ${active ? 'text-[#F7594E]' : 'text-[#DFD8D8]'}`}>
      {active ? (dir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );
}

export default function ModelTable({ models, lastUpdated }: Props) {
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('releaseDate');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'releaseDate' ? 'desc' : 'asc');
    }
  };

  const filtered = useMemo(() => {
    let result = models;
    if (providerFilter !== 'All') result = result.filter(m => m.provider === providerFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        m => m.model.toLowerCase().includes(q) ||
             m.provider.toLowerCase().includes(q) ||
             m.notes.toLowerCase().includes(q)
      );
    }
    return sortModels(result, sortField, sortDir);
  }, [models, providerFilter, search, sortField, sortDir]);


  return (
    <div className="min-h-screen bg-[#F6F6F6]" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>

      {/* Signature gradient bar */}
      <div className="h-1 w-full" style={{
        background: 'linear-gradient(to right, #000000, #00DEE6, #FFFFFF, #FC9F29, #F7594E)'
      }} />

      {/* Header */}
      <div className="bg-white border-b border-[#DFD8D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-3">
            {/* Logo + title */}
            <div className="flex items-center gap-3 min-w-0">
              <Image
                src="/evertune-logo-black.png"
                alt="Evertune"
                width={100}
                height={28}
                className="object-contain shrink-0 sm:w-[120px]"
                priority
              />
              <div className="w-px h-8 bg-[#DFD8D8] shrink-0" />
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-semibold text-[#000000] tracking-tight leading-tight">
                  AI Model Release Dashboard
                </h1>
                <p className="text-xs text-[#595959] mt-0.5 font-normal hidden sm:block">
                  Tracking releases from leading AI providers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* RSS feed link */}
              <a
                href="/feed.xml"
                target="_blank"
                rel="noopener noreferrer"
                title="Subscribe via RSS"
                className="flex items-center gap-1.5 text-xs font-medium text-[#7F7F7F] hover:text-[#F7594E] transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"/>
                </svg>
                <span className="hidden sm:inline">RSS</span>
              </a>

              {/* Last updated */}
              {lastUpdated && (
                <div className="text-right text-xs text-[#7F7F7F]">
                  <div className="font-medium text-[#595959]">Last updated</div>
                  <div>{new Date(lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters + table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col gap-3 mb-4 sm:mb-5">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7F7F7F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search models..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2.5 w-full sm:max-w-xs bg-white border border-[#DFD8D8] rounded-lg text-sm text-[#000000] placeholder-[#7F7F7F] focus:outline-none focus:border-[#F7594E] focus:ring-1 focus:ring-[#F7594E]"
            />
          </div>

          {/* Provider filters */}
          <div className="flex flex-wrap gap-2">
            {['All', ...PROVIDERS].map(p => {
              const active = providerFilter === p;
              return (
                <button
                  key={p}
                  onClick={() => setProviderFilter(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-[#F7594E] text-white shadow-sm'
                      : 'bg-white text-[#595959] border border-[#DFD8D8] hover:border-[#F7594E] hover:text-[#F7594E]'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

        </div>

        {/* Desktop table */}
        <div className="hidden sm:block bg-white rounded-xl border border-[#DFD8D8] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#DFD8D8]">
              <thead>
                <tr className="bg-[#F6F6F6]">
                  {([
                    { label: 'Provider', field: 'provider' as SortField },
                    { label: 'Model', field: 'model' as SortField },
                    { label: 'Release Date', field: 'releaseDate' as SortField },
                  ] as const).map(col => (
                    <th
                      key={col.field}
                      onClick={() => handleSort(col.field)}
                      className="px-6 py-3 text-left text-xs font-bold text-[#595959] uppercase tracking-wider cursor-pointer hover:text-[#F7594E] select-none whitespace-nowrap transition-colors"
                    >
                      {col.label}
                      <SortIcon field={col.field} current={sortField} dir={sortDir} />
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#595959] uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFD8D8]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-[#7F7F7F] text-sm">
                      No models match your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map(model => (
                    <tr key={model.id} className="hover:bg-[#FEEEED] transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ProviderBadge provider={model.provider} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-[#000000]">{model.model}</span>
                          {model.freeDefault && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Free default
                            </span>
                          )}
                          {model.link && (
                            <a
                              href={model.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#DFD8D8] group-hover:text-[#F7594E] transition-colors"
                              title="View announcement"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-[#595959] font-medium tabular-nums">{formatDate(model.releaseDate)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[#595959] max-w-xl leading-relaxed">{model.notes}</p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-6 py-3 bg-[#F6F6F6] border-t border-[#DFD8D8] flex items-center justify-end">
              <span className="text-xs text-[#7F7F7F]">
                Sources: official provider blogs &amp; changelogs
              </span>
            </div>
          )}
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#DFD8D8] px-4 py-12 text-center text-[#7F7F7F] text-sm shadow-sm">
              No models match your search.
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {/* Sort row */}
              <div className="flex items-center gap-2 px-1">
                <span className="text-xs text-[#7F7F7F] font-medium">Sort:</span>
                {([
                  { label: 'Date', field: 'releaseDate' as SortField },
                  { label: 'Provider', field: 'provider' as SortField },
                  { label: 'Model', field: 'model' as SortField },
                ] as const).map(col => (
                  <button
                    key={col.field}
                    onClick={() => handleSort(col.field)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      sortField === col.field
                        ? 'bg-[#F7594E] text-white'
                        : 'bg-white text-[#595959] border border-[#DFD8D8]'
                    }`}
                  >
                    {col.label}
                    {sortField === col.field && (
                      <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                ))}
              </div>

              {filtered.map(model => (
                <div key={model.id} className="bg-white rounded-xl border border-[#DFD8D8] p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <ProviderBadge provider={model.provider} />
                    <span className="text-xs text-[#7F7F7F] font-medium tabular-nums shrink-0 pt-0.5">
                      {formatDate(model.releaseDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-sm font-semibold text-[#000000]">{model.model}</span>
                    {model.freeDefault && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Free default
                      </span>
                    )}
                    {model.link && (
                      <a
                        href={model.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#F7594E]"
                        title="View announcement"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-[#595959] leading-relaxed">{model.notes}</p>
                </div>
              ))}

              <div className="px-1 py-2 text-center">
                <span className="text-xs text-[#7F7F7F]">
                  Sources: official provider blogs &amp; changelogs
                </span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
