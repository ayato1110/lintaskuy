import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader, Breadcrumb } from '@/components/ui/page-header';
import { InlineAlert } from '@/components/ui/alert';
import { CareerRoleCard } from '@/components/career/career-role-card';
import { careerRoles } from '@/lib/data-repo';

export function CareerPage() {
  return (
    <div className="mx-auto w-full max-w-content px-4 py-8 md:px-8">
      <Breadcrumb
        crumbs={[
          { label: 'Peminatan', path: '/app/specializations' },
          { label: 'Kompas Karier' },
        ]}
      />
      <PageHeader
        title="Kompas Karier"
        description="Peta peran karier yang dihubungkan ke kompetensi, mata kuliah, peminatan, dan posisi Magang. Informasi disajikan secara transparan tanpa skor kecocokan."
        actions={
          <Link
            to="/app/specializations"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary underline hover:text-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Kembali ke peminatan
          </Link>
        }
      />

      <InlineAlert
        tone="info"
        title="Sumber informasi karier"
        reason="Setiap peran dihubungkan ke kompetensi, mata kuliah, peminatan, dan posisi Magang. Informasi tidak menggunakan skor kecocokan."
      />

      <div className="mt-4 grid auto-rows-fr grid-cols-1 gap-6 lg:grid-cols-2">
        {careerRoles.map((role) => (
          <CareerRoleCard key={role.id} roleId={role.id} />
        ))}
      </div>
    </div>
  );
}