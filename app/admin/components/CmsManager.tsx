"use client";

import { useCallback, useEffect, useState } from "react";
import { CMS_RESOURCES, type CmsFieldConfig, type CmsResourceName } from "@/lib/cms";

type CmsValue = string | number | boolean | string[] | null | undefined;
type CmsRecord = Record<string, CmsValue> & { id?: string };

type CmsManagerProps = {
  resources: CmsResourceName[];
};

type ApiListResponse = {
  records?: CmsRecord[];
  error?: string;
};

type ApiRecordResponse = {
  record?: CmsRecord;
  error?: string;
};

function defaultValue(field: CmsFieldConfig): CmsValue {
  if (field.type === "boolean") return true;
  if (field.type === "number") return 0;
  if (field.type === "array") return [];
  if (field.type === "select") return field.options?.[0] ?? "";
  if (field.type === "date") return new Date().toISOString().slice(0, 10);
  return "";
}

function createEmptyRecord(resource: CmsResourceName): CmsRecord {
  const config = CMS_RESOURCES[resource];
  return Object.fromEntries(config.fields.map((field) => [field.name, defaultValue(field)]));
}

function displayValue(value: CmsValue): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === null || value === undefined) return "";
  return String(value);
}

function inputValue(value: CmsValue): string | number {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return "";
  if (value === null || value === undefined) return "";
  return value;
}

