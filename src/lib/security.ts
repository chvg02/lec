const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RATE_LIMIT_BUCKETS = new Map<
  string,
  { count: number; resetAt: number }
>();

const DANGEROUS_HTML_TAGS =
  /<\/?(script|iframe|object|embed|link|meta|style|base|form|input|button|textarea|select)[^>]*>/gi;
const EVENT_HANDLER_ATTRIBUTES =
  /\s+on[a-z]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi;
const JAVASCRIPT_PROTOCOL_ATTRIBUTES =
  /\s+(href|src)\s*=\s*("|\')?\s*(javascript:|data:text\/html|vbscript:)[^"'\s>]*\2?/gi;

export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

export const PUBLIC_FILE_SELECT = {
  id: true,
  name: true,
  email: true,
} as const;

const ALLOWED_UPLOAD_EXTENSIONS = new Set([
  ".pdf",
  ".zip",
  ".csv",
  ".txt",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".mp4",
  ".webm",
]);

const ALLOWED_UPLOAD_MIME_TYPES = new Set([
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
]);

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

export function isValidEmail(email: string) {
  return EMAIL_REGEX.test(email);
}

export function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

export function normalizeText(value: unknown, maxLength: number) {
  return String(value ?? "").trim().slice(0, maxLength);
}

export function parseNumericId(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function isAllowedUpload(file: File) {
  const normalizedName = file.name.trim().toLowerCase();
  const lastDotIndex = normalizedName.lastIndexOf(".");
  const extension = lastDotIndex >= 0 ? normalizedName.slice(lastDotIndex) : "";

  if (!ALLOWED_UPLOAD_EXTENSIONS.has(extension)) {
    return false;
  }

  return ALLOWED_UPLOAD_MIME_TYPES.has(file.type);
}

export function isAllowedImageUpload(file: File) {
  const normalizedName = file.name.trim().toLowerCase();
  const lastDotIndex = normalizedName.lastIndexOf(".");
  const extension = lastDotIndex >= 0 ? normalizedName.slice(lastDotIndex) : "";

  return (
    [".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(extension) &&
    ALLOWED_IMAGE_MIME_TYPES.has(file.type)
  );
}

export function sanitizeFileName(fileName: string) {
  return fileName
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 120);
}

export function isSafeInternalUploadUrl(value: unknown) {
  const url = String(value ?? "").trim();
  return /^\/uploads\/[A-Za-z0-9._/-]+$/.test(url);
}

export function normalizeUploadUrl(value: unknown) {
  const url = String(value ?? "").trim();
  return isSafeInternalUploadUrl(url) ? url : null;
}

export function normalizeUploadList(images: unknown) {
  if (!Array.isArray(images)) {
    return [];
  }

  const uniqueUrls = new Set<string>();

  for (const image of images) {
    const rawValue =
      image && typeof image === "object"
        ? "image_url" in image
          ? image.image_url
          : "preview" in image
            ? image.preview
            : ""
        : "";

    const normalizedUrl = normalizeUploadUrl(rawValue);

    if (normalizedUrl) {
      uniqueUrls.add(normalizedUrl);
    }
  }

  return Array.from(uniqueUrls).map((image_url) => ({ image_url }));
}

export function sanitizeRichTextHtml(html: unknown) {
  const rawHtml = String(html ?? "").trim();

  return rawHtml
    .replace(DANGEROUS_HTML_TAGS, "")
    .replace(EVENT_HANDLER_ATTRIBUTES, "")
    .replace(JAVASCRIPT_PROTOCOL_ATTRIBUTES, "")
    .replace(/<img\b([^>]*?)\bsrc\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))([^>]*)>/gi, (_, before, quoted, dq, sq, bare, after) => {
      const src = dq ?? sq ?? bare ?? "";
      return isSafeInternalUploadUrl(src) ? `<img${before} src="${src}"${after}>` : "";
    });
}

export function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number
) {
  const now = Date.now();
  const bucket = RATE_LIMIT_BUCKETS.get(key);

  if (!bucket || bucket.resetAt <= now) {
    RATE_LIMIT_BUCKETS.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, retryAfterSeconds: Math.ceil(windowMs / 1000) };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return {
    allowed: true,
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}
