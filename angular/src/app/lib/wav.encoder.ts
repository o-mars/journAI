export function encodeWAV(audioData: Int16Array, sampleRate: number = 24000): Blob {
  const buffer = new ArrayBuffer(44 + audioData.length * 2); // 44 bytes for WAV header + audio data size
  const view = new DataView(buffer);

  // Write WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + audioData.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // PCM format size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono channel
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // Byte rate
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // Bits per sample
  writeString(view, 36, 'data');
  view.setUint32(40, audioData.length * 2, true);

  // Write PCM audio data
  let offset = 44;
  for (let i = 0; i < audioData.length; i++) {
    view.setInt16(offset, audioData[i], true);
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
}

export function encodeWAVChunk(audioData: Int16Array): Uint8Array {
  const buffer = new ArrayBuffer(44 + audioData.length * 2); // WAV header + PCM data
  const view = new DataView(buffer);

  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + audioData.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // PCM format size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono channel
  view.setUint32(24, 24000, true); // Sample rate
  view.setUint32(28, 24000 * 2, true); // Byte rate
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // Bits per sample
  writeString(view, 36, 'data');
  view.setUint32(40, audioData.length * 2, true);

  // PCM data
  let offset = 44;
  for (let i = 0; i < audioData.length; i++, offset += 2) {
    view.setInt16(offset, audioData[i], true);
  }

  return new Uint8Array(buffer);
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