export default function CmsManager({ resources }: CmsManagerProps) {
  const [activeResource, setActiveResource] = useState<CmsResourceName>(resources[0]);
  const [records, setRecords] = useState<CmsRecord[]>([]);
  const [form, setForm] = useState<CmsRecord>(() => createEmptyRecord(resources[0]));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const config = CMS_RESOURCES[activeResource];

  const loadRecords = useCallback(async () => {
    setLoading(true);
    const response = await fetch(`/api/admin/cms/${activeResource}`);
    const result = (await response.json()) as ApiListResponse;
    if (!response.ok) {
      alert(result.error || "Failed to load records.");
    } else {
      setRecords(result.records ?? []);
    }
    setLoading(false);
  }, [activeResource]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadRecords();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadRecords]);

  const selectResource = (resource: CmsResourceName) => {
    setActiveResource(resource);
    setEditingId(null);
    setForm(createEmptyRecord(resource));
  };

  const updateField = (field: CmsFieldConfig, value: CmsValue) => {
    setForm((current) => ({ ...current, [field.name]: value }));
  };

  const editRecord = (record: CmsRecord) => {
    setEditingId(record.id ?? null);
    setForm({
      ...createEmptyRecord(activeResource),
      ...record,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(createEmptyRecord(activeResource));
  };

  const saveRecord = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    const response = await fetch(
      editingId ? `/api/admin/cms/${activeResource}/${editingId}` : `/api/admin/cms/${activeResource}`,
      {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );
    const result = (await response.json()) as ApiRecordResponse;

    if (!response.ok) {
      alert(result.error || "Failed to save record.");
    } else {
      resetForm();
      await loadRecords();
    }

    setSaving(false);
  };

  const deleteRecord = async (record: CmsRecord) => {
    if (!record.id) return;
    if (!window.confirm("Delete this record?")) return;

    const response = await fetch(`/api/admin/cms/${activeResource}/${record.id}`, {
      method: "DELETE",
    });
    const result = (await response.json()) as ApiRecordResponse;

    if (!response.ok) {
      alert(result.error || "Failed to delete record.");
    } else {
      await loadRecords();
      if (editingId === record.id) resetForm();
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-['Playfair_Display'] text-3xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>
          {config.title}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--coffee-text-secondary)" }}>
          {config.description}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {resources.map((resource) => {
          const item = CMS_RESOURCES[resource];
          const isActive = resource === activeResource;

          return (
            <button
              key={resource}
              onClick={() => selectResource(resource)}
              className="px-4 py-2 rounded-full text-xs font-semibold transition-colors"
              style={{
                backgroundColor: isActive ? "var(--coffee-accent)" : "rgba(61, 40, 32, 0.5)",
                border: "1px solid var(--coffee-border)",
                color: isActive ? "white" : "var(--coffee-text-secondary)",
              }}
            >
              {item.title}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-6">
        <section className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--coffee-border)", backgroundColor: "rgba(61,40,32,0.4)" }}>
                  {config.fields.slice(0, 4).map((field) => (
                    <th key={field.name} className="p-4 text-xs uppercase tracking-wider font-medium" style={{ color: "var(--coffee-text-secondary)" }}>
                      {field.label}
                    </th>
                  ))}
                  <th className="p-4 text-xs uppercase tracking-wider font-medium" style={{ color: "var(--coffee-text-secondary)" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={config.fields.slice(0, 4).length + 1} className="p-8 text-center" style={{ color: "var(--coffee-text-secondary)" }}>
                      Loading...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={config.fields.slice(0, 4).length + 1} className="p-8 text-center" style={{ color: "var(--coffee-text-secondary)" }}>
                      No records yet.
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record.id ?? JSON.stringify(record)} style={{ borderBottom: "1px solid rgba(90,64,52,0.2)" }}>
                      {config.fields.slice(0, 4).map((field) => (
                        <td key={field.name} className="p-4 text-sm max-w-72 truncate" style={{ color: "var(--coffee-text-primary)" }}>
                          {displayValue(record[field.name])}
                        </td>
                      ))}
                      <td className="p-4">
                        <div className="flex gap-3">
                          <button onClick={() => editRecord(record)} className="text-sm hover:text-[var(--coffee-accent)]" style={{ color: "var(--coffee-text-secondary)" }}>
                            Edit
                          </button>
                          <button onClick={() => deleteRecord(record)} className="text-sm hover:text-red-400" style={{ color: "var(--coffee-text-secondary)" }}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <form onSubmit={saveRecord} className="glass-card rounded-2xl p-5 space-y-4 h-fit">
          <div className="flex items-center justify-between">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>
              {editingId ? "Edit Record" : "New Record"}
            </h2>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-xs" style={{ color: "var(--coffee-text-secondary)" }}>
                Cancel
              </button>
            )}
          </div>

          {config.fields.map((field) => (
            <label key={field.name} className="block">
              <span className="block text-xs uppercase tracking-wider font-medium mb-1.5" style={{ color: "var(--coffee-text-secondary)" }}>
                {field.label}
              </span>
              {field.type === "boolean" ? (
                <input
                  type="checkbox"
                  checked={Boolean(form[field.name])}
                  onChange={(event) => updateField(field, event.target.checked)}
                  className="w-4 h-4"
                  style={{ accentColor: "var(--coffee-accent)" }}
                />
              ) : field.type === "textarea" || field.type === "html" ? (
                <textarea
                  rows={field.type === "html" ? 8 : 4}
                  value={String(inputValue(form[field.name]))}
                  onChange={(event) => updateField(field, event.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ backgroundColor: "rgba(61, 40, 32, 0.5)", border: "1px solid var(--coffee-border)", color: "var(--coffee-text-primary)" }}
                />
              ) : field.type === "select" ? (
                <select
                  value={String(inputValue(form[field.name]))}
                  onChange={(event) => updateField(field, event.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ backgroundColor: "rgba(61, 40, 32, 0.5)", border: "1px solid var(--coffee-border)", color: "var(--coffee-text-primary)" }}
                >
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                  value={inputValue(form[field.name])}
                  onChange={(event) => updateField(field, field.type === "number" ? Number(event.target.value) : event.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ backgroundColor: "rgba(61, 40, 32, 0.5)", border: "1px solid var(--coffee-border)", color: "var(--coffee-text-primary)" }}
                />
              )}
            </label>
          ))}

          <button type="submit" disabled={saving} className="btn-accent px-5 py-3 rounded-xl text-sm font-semibold w-full disabled:opacity-50">
            {saving ? "Saving..." : "Save Record"}
          </button>
        </form>
      </div>
    </div>
  );
}
