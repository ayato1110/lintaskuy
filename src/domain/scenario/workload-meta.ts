import type { WorkloadAssessment } from '@/domain/types';

type WorkloadCategory = WorkloadAssessment['category'];

export const workloadToneMap: Record<
  WorkloadCategory,
  { tone: 'success' | 'info' | 'warning' | 'danger'; label: string }
> = {
  Ringan: { tone: 'success', label: 'Beban Ringan' },
  Seimbang: { tone: 'info', label: 'Beban Seimbang' },
  Tinggi: { tone: 'warning', label: 'Beban Tinggi' },
  'Sangat Tinggi': { tone: 'danger', label: 'Beban Sangat Tinggi' },
};