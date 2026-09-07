import { AdminShell } from "@/components/admin/AdminShell";
import { BannersEditor } from "@/components/admin/BannersEditor";
import { loadBanners } from "@/lib/banners-data";

export const dynamic = "force-dynamic";

export default async function AdminBanners() {
  const banners = await loadBanners();
  return (
    <AdminShell active="Banners">
      <div className="adtop"><h1>Banner images</h1></div>
      <BannersEditor banners={banners} />
    </AdminShell>
  );
}
