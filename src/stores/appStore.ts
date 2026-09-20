import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { z } from 'zod';
import {
  commitmentsFromInput,
  emptyPersistedState,
  seedPersistedState,
} from '@/lib/data-repo';
import type { PersistedStateV1, Scenario, StudentProfile, WeeklyCommitment } from '@/domain/types';

export const STORAGE_KEY = 'lintas.app-state.v1';

const weeklyCommitmentSchema = z.object({
  id: z.string(),
  label: z.string(),
  hoursPerWeek: z.number(),
});

const profileSchema = z.object({
  id: z.string(),
  name: z.string(),
  isDemoPersona: z.boolean(),
  currentSemester: z.number(),
  performanceIndex: z.number(),
  completedCourseIds: z.array(z.string()),
  completedCredits: z.number(),
  allCompletedGradesAboveC: z.boolean(),
  weeklyCommitments: z.array(weeklyCommitmentSchema),
  exploredSpecializationIds: z.array(z.string()),
  lockedSpecializationId: z.string().nullable(),
  exploredCareerRoleIds: z.array(z.string()),
  targetInternshipTitles: z.array(z.string()),
});

const scenarioSchema = z.object({
  id: z.string(),
  name: z.string(),
  targetSemester: z.number(),
  selectedCourseIds: z.array(z.string()),
  commitments: z.array(weeklyCommitmentSchema),
  specializationId: z.string().nullable(),
  targetCareerRoleId: z.string().nullable(),
  targetInternshipRole: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const persistedSchema = z.object({
  version: z.literal(1),
  profile: profileSchema.nullable(),
  scenarios: z.array(scenarioSchema),
  primaryScenarioId: z.string().nullable(),
  onboardingCompleted: z.boolean(),
  advisorQuestions: z.array(z.string()),
  updatedAt: z.string(),
});

function parsePersisted(raw: unknown): PersistedStateV1 | null {
  const parsed = persistedSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export interface ScenarioDraft {
  name?: string;
  targetSemester?: number;
  selectedCourseIds?: string[];
  commitments?: WeeklyCommitment[];
  specializationId?: string | null;
  targetCareerRoleId?: string | null;
  targetInternshipRole?: string | null;
}

interface AppStore {
  persisted: PersistedStateV1;
  storageNotice: boolean;
  hasHydrated: boolean;
  loadDemoProfile: () => void;
  completeOnboarding: (profile: StudentProfile) => void;
  updateProfile: (patch: Partial<StudentProfile>) => void;
  lockSpecialization: (trackId: string) => void;
  unlockSpecialization: () => void;
  toggleExploredCareerRole: (roleId: string) => void;
  toggleExploredSpecialization: (specId: string) => void;
  saveScenario: (scenario: Scenario) => void;
  createDraftScenario: (draft: ScenarioDraft) => string;
  deleteScenario: (id: string) => void;
  duplicateScenario: (id: string) => string;
  setPrimaryScenario: (id: string | null) => void;
  setAdvisorQuestions: (questions: string[]) => void;
  resetApp: () => void;
  dismissStorageNotice: () => void;
}

function touch(state: PersistedStateV1): PersistedStateV1 {
  return { ...state, updatedAt: new Date().toISOString() };
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      persisted: emptyPersistedState(),
      storageNotice: false,
      hasHydrated: false,

      loadDemoProfile: () => {
        set({
          persisted: seedPersistedState(),
          storageNotice: false,
        });
      },

      completeOnboarding: (profile) => {
        set((state) => ({
          persisted: touch({
            ...state.persisted,
            profile,
            onboardingCompleted: true,
          }),
        }));
      },

      updateProfile: (patch) => {
        set((state) => {
          if (!state.persisted.profile) return state;
          return {
            persisted: touch({
              ...state.persisted,
              profile: { ...state.persisted.profile, ...patch },
            }),
          };
        });
      },

      lockSpecialization: (trackId) => {
        set((state) => {
          if (!state.persisted.profile) return state;
          return {
            persisted: touch({
              ...state.persisted,
              profile: { ...state.persisted.profile, lockedSpecializationId: trackId },
            }),
          };
        });
      },

      unlockSpecialization: () => {
        set((state) => {
          if (!state.persisted.profile) return state;
          return {
            persisted: touch({
              ...state.persisted,
              profile: { ...state.persisted.profile, lockedSpecializationId: null },
            }),
          };
        });
      },

      toggleExploredCareerRole: (roleId) => {
        set((state) => {
          if (!state.persisted.profile) return state;
          const explored = state.persisted.profile.exploredCareerRoleIds;
          const next = explored.includes(roleId)
            ? explored.filter((r) => r !== roleId)
            : [...explored, roleId];
          return {
            persisted: touch({
              ...state.persisted,
              profile: { ...state.persisted.profile, exploredCareerRoleIds: next },
            }),
          };
        });
      },

      toggleExploredSpecialization: (specId) => {
        set((state) => {
          if (!state.persisted.profile) return state;
          const explored = state.persisted.profile.exploredSpecializationIds;
          const next = explored.includes(specId)
            ? explored.filter((s) => s !== specId)
            : [...explored, specId];
          return {
            persisted: touch({
              ...state.persisted,
              profile: { ...state.persisted.profile, exploredSpecializationIds: next },
            }),
          };
        });
      },

      saveScenario: (scenario) => {
        set((state) => {
          const exists = state.persisted.scenarios.some((s) => s.id === scenario.id);
          const scenarios = exists
            ? state.persisted.scenarios.map((s) => (s.id === scenario.id ? scenario : s))
            : [...state.persisted.scenarios, scenario];
          return {
            persisted: touch({
              ...state.persisted,
              scenarios,
              primaryScenarioId: state.persisted.primaryScenarioId ?? scenario.id,
            }),
          };
        });
      },

      createDraftScenario: (draft) => {
        const now = new Date().toISOString();
        const id = `scenario-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
        const scenario: Scenario = {
          id,
          name: draft.name ?? 'Skenario baru',
          targetSemester: draft.targetSemester ?? get().persisted.profile?.currentSemester ?? 1,
          selectedCourseIds: draft.selectedCourseIds ?? [],
          commitments: commitmentsFromInput(draft.commitments ?? []),
          specializationId: draft.specializationId ?? null,
          targetCareerRoleId: draft.targetCareerRoleId ?? null,
          targetInternshipRole: draft.targetInternshipRole ?? null,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          persisted: touch({
            ...state.persisted,
            scenarios: [...state.persisted.scenarios, scenario],
          }),
        }));
        return id;
      },

      deleteScenario: (id) => {
        set((state) => {
          const scenarios = state.persisted.scenarios.filter((s) => s.id !== id);
          return {
            persisted: touch({
              ...state.persisted,
              scenarios,
              primaryScenarioId:
                state.persisted.primaryScenarioId === id ? null : state.persisted.primaryScenarioId,
            }),
          };
        });
      },

      duplicateScenario: (id) => {
        const source = get().persisted.scenarios.find((s) => s.id === id);
        if (!source) return '';
        const now = new Date().toISOString();
        const newId = `scenario-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
        const duplicate: Scenario = {
          ...source,
          id: newId,
          name: `${source.name} (salinan)`,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          persisted: touch({
            ...state.persisted,
            scenarios: [...state.persisted.scenarios, duplicate],
          }),
        }));
        return newId;
      },

      setPrimaryScenario: (id) => {
        set((state) => ({
          persisted: touch({
            ...state.persisted,
            primaryScenarioId: id,
          }),
        }));
      },

      setAdvisorQuestions: (questions) => {
        set((state) => ({
          persisted: touch({
            ...state.persisted,
            advisorQuestions: questions,
          }),
        }));
      },

      resetApp: () => {
        set({
          persisted: emptyPersistedState(),
          storageNotice: false,
        });
      },

      dismissStorageNotice: () => {
        set({ storageNotice: false });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({ persisted: state.persisted }),
      merge: (persistedRaw, current) => {
        const raw = (persistedRaw as { persisted?: unknown } | null)?.persisted ?? persistedRaw;
        const parsed = parsePersisted(raw);
        if (parsed) {
          return { ...current, persisted: parsed, hasHydrated: true, storageNotice: false };
        }
        const isFreshVisit = persistedRaw == null;
        return {
          ...current,
          persisted: emptyPersistedState(),
          hasHydrated: true,
          storageNotice: !isFreshVisit,
        };
      },
    },
  ),
);

export function selectProfile(state: AppStore): StudentProfile | null {
  return state.persisted.profile;
}

export function selectPrimaryScenario(state: AppStore): Scenario | null {
  const { scenarios, primaryScenarioId } = state.persisted;
  return scenarios.find((s) => s.id === primaryScenarioId) ?? null;
}

export function addCommitment(
  commitments: WeeklyCommitment[],
  values: { id: string; label: string; hoursPerWeek: number },
): WeeklyCommitment[] {
  const exists = commitments.some((c) => c.id === values.id);
  if (exists) {
    return commitments.map((c) =>
      c.id === values.id ? { ...c, ...values } : c,
    );
  }
  return [...commitments, values];
}

export function removeCommitment(commitments: WeeklyCommitment[], id: string): WeeklyCommitment[] {
  return commitments.filter((c) => c.id !== id);
}