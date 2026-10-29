import qrcode from 'qrcode-generator';

// Built into the page as inline SVG, so no QR library ships to the browser.
export function qrSvg(url: string): string {
  const qr = qrcode(0, 'M');
  qr.addData(url);
  qr.make();
  return qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
}
