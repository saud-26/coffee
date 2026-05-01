import { CMS_RESOURCES, sanitizeHtml, type CmsFieldConfig, type CmsResourceName } from "@/lib/cms";

type CmsPayload = Record<string, string | number | boolean | string[] | null>;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function stringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export function validateCmsPayload(
  resource: CmsResourceName,
  value: unknown,
  partial = false
): { ok: true; payload: CmsPayload } | { ok: false; error: string } {
  const body = asRecord(value);
  if (!body) return { ok: false, error: "Request body must be an object." };

  const config = CMS_RESOURCES[resource];
  const payload: CmsPayload = {};

  for (const fieldDefinition of config.fields) {
    const field: CmsFieldConfig = fieldDefinition;
    const raw = body[field.name];
    const hasValue = Object.prototype.hasOwnProperty.call(body, field.name);

    if (!partial && field.required && (!hasValue || raw === "" || raw === null || raw === undefined)) {
      return { ok: false, error: `${field.label} is required.` };
    }

    if (!hasValue) continue;

    if (raw === null) {
      payload[field.name] = null;
      continue;
    }

    switch (field.type) {
      case "number": {
        const parsed = typeof raw === "number" ? raw : Number(raw);
        if (!Number.isFinite(parsed)) {
          return { ok: false, error: `${field.label} must be numeric.` };
        }
        payload[field.name] = Number(parsed.toFixed(2));
        break;
      }
      case "boolean":
        payload[field.name] = Boolean(raw);
        break;
      case "array":
        payload[field.name] = stringArray(raw);
        break;
      case "html":
        payload[field.name] = typeof raw === "string" ? sanitizeHtml(raw) : "";
        break;
      case "select": {
        const valueText = typeof raw === "string" ? raw : String(raw);
        if (field.options && !field.options.includes(valueText)) {
          return { ok: false, error: `Invalid ${field.label}.` };
        }
        payload[field.name] = valueText;
        break;
      }
      case "date":
      case "textarea":
      case "text":
      default:
        payload[field.name] = typeof raw === "string" ? raw.trim() : String(raw);
        break;
    }
  }

  return { ok: true, payload };
}
