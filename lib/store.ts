"use client";
import { Candidate } from "./types";

const STORAGE_KEY = "hris_candidates";

export function getCandidates(): Candidate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCandidate(candidate: Candidate): void {
  const candidates = getCandidates();
  const idx = candidates.findIndex((c) => c.id === candidate.id);
  if (idx >= 0) {
    candidates[idx] = candidate;
  } else {
    candidates.push(candidate);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
}

export function getCandidate(id: string): Candidate | undefined {
  return getCandidates().find((c) => c.id === id);
}

export function deleteCandidate(id: string): void {
  const candidates = getCandidates().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
}

export function getNextNumber(): number {
  const candidates = getCandidates();
  if (candidates.length === 0) return 1;
  return Math.max(...candidates.map((c) => c.number)) + 1;
}
