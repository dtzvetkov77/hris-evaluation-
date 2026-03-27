"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getCandidate, saveCandidate } from "@/lib/store";
import { Candidate, CategoryScore, getRating } from "@/lib/types";
import { EVALUATION_CATEGORIES } from "@/lib/questions";

type Answers = Record<string, number>; // questionId -> score (0-100)

function calcCategoryScore(catId: string, answers: Answers): number {
  const cat = EVALUATION_CATEGORIES.find((c) => c.id === catId);
  if (!cat) return 0;
  let weighted = 0;
  let totalQ = 0;
  for (const q of cat.questions) {
    if (answers[q.id] != null) {
      weighted += answers[q.id] * q.weight;
      totalQ += q.weight;
    }
  }
  if (totalQ === 0) return 0;
  return weighted / totalQ;
}

function calcTotal(answers: Answers): number {
  let total = 0;
  for (const cat of EVALUATION_CATEGORIES) {
    const catScore = calcCategoryScore(cat.id, answers);
    total += catScore * (cat.weight / 100);
  }
  return total;
}

export default function EvaluatePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const c = getCandidate(id);
    if (!c) { router.push("/"); return; }
    setCandidate(c);
  }, [id, router]);

  if (!candidate) return null;

  const allAnswered = EVALUATION_CATEGORIES.every((cat) =>
    cat.questions.every((q) => answers[q.id] != null)
  );

  const currentTotal = calcTotal(answers);
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = EVALUATION_CATEGORIES.reduce((s, c) => s + c.questions.length, 0);

  function handleSubmit() {
    if (!allAnswered) {
      setError("Моля, отговорете на всички въпроси преди да изчислите резултата.");
      return;
    }
    if (!candidate) return;
    setError("");
    setSubmitting(true);

    const scores: CategoryScore[] = EVALUATION_CATEGORIES.map((cat) => ({
      categoryId: cat.id,
      categoryName: cat.name,
      score: calcCategoryScore(cat.id, answers),
      weight: cat.weight,
    }));

    const totalScore = calcTotal(answers);

    saveCandidate({
      id: candidate.id,
      number: candidate.number,
      name: candidate.name,
      position: candidate.position,
      groupNumber: candidate.groupNumber,
      notes: candidate.notes,
      createdAt: candidate.createdAt,
      scores,
      totalScore,
      rating: getRating(totalScore),
      evaluatedAt: new Date().toISOString(),
    });

    router.push(`/candidates/${id}/results`);
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-gray-500 mb-1">
          #{String(candidate.number).padStart(3, "0")} · {candidate.position}
        </p>
        <h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Отговорете на всеки въпрос и натиснете &ldquo;Изчисли резултата&rdquo; когато приключите.
        </p>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Прогрес</span>
            <span className="text-xs font-medium text-gray-700">{answeredCount}/{totalQuestions} въпроса</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
        {answeredCount > 0 && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Текущ резултат</p>
            <p className="text-lg font-bold text-blue-600">{Math.round(currentTotal)}%</p>
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {EVALUATION_CATEGORIES.map((cat) => (
          <div key={cat.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{cat.name}</h2>
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{cat.weight}% от общото</span>
            </div>
            <div className="divide-y divide-gray-50">
              {cat.questions.map((q) => (
                <div key={q.id} className="px-6 py-5">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-sm font-medium text-gray-800 flex-1 pr-4">{q.text}</p>
                    <span className="text-xs text-blue-500 font-medium flex-shrink-0">Тегло: {q.weight}%</span>
                  </div>
                  <div className="space-y-2">
                    {q.options.map((opt) => (
                      <label
                        key={opt.score}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          answers[q.id] === opt.score
                            ? "border-blue-400 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={opt.score}
                          checked={answers[q.id] === opt.score}
                          onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.score }))}
                          className="mt-0.5 accent-blue-600"
                        />
                        <span className="text-sm text-gray-700">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                  {/* Optional free-text note */}
                  <textarea
                    placeholder="Бележка към отговора (по избор)..."
                    value={notes[q.id] ?? ""}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    rows={2}
                    className="mt-3 w-full px-3 py-2 text-xs text-gray-600 rounded-lg border border-gray-100 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
      )}

      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl text-base transition-colors"
        >
          {submitting ? "Изчисляване..." : "Изчисли резултата →"}
        </button>
      </div>
      <div className="h-12" />
    </div>
  );
}
