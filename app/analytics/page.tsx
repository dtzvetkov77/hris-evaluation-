"use client";
import { useEffect, useState } from "react";
import { getCandidates } from "@/lib/store";
import { Candidate, getRating, getRatingColor, getScoreColor } from "@/lib/types";
import { EVALUATION_CATEGORIES } from "@/lib/questions";
import ScoreCircle from "@/components/ScoreCircle";

export default function AnalyticsPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    setCandidates(getCandidates().filter((c) => c.totalScore != null));
  }, []);

  if (candidates.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Общо табло</h1>
        <p className="text-sm text-gray-500 mb-8">Статистика за всички оценени кандидати</p>
        <div className="text-center py-24 text-gray-400">
          <p className="text-lg font-medium">Няма оценени кандидати</p>
          <p className="text-sm mt-1">Оценете поне един кандидат, за да видите статистиката.</p>
        </div>
      </div>
    );
  }

  const scores = candidates.map((c) => c.totalScore!);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  const best = candidates.find((c) => c.totalScore === maxScore)!;
  const worst = candidates.find((c) => c.totalScore === minScore)!;

  // Rating distribution
  const ratingCounts = { Отличен: 0, Добър: 0, Задоволителен: 0, Слаб: 0 };
  candidates.forEach((c) => {
    const r = getRating(c.totalScore!);
    ratingCounts[r]++;
  });

  // Average score per category
  const categoryAvgs = EVALUATION_CATEGORIES.map((cat) => {
    const catScores = candidates
      .map((c) => c.scores?.find((s) => s.categoryId === cat.id)?.score)
      .filter((s): s is number => s != null);
    const avg = catScores.length > 0 ? catScores.reduce((a, b) => a + b, 0) / catScores.length : 0;
    return { name: cat.name, avg, weight: cat.weight };
  });

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Общо табло</h1>
      <p className="text-sm text-gray-500 mb-6">Статистика за {candidates.length} оценени кандидата</p>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Среден резултат" value={`${avgScore.toFixed(1)}%`} color={getScoreColor(avgScore)} />
        <StatCard label="Кандидати" value={String(candidates.length)} color="#6366f1" />
        <StatCard label="Най-висок" value={`${maxScore.toFixed(1)}%`} color="#16a34a" sub={best.name} />
        <StatCard label="Най-нисък" value={`${minScore.toFixed(1)}%`} color="#ef4444" sub={worst.name} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
        {/* Rating distribution */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-5">Разпределение по рейтинг</h2>
          <div className="space-y-3">
            {(["Отличен", "Добър", "Задоволителен", "Слаб"] as const).map((r) => {
              const count = ratingCounts[r];
              const pct = candidates.length > 0 ? (count / candidates.length) * 100 : 0;
              const colors: Record<string, string> = {
                Отличен: "#16a34a", Добър: "#2563eb", Задоволителен: "#f97316", Слаб: "#ef4444",
              };
              return (
                <div key={r}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">{r}</span>
                    <span className="text-xs font-bold text-gray-500">{count} ({Math.round(pct)}%)</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: colors[r] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Donut summary */}
          <div className="mt-6 pt-5 border-t border-gray-100 flex justify-center">
            <ScoreCircle score={avgScore} size={110} strokeWidth={9} fontSize={22} />
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">Среден резултат</p>
        </div>

        {/* Category averages */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-5">Среден резултат по категория</h2>
          <div className="space-y-3">
            {categoryAvgs.map((cat) => (
              <div key={cat.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 font-medium truncate pr-2">{cat.name}</span>
                  <span className="text-xs font-bold shrink-0" style={{ color: getScoreColor(cat.avg) }}>
                    {Math.round(cat.avg)}%
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${cat.avg}%`, backgroundColor: getScoreColor(cat.avg) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Candidates comparison table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Сравнение на кандидатите</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {[...candidates]
            .sort((a, b) => b.totalScore! - a.totalScore!)
            .map((c, i) => {
              const rating = getRating(c.totalScore!);
              return (
                <div key={c.id} className="flex items-center gap-3 px-4 md:px-6 py-3.5">
                  <span className="text-xs text-gray-400 w-5 text-center font-mono">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                    {c.groupNumber && (
                      <p className="text-xs text-gray-400">{c.groupNumber}</p>
                    )}
                  </div>
                  <span className={`hidden sm:inline text-xs font-semibold px-2 py-0.5 rounded-full border ${getRatingColor(rating)}`}>
                    {rating}
                  </span>
                  <div className="w-24 md:w-36 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${c.totalScore}%`, backgroundColor: getScoreColor(c.totalScore!) }}
                    />
                  </div>
                  <span className="text-sm font-bold w-12 text-right" style={{ color: getScoreColor(c.totalScore!) }}>
                    {Math.round(c.totalScore!)}%
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Weakest categories across all */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Най-слаби категории (общо)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[...categoryAvgs]
            .sort((a, b) => a.avg - b.avg)
            .slice(0, 3)
            .map((cat) => (
              <div key={cat.name} className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">{cat.name}</p>
                <p className="text-2xl font-bold" style={{ color: getScoreColor(cat.avg) }}>
                  {Math.round(cat.avg)}%
                </p>
              </div>
            ))}
        </div>
      </div>
      <div className="h-12" />
    </div>
  );
}

function StatCard({ label, value, color, sub }: { label: string; value: string; color: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
    </div>
  );
}
