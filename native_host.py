import sys
import os
import json
import struct
import io
import re
import base64
import wave
import numpy as np

# EMA Lightning modelini GPU üzerine yükle
from ema_lightning import EMA

def sanitize_for_speech(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r'(\w+)[-–—]\s*\n\s*(\w+)', r'\1\2', text)
    text = re.sub(r'\n\s*\d+\s*\n', '\n', text)
    text = re.sub(r'\((\d{4})\s*[-–—]\s*(\d{4})\)', r'\1 ile \2 yılları arası', text)
    text = re.sub(r'\b1\.\s*Bölüm', 'Birinci Bölüm', text, flags=re.IGNORECASE)
    text = re.sub(r'\b2\.\s*Bölüm', 'İkinci Bölüm', text, flags=re.IGNORECASE)
    text = re.sub(r'\b3\.\s*Bölüm', 'Üçüncü Bölüm', text, flags=re.IGNORECASE)
    text = text.replace('(', ', ').replace(')', ', ')
    text = re.sub(r'["\'“”‘’«»`´]', ' ', text)
    text = text.replace(':', ', ')
    text = re.sub(r'[-–—]', ' ', text)
    text = re.sub(r',\s*,', ',', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def send_message(msg):
    raw_json = json.dumps(msg).encode('utf-8')
    sys.stdout.buffer.write(struct.pack('<I', len(raw_json)))
    sys.stdout.buffer.write(raw_json)
    sys.stdout.buffer.flush()

def read_message():
    raw_length = sys.stdin.buffer.read(4)
    if len(raw_length) == 0:
        return None
    length = struct.unpack('<I', raw_length)[0]
    data = sys.stdin.buffer.read(length).decode('utf-8')
    return json.loads(data)

def main():
    tts = EMA()

    while True:
        try:
            req = read_message()
            if req is None:
                break

            action = req.get("action")
            if action == "SYNTHESIZE":
                text = req.get("text", "")
                clean_text = sanitize_for_speech(text)
                if not clean_text:
                    send_message({"type": "error", "message": "Boş metin"})
                    continue

                # Canlı parça parça stream et (YouTube tamponu gibi)
                for chunk in tts.stream(clean_text):
                    # 16-bit PCM oluştur
                    audio_int16 = (np.clip(chunk, -1.0, 1.0) * 32767).astype(np.int16)
                    # Kusursuz WAV paketi olarak paketle (fışırtıyı %100 önler)
                    wav_io = io.BytesIO()
                    with wave.open(wav_io, 'wb') as wav_file:
                        wav_file.setnchannels(1)
                        wav_file.setsampwidth(2)
                        wav_file.setframerate(48000)
                        wav_file.writeframes(audio_int16.tobytes())

                    b64_wav = base64.b64encode(wav_io.getvalue()).decode('ascii')
                    send_message({
                        "type": "chunk",
                        "audio_base64": b64_wav,
                        "duration": len(chunk) / 48000.0
                    })

                send_message({"type": "done"})

        except Exception as e:
            send_message({"type": "error", "message": str(e)})

if __name__ == "__main__":
    main()
