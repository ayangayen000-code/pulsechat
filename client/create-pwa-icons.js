import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crc]);
}

function createPng(size) {
  const width = size;
  const height = size;

  // Generate RGBA raw scanlines (filter byte 0 per line)
  const rowBytes = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowBytes);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.44;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Rounded square background (squircle)
      const cornerR = width * 0.22;
      const absX = Math.abs(x - cx);
      const absY = Math.abs(y - cy);
      const half = width * 0.44;

      let inBox = false;
      if (absX <= half - cornerR && absY <= half) inBox = true;
      else if (absY <= half - cornerR && absX <= half) inBox = true;
      else {
        const cdx = absX - (half - cornerR);
        const cdy = absY - (half - cornerR);
        if (cdx * cdx + cdy * cdy <= cornerR * cornerR) inBox = true;
      }

      if (inBox) {
        // Indigo gradient from top-left (#6366f1) to bottom-right (#4338ca)
        const factor = (x + y) / (width + height);
        let r = Math.round(99 + (67 - 99) * factor);
        let g = Math.round(102 + (56 - 102) * factor);
        let b = Math.round(241 + (202 - 241) * factor);

        // Draw white chat bubble graphic in center
        // Bubble body: circle or ellipse
        const bdx = x - cx;
        const bdy = y - (cy - width * 0.03);
        const bubbleDist = Math.sqrt(bdx * bdx + bdy * bdy);
        const bubbleRadius = width * 0.22;

        let inBubble = bubbleDist <= bubbleRadius;
        // Tail: triangle at bottom-left
        if (!inBubble && x >= cx - bubbleRadius * 0.9 && x <= cx - bubbleRadius * 0.1 &&
            y >= cy && y <= cy + bubbleRadius * 0.9) {
          if (y - cy < -(x - (cx - bubbleRadius * 0.1)) * 1.5) {
            inBubble = true;
          }
        }

        // Inner 3 dots
        let inDot = false;
        const dotY = cy - width * 0.03;
        const dotR = width * 0.032;
        [-width * 0.1, 0, width * 0.1].forEach(offset => {
          const ddx = x - (cx + offset);
          const ddy = y - dotY;
          if (ddx * ddx + ddy * ddy <= dotR * dotR) inDot = true;
        });

        if (inDot) {
          // Indigo dot
          rawData[pxOffset] = 99;
          rawData[pxOffset + 1] = 102;
          rawData[pxOffset + 2] = 241;
          rawData[pxOffset + 3] = 255;
        } else if (inBubble) {
          // White bubble
          rawData[pxOffset] = 255;
          rawData[pxOffset + 1] = 255;
          rawData[pxOffset + 2] = 255;
          rawData[pxOffset + 3] = 255;
        } else {
          // Background gradient
          rawData[pxOffset] = r;
          rawData[pxOffset + 1] = g;
          rawData[pxOffset + 2] = b;
          rawData[pxOffset + 3] = 255;
        }
      } else {
        // Transparent outside
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0;
      }
    }
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // Color type: RGBA
  ihdrData[10] = 0; // Deflate
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT (Deflated scanlines)
  const deflated = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', deflated);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const pubDir = 'c:/Users/ayan_gayen/Desktop/AYAN/Chat App/client/public';

const pwa192 = createPng(192);
fs.writeFileSync(path.join(pubDir, 'pwa-192.png'), pwa192);
console.log('✓ Created pwa-192.png');

const pwa512 = createPng(512);
fs.writeFileSync(path.join(pubDir, 'pwa-512.png'), pwa512);
console.log('✓ Created pwa-512.png');

fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), pwa192);
console.log('✓ Created apple-touch-icon.png');
