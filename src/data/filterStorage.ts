import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedFilter, ShowFilter } from '@/src/types';

const STORAGE_KEY = '@mixr/saved-filters';
const MAX_FILTERS = 20;
const MAX_NAME_LENGTH = 50;

// --- Default presets ---

const DEFAULT_PRESETS: SavedFilter[] = [
  {
    id: 'default-this-weekend',
    name: 'This Weekend',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    filter: { dateRange: 'this_weekend' },
    isDefault: true,
  },
  {
    id: 'default-nearby-tonight',
    name: 'Nearby Tonight',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    filter: { dateRange: 'today' },
    isDefault: true,
  },
  {
    id: 'default-free-shows',
    name: 'Free Shows',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    filter: { priceMax: 0 },
    isDefault: true,
  },
];

// --- Helpers ---

function generateId(): string {
  return `filter-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

async function readFilters(): Promise<SavedFilter[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    // Seed defaults on first load
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRESETS));
    return [...DEFAULT_PRESETS];
  }
  return JSON.parse(raw) as SavedFilter[];
}

async function writeFilters(filters: SavedFilter[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
}

// --- Public API ---

/**
 * Read all saved presets from AsyncStorage. Returns default presets if none exist.
 */
export async function getSavedFilters(): Promise<SavedFilter[]> {
  return readFilters();
}

/**
 * Create a new preset. Generates UUID and timestamps.
 * Throws if max 20 presets reached or name exceeds 50 characters.
 */
export async function saveFilter(name: string, filter: ShowFilter): Promise<SavedFilter> {
  if (name.length > MAX_NAME_LENGTH) {
    throw new Error(`Filter name must be ${MAX_NAME_LENGTH} characters or fewer.`);
  }

  const filters = await readFilters();

  if (filters.length >= MAX_FILTERS) {
    throw new Error(`Maximum of ${MAX_FILTERS} saved filters reached. Delete a filter to save a new one.`);
  }

  const now = new Date().toISOString();
  const newFilter: SavedFilter = {
    id: generateId(),
    name,
    createdAt: now,
    updatedAt: now,
    filter,
  };

  filters.push(newFilter);
  await writeFilters(filters);
  return newFilter;
}

/**
 * Update name or filter criteria of an existing preset. Updates `updatedAt`.
 * Throws if filter not found or if trying to update a default preset's name with invalid length.
 */
export async function updateFilter(
  id: string,
  updates: Partial<Pick<SavedFilter, 'name' | 'filter'>>
): Promise<SavedFilter> {
  const filters = await readFilters();
  const index = filters.findIndex((f) => f.id === id);

  if (index === -1) {
    throw new Error(`Filter with id "${id}" not found.`);
  }

  if (updates.name !== undefined && updates.name.length > MAX_NAME_LENGTH) {
    throw new Error(`Filter name must be ${MAX_NAME_LENGTH} characters or fewer.`);
  }

  const existing = filters[index];
  const updated: SavedFilter = {
    ...existing,
    ...(updates.name !== undefined ? { name: updates.name } : {}),
    ...(updates.filter !== undefined ? { filter: updates.filter } : {}),
    updatedAt: new Date().toISOString(),
  };

  filters[index] = updated;
  await writeFilters(filters);
  return updated;
}

/**
 * Remove a preset by ID. Default presets cannot be deleted.
 */
export async function deleteFilter(id: string): Promise<void> {
  const filters = await readFilters();
  const target = filters.find((f) => f.id === id);

  if (!target) {
    throw new Error(`Filter with id "${id}" not found.`);
  }

  if (target.isDefault) {
    throw new Error('Default presets cannot be deleted.');
  }

  const remaining = filters.filter((f) => f.id !== id);
  await writeFilters(remaining);
}
