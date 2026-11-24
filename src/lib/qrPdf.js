function dataUrlToUint8Array(dataUrl) {
  const base64 = dataUrl.split(',')[1] || '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function readImageAsJpegDataUrl(imgElement) {
  const canvas = document.createElement('canvas');
  const size = 512;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(imgElement, 0, 0, size, size);
  return {
    dataUrl: canvas.toDataURL('image/jpeg', 0.95),
    width: size,
    height: size,
  };
}

function escapePdfText(text) {
  return String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function buildQrPdfBytes({ jpegBytes, imgWidth, imgHeight }) {
  // Tarjeta A5 vertical (420 x 595 pt) con paleta Petitcake's
  const pageW = 420;
  const pageH = 595;
  const qrSize = 220;
  const qrX = (pageW - qrSize) / 2;
  const qrY = 195;

  const contentStream = [
    // Fondo crema #FAF7F5
    '0.980 0.969 0.961 rg',
    `0 0 ${pageW} ${pageH} re f`,

    // Franja superior blush #FBF3F5
    '0.984 0.953 0.961 rg',
    `0 ${pageH - 165} ${pageW} 165 re f`,

    // Marco fino rosa #DE76A8
    '0.871 0.463 0.659 RG',
    '1.5 w',
    `18 18 ${pageW - 36} ${pageH - 36} re S`,

    // Caja blanca del QR con borde suave #EFE6E2
    '1 1 1 rg',
    '0.937 0.902 0.886 RG',
    '1 w',
    `${qrX - 16} ${qrY - 16} ${qrSize + 32} ${qrSize + 32} re B`,

    // Imagen JPEG del QR
    'q',
    `${qrSize} 0 0 ${qrSize} ${qrX} ${qrY} cm`,
    '/Im1 Do',
    'Q',

    // Título "Petitcake's" en cacao #4A3B36
    'BT',
    '/F1 28 Tf',
    '0.290 0.231 0.212 rg',
    '118 468 Td',
    `(Petitcake's) Tj`,
    'ET',

    // Subtítulo "by Erika Carabajal" en rosa #DE76A8
    'BT',
    '/F2 13 Tf',
    '0.871 0.463 0.659 rg',
    '142 442 Td',
    `(${escapePdfText('by Erika Carabajal')}) Tj`,
    'ET',

    // URL al pie en cacao claro #8C7A74
    'BT',
    '/F1 11 Tf',
    '0.549 0.478 0.459 rg',
    '128 135 Td',
    `(${escapePdfText('https://petitcakes.oestack.com')}) Tj`,
    'ET',
  ].join('\n');

  const encoder = new TextEncoder();
  const contentBytes = encoder.encode(contentStream);

  const objects = [];
  const addObj = (bodyStrOrBytes) => {
    objects.push(bodyStrOrBytes);
    return objects.length;
  };

  const catalogId = addObj('');
  const pagesId = addObj('');
  const pageId = addObj('');
  const font1Id = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold /Encoding /WinAnsiEncoding >>');
  const font2Id = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Times-Italic /Encoding /WinAnsiEncoding >>');
  const imgId = addObj([
    `<< /Type /XObject /Subtype /Image /Width ${imgWidth} /Height ${imgHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`,
    jpegBytes,
    '\nendstream',
  ]);
  const contentId = addObj([
    `<< /Length ${contentBytes.length} >>\nstream\n`,
    contentBytes,
    '\nendstream',
  ]);

  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageId} 0 R] /Count 1 >>`;
  objects[pageId - 1] =
    `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageW} ${pageH}] ` +
    `/Resources << /Font << /F1 ${font1Id} 0 R /F2 ${font2Id} 0 R >> /XObject << /Im1 ${imgId} 0 R >> >> ` +
    `/Contents ${contentId} 0 R >>`;

  const chunks = [encoder.encode('%PDF-1.4\n')];
  const offsets = [0];
  let currentLength = chunks[0].length;

  for (let i = 0; i < objects.length; i++) {
    offsets.push(currentLength);
    const header = encoder.encode(`${i + 1} 0 obj\n`);
    chunks.push(header);
    currentLength += header.length;

    const obj = objects[i];
    if (typeof obj === 'string') {
      const body = encoder.encode(obj);
      chunks.push(body);
      currentLength += body.length;
    } else {
      for (const part of obj) {
        const b = typeof part === 'string' ? encoder.encode(part) : part;
        chunks.push(b);
        currentLength += b.length;
      }
    }

    const footer = encoder.encode('\nendobj\n');
    chunks.push(footer);
    currentLength += footer.length;
  }

  const xrefOffset = currentLength;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  xref += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  chunks.push(encoder.encode(xref));

  return new Blob(chunks, { type: 'application/pdf' });
}

export async function downloadQrPdf(imgElement) {
  if (!imgElement) return;
  const { dataUrl, width, height } = readImageAsJpegDataUrl(imgElement);
  const jpegBytes = dataUrlToUint8Array(dataUrl);
  const pdfBlob = buildQrPdfBytes({ jpegBytes, imgWidth: width, imgHeight: height });

  const url = URL.createObjectURL(pdfBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'petitcakes-qr.pdf';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}