export async function captureCard(
  node: HTMLElement,
  width: number,
  height: number,
): Promise<string> {
  if (document.fonts?.ready) {
    await document.fonts.ready
  }
  const { toPng } = await import('html-to-image')
  return toPng(node, {
    width,
    height,
    pixelRatio: 1,
    cacheBust: true,
    backgroundColor: '#08090B',
    style: {
      borderRadius: '0px',
    },
  })
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const anchor = document.createElement('a')
  anchor.href = dataUrl
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, encoded] = dataUrl.split(',')
  const mimeMatch = header.match(/data:([^;]+);/)
  const mime = mimeMatch?.[1] ?? 'image/png'
  const binary = atob(encoded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new Blob([bytes], { type: mime })
}

export type ShareResult = 'shared' | 'downloaded' | 'cancelled'

export async function shareImage(
  dataUrl: string,
  filename: string,
  text: string,
): Promise<ShareResult> {
  const blob = dataUrlToBlob(dataUrl)
  const file = new File([blob], filename, { type: 'image/png' })

  let canShareFiles = false
  try {
    canShareFiles = Boolean(navigator.canShare?.({ files: [file] }))
  } catch {
    canShareFiles = false
  }

  if (canShareFiles && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        files: [file],
        title: 'RESET — Weekly Report',
        text,
      })
      return 'shared'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return 'cancelled'
      }
      // Fall through to a download when the share sheet is unavailable.
    }
  }

  downloadDataUrl(dataUrl, filename)
  return 'downloaded'
}
