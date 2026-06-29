export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export function getFilenameFromDisposition(
  disposition: string | undefined,
  fallback: string
) {
  if (!disposition) return fallback
  const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
  if (match?.[1]) {
    return match[1].replace(/['"]/g, "")
  }
  return fallback
}