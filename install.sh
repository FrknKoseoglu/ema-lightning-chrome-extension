#!/bin/bash
set -e

echo "========================================================"
echo "  EMA Lightning Chrome Extension - macOS / Linux Kurulum"
echo "========================================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
JSON_PATH="$SCRIPT_DIR/com.emalightning.tts.json"
HOST_PATH="$SCRIPT_DIR/run_host.sh"

# run_host.sh betiğini çalıştırılabilir yap
chmod +x "$SCRIPT_DIR/native_host.py"
chmod +x "$HOST_PATH" 2>/dev/null || true

# Kullanıcıdan Extension ID al
read -p "Chrome Eklenti Kimliğinizi (ID) girin (chrome://extensions): " EXT_ID

if [ -z "$EXT_ID" ]; then
    echo "[-] Hata: Geçerli bir eklenti ID'si girmediniz!"
    exit 1
fi

# İşletim sistemine göre hedef dizini belirle
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    TARGET_DIR="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"
else
    # Linux
    TARGET_DIR="$HOME/.config/google-chrome/NativeMessagingHosts"
fi

mkdir -p "$TARGET_DIR"

# JSON Manifest oluştur
cat <<EOF > "$TARGET_DIR/com.emalightning.tts.json"
{
  "name": "com.emalightning.tts",
  "description": "EMA Lightning Native Audio Synthesizer Host",
  "path": "$SCRIPT_DIR/run_host.sh",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://$EXT_ID/"
  ]
}
EOF

echo ""
echo "[+] Başarılı! Native Messaging Host kaydedildi:"
echo "    -> $TARGET_DIR/com.emalightning.tts.json"
echo "[*] Chrome'u ve sekmelerinizi yenileyerek kullanmaya başlayabilirsiniz."
echo ""
