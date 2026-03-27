"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Hash, User, Users, FileText } from "lucide-react";
import { saveCandidate, getNextNumber } from "@/lib/store";

export default function NewCandidate() {
  const router = useRouter();
  const [number, setNumber] = useState(1);
  const [name, setName] = useState("");
  const [groupNumber, setGroupNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setNumber(getNextNumber());
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Моля, въведете пълното ime на кандидата.");
    setError("");

    const id = crypto.randomUUID();
    saveCandidate({
      id,
      number,
      name: name.trim(),
      position: "",
      groupNumber: groupNumber.trim() || undefined,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    });
    router.push(`/candidates/${id}/evaluate`);
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Нов кандидат</h1>
        <p className="text-sm text-gray-500 mt-1">Регистрирайте кандидата, преди да продължите към оценката.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Информация за кандидата</h2>
        <p className="text-sm text-gray-500 mb-6">Попълнете данните на кандидата, преди да започнете оценката.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Number */}
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
            <p className="text-xs text-blue-400 font-medium mb-0.5 flex items-center gap-1">
              <Hash size={11} /> Номер на кандидата
            </p>
            <p className="text-2xl font-bold text-blue-700">#{String(number).padStart(3, "0")}</p>
          </div>

          {/* Name */}
          <div>
            <label className="flex text-sm font-medium text-gray-700 mb-1.5 items-center gap-1.5">
              <User size={14} className="text-gray-400" /> Пълно име
            </label>
            <input
              type="text"
              placeholder="напр. Иван Иванов"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Group Number */}
          <div>
            <label className="flex text-sm font-medium text-gray-700 mb-1.5 items-center gap-1.5">
              <Users size={14} className="text-gray-400" /> Номер на група{" "}
              <span className="text-gray-400 font-normal">(по избор)</span>
            </label>
            <input
              type="text"
              placeholder="напр. Група 3"
              value={groupNumber}
              onChange={(e) => setGroupNumber(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="flex text-sm font-medium text-gray-700 mb-1.5 items-center gap-1.5">
              <FileText size={14} className="text-gray-400" /> Бележки / Допълнителна информация{" "}
              <span className="text-gray-400 font-normal">(по избор)</span>
            </label>
            <textarea
              placeholder="Релевантен опит, препоръки, начални впечатления..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg text-sm transition-colors"
          >
            Стартирай оценката →
          </button>
        </form>
      </div>
    </div>
  );
}
