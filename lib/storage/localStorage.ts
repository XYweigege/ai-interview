// localStorage 工具类，用于收藏和历史记录

const FAVORITES_KEY = "ai_interview_favorites";
const HISTORY_KEY = "ai_interview_history";

export interface FavoriteQuestion {
  id: string;
  question: string;
  category: string;
  savedAt: string;
}

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: string;
}

// 收藏功能
export function getFavorites(): FavoriteQuestion[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(FAVORITES_KEY);
  return data ? JSON.parse(data) : [];
}

export function addFavorite(question: {
  id: string;
  question: string;
  category: string;
}): void {
  if (typeof window === "undefined") return;
  const favorites = getFavorites();

  // 避免重复收藏
  if (favorites.some((f) => f.id === question.id)) {
    return;
  }

  favorites.unshift({
    ...question,
    savedAt: new Date().toISOString(),
  });

  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function removeFavorite(id: string): void {
  if (typeof window === "undefined") return;
  const favorites = getFavorites();
  const filtered = favorites.filter((f) => f.id !== id);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
}

export function isFavorite(id: string): boolean {
  const favorites = getFavorites();
  return favorites.some((f) => f.id === id);
}

// 搜索历史功能
export function getSearchHistory(): SearchHistory[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(HISTORY_KEY);
  return data ? JSON.parse(data) : [];
}

export function addSearchHistory(query: string): void {
  if (typeof window === "undefined") return;
  if (!query.trim()) return;

  const history = getSearchHistory();

  // 移除重复项
  const filtered = history.filter((h) => h.query !== query);

  // 添加到开头
  filtered.unshift({
    id: Date.now().toString(),
    query,
    timestamp: new Date().toISOString(),
  });

  // 最多保存 20 条
  const limited = filtered.slice(0, 20);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(limited));
}

export function clearSearchHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
}

export function removeSearchHistoryItem(id: string): void {
  if (typeof window === "undefined") return;
  const history = getSearchHistory();
  const filtered = history.filter((h) => h.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
}
