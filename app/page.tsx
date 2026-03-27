"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Calendar, Trash2, Search, ChevronDown } from "lucide-react";
import { getCandidates, deleteCandidate } from "@/lib/store";
import { Candidate, getRating, getRatingColor } from "@/lib/types";
import ScoreCircle from "@/components/ScoreCircle";

export default function Dashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("Всички позиции");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    setCandidates(getCandidates());
  }, []);

  const filtered = candidates
    .filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
      const matchPos = position === "Всички позиции" || c.position === position;
      return matchSearch && matchPos;
    })
    .sort((a, b) => {
      if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === "score_desc") return (b.totalScore ?? 0) - (a.totalScore ?? 0);
      if (sort === "score_asc") return (a.totalScore ?? 0) - (b.totalScore ?? 0);
      return 0;
    });

  const positions = ["Всички позиции", ...Array.from(new Set(candidates.map((c) => c.position)))];

  function handleDelete(id: string) {
    if (!confirm("Сигурни ли сте, че искате да изтриете този кандидат?")) return;
    deleteCandidate(id);
    setCandidates(getCandidates());
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Кандидати</h1>
          <p className="text-sm text-gray-500 mt-0.5">{candidates.length} кандидата общо</p>
        </div>
        <Link
          href="/candidates/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Нов кандидат
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Търси по име..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {positions.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Най-нови първи</option>
            <option value="oldest">Най-стари първи</option>
            <option value="score_desc">Най-висок резултат</option>
            <option value="score_asc">Най-нисък резултат</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">Няма кандидати</p>
          <p className="text-sm mt-1">Добавете нов кандидат, за да започнете оценката.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <CandidateCard key={c.id} candidate={c} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function CandidateCard({ candidate: c, onDelete }: { candidate: Candidate; onDelete: (id: string) => void }) {
  const rating = c.totalScore != null ? getRating(c.totalScore) : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-400 font-mono">#{String(c.number).padStart(3, "0")}</span>
            {rating && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getRatingColor(rating)}`}>
                {rating}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 text-base leading-tight">{c.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{c.position}</p>
        </div>
        {c.totalScore != null && (
          <ScoreCircle score={c.totalScore} size={64} strokeWidth={5} fontSize={14} />
        )}
      </div>

      {/* Date */}
      {c.evaluatedAt && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar size={12} />
          Оценен на {new Date(c.evaluatedAt).toLocaleDateString("bg-BG", { day: "numeric", month: "numeric", year: "numeric" })} г.
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-auto">
        {c.totalScore != null ? (
          <Link
            href={`/candidates/${c.id}/results`}
            className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 hover:bg-gray-50 rounded-lg py-2 text-sm font-medium text-gray-700 transition-colors"
          >
            Виж резултатите →
          </Link>
        ) : (
          <Link
            href={`/candidates/${c.id}/evaluate`}
            className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-medium transition-colors"
          >
            Започни оценката →
          </Link>
        )}
        <button
          onClick={() => onDelete(c.id)}
          className="p-2 rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
