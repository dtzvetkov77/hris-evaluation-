"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { getCandidate } from "@/lib/store";
import { Candidate, getRatingColor, getScoreColor } from "@/lib/types";
import ScoreCircle from "@/components/ScoreCircle";

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const c = getCandidate(id);
    if (!c || c.totalScore == null) { router.push("/"); return; }
    setCandidate(c);
  }, [id, router]);

  if (!candidate || candidate.totalScore == null) return null;

  const score = candidate.totalScore;
  const rating = candidate.rating!;
  const scores = candidate.scores ?? [];

  const maxScore = Math.max(...scores.map((s) => s.score));

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-sm text-gray-500 mb-1">
            #{String(candidate.number).padStart(3, "0")} · {candidate.position}
          </p>
          <h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 px-4 py-2.5 rounded-lg transition-colors"
        >
          <ArrowLeft size={14} /> Табло
        </Link>
      </div>

      {/* Main cards */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
        {/* Score circle */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center gap-4">
          <h2 className="text-sm font-medium text-gray-500 self-start">Обща съвместимост</h2>
          <ScoreCircle score={score} size={140} strokeWidth={10} fontSize={28} />
          <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${getRatingColor(rating)}`}>
            {rating}
          </span>
          {candidate.evaluatedAt && (
            <p className="text-xs text-gray-400">
              Оценен на{" "}
              {new Date(candidate.evaluatedAt).toLocaleDateString("bg-BG", {
                day: "numeric",
                month: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              г.
            </p>
          )}
        </div>

        {/* Bar chart */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-6">Разбивка по компетентности</h2>
          <div className="space-y-3">
            {scores.map((s) => (
              <div key={s.categoryId}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 font-medium">{s.categoryName}</span>
                  <span className="text-xs font-bold" style={{ color: getScoreColor(s.score) }}>
                    {Math.round(s.score)}%
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${s.score}%`,
                      backgroundColor: getScoreColor(s.score),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-gray-100">
            {[
              { label: "Отличен (≥80%)", color: "#16a34a" },
              { label: "Добър (60–79%)", color: "#2563eb" },
              { label: "Задоволителен (40–59%)", color: "#f97316" },
              { label: "Слаб (<40%)", color: "#ef4444" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
                <span className="text-xs text-gray-500">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Score table */}
      <div className="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-medium text-gray-700">Резултати по категории</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {scores.map((s) => {
            const color = getScoreColor(s.score);
            return (
              <div key={s.categoryId} className="flex items-center gap-4 px-6 py-3.5">
                <div className="w-36 flex-shrink-0">
                  <span className="text-sm font-medium text-gray-800">{s.categoryName}</span>
                </div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s.score}%`, backgroundColor: color }} />
                </div>
                <div className="w-12 text-right font-bold text-sm" style={{ color }}>
                  {Math.round(s.score)}%
                </div>
                <div className="w-16 text-right text-xs text-gray-400">тегло {s.weight}%</div>
                <div className="w-16 text-right text-xs text-gray-400">
                  +{((s.score * s.weight) / 100).toFixed(1)} т.
                </div>
              </div>
            );
          })}
          {/* Total */}
          <div className="flex items-center gap-4 px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="w-36 flex-shrink-0">
              <span className="text-sm font-bold text-gray-900">Общо</span>
            </div>
            <div className="flex-1" />
            <div className="w-12 text-right font-bold text-base" style={{ color: getScoreColor(score) }}>
              {Math.round(score)}%
            </div>
            <div className="w-16 text-right text-xs text-gray-400">100%</div>
            <div className="w-16 text-right text-xs font-semibold text-gray-600">
              {score.toFixed(1)} т.
            </div>
          </div>
        </div>
      </div>

      {/* Candidate notes */}
      {candidate.notes && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Бележки</h2>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{candidate.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href={`/candidates/${id}/evaluate`}
          className="flex items-center gap-2 text-sm border border-gray-200 hover:bg-gray-50 px-4 py-2.5 rounded-lg text-gray-700 transition-colors"
        >
          Редактирай оценката
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors"
        >
          Към таблото
        </Link>
      </div>
      <div className="h-12" />
    </div>
  );
}
