import CmsManager from "../components/CmsManager";

export default function AdminCompanyPage() {
  return (
    <CmsManager
      resources={[
        "site_pages",
        "timeline_entries",
        "process_steps",
        "sustainability_metrics",
        "careers_jobs",
        "press_entries",
      ]}
    />
  );
}
