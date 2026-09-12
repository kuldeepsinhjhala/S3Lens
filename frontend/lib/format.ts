export function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** exponent;
  const formatted = exponent === 0 ? value.toString() : value.toFixed(value >= 10 ? 0 : 1);

  return `${formatted} ${units[exponent]}`;
}

export function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function fileTypeLabel(name: string, contentType: string | null): string {
  if (contentType?.startsWith("image/")) {
    return (contentType.split("/")[1] ?? "image").toUpperCase();
  }

  if (contentType === "application/pdf") {
    return "PDF";
  }

  if (contentType?.startsWith("video/")) {
    return "VIDEO";
  }

  const extension = name.split(".").pop();
  if (extension && extension !== name) {
    return extension.toUpperCase();
  }

  return "File";
}

export function previewKind(
  name: string,
  contentType: string | null,
): "image" | "pdf" | "video" | "other" {
  const type = (contentType ?? "").toLowerCase();
  const lowerName = name.toLowerCase();

  if (type.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/.test(lowerName)) {
    return "image";
  }

  if (type === "application/pdf" || lowerName.endsWith(".pdf")) {
    return "pdf";
  }

  if (type.startsWith("video/") || /\.(mp4|webm|mov)$/.test(lowerName)) {
    return "video";
  }

  return "other";
}
