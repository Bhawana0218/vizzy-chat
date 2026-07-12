"use client";

export function ChatSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto px-4">
      <div className="max-w-3xl mx-auto py-6 space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
            {i % 2 !== 0 && (
              <div className="w-8 h-8 rounded-xl bg-white/[0.04] animate-pulse shrink-0" />
            )}
            <div className={`flex flex-col ${i % 2 === 0 ? "items-end" : "items-start"} max-w-[70%]`}>
              <div className={`rounded-2xl px-4 py-3 ${i % 2 === 0 ? "bg-violet-600/20" : "bg-white/[0.04]"} animate-pulse`}>
                <div className="h-3.5 rounded bg-white/[0.08]" style={{ width: `${60 + i * 10}%` }} />
                {i % 2 !== 0 && <div className="h-3.5 rounded bg-white/[0.06] mt-2" style={{ width: `${40 + i * 8}%` }} />}
              </div>
            </div>
            {i % 2 === 0 && (
              <div className="w-8 h-8 rounded-xl bg-white/[0.04] animate-pulse shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AssetSkeleton() {
  return (
    <div className="flex gap-3 mt-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex-shrink-0 w-[240px] md:w-[280px] rounded-2xl bg-white/[0.03] border border-white/[0.04] animate-pulse"
          style={{ aspectRatio: i === 2 ? "16/9" : "1/1" }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="space-y-1 px-3 py-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-xl animate-pulse">
          <div className="w-3.5 h-3.5 rounded bg-white/[0.04]" />
          <div className="h-3 rounded bg-white/[0.06] flex-1" style={{ width: `${50 + i * 8}%` }} />
          <div className="h-2.5 rounded bg-white/[0.03] w-8" />
        </div>
      ))}
    </div>
  );
}

export function WelcomeSkeleton() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-3xl mx-auto w-full animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.03] animate-pulse mb-6" />
      <div className="h-8 rounded-lg bg-white/[0.04] w-72 mb-3 animate-pulse" />
      <div className="h-4 rounded bg-white/[0.03] w-56 mb-12 animate-pulse" />
      <div className="w-full grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 rounded-xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />
        ))}
      </div>
    </div>
  );
}
