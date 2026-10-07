# ⚡ EMA Lightning - Chrome Extension

> **Cebinize ve tarayıcınıza sığan Türkçe metin okuma asistanı.**  
> Web sayfalarını, haberleri ve seçtiğiniz Türkçe metinleri **yerel GPU (NVIDIA CUDA, Apple Silicon MPS) veya CPU'nuz üzerinde**, hiçbir bulut servisine veya API anahtarına ihtiyaç duymadan milisaniyeler içinde seslendirir.

Bu proje; [Canberk Aslan](https://huggingface.co/canberkkkkkk) tarafından geliştirilen ve Türkçe TTS alanında 0.92% WER ile son teknoloji doğruluk sunan [**EMA Lightning**](https://huggingface.co/canberkkkkkk/ema-lightning) (5.6M DiT + 3M HiFi-GAN, ~34 MB) modelini doğrudan Google Chrome tarayıcısına bağlayan yerel bir uzantıdır.

---

## ✨ Özellikler

- 🌐 **Platform Bağımsız (Windows, macOS, Linux):** Windows'ta da, Apple Silicon Mac'lerde de (M1/M2/M3/M4) aynı yerel hızla çalışır.
- 🚀 **Sunucusuz & Tamamen Yerel (Native Messaging):** Arka planda `localhost` portu veya terminal açmanıza gerek yoktur. Chrome, siz tuşa bastığınızda işletim sistemi seviyesinde doğrudan Python motorunu tetikler.
- ⚡ **YouTube Tarzı Canlı Akış (Streaming):** Metnin tamamının bitmesini beklemez; ilk cümle üretildiği anda (2-3 sn içinde) sesi tamponlayıp hoparlörden çalmaya başlar.
- 🎨 **Resmi EMA Lightning Teması:** Orijinal mor, fuşya ve şeftali gradyan renkleriyle modern sayfa içi medya oynatıcı kartı.
- 🗕 **Küçültülebilir Oynatıcı (`−`):** Sayfayı okurken görüş açınızı kapatmaması için tek tıkla zarif bir Mini Bar'a dönüşür, istediğinizde büyütülebilir.
- 📖 **Haber & Read Mode Desteği:** İster fareyle bir metin bloğu seçip sağ tıklayarak dinleyin, ister tüm sayfayı/haberi tek tıkla seslendirin.
- 🔒 **%100 Gizlilik:** Hiçbir metin veya ses bilgisayarınızdan dışarı çıkmaz. Tamamen offline çalışır.

---

## 🛠️ Kurulum Rehberi

### 1. Gereksinimler
- **Python 3.11 veya 3.12**
- **Google Chrome**

### 2. Python ve Model Bağımlılıkları
Terminal üzerinden `ema-lightning` kütüphanesini kurun:

```bash
# Sanal ortam oluşturun ve aktif edin
python3 -m venv .venv
source .venv/bin/activate  # Windows için: .\.venv\Scripts\activate

# Modeli kurun
pip install ema-lightning

# [Windows / NVIDIA GPU] CUDA desteği için:
pip install torch --index-url https://download.pytorch.org/whl/cu124

# [macOS / Apple Silicon] PyTorch varsayılan olarak MPS (Metal GPU) destekler:
pip install torch
```

---

### 3. Uzantıyı Chrome'a Yükleyin
1. Google Chrome'da `chrome://extensions` sayfasına gidin.
2. Sağ üst köşedeki **Geliştirici modu (Developer mode)** anahtarını açın.
3. **Paketlenmemiş öge yükle (Load unpacked)** butonuna tıklayıp bu projedeki `extension` klasörünü seçin.
4. Eklenti kartının altında beliren 32 haneli **Kimlik (ID)** kodunu kopyalayın (Örn: `iajhgfljpfghkhnonancfpjfnkmceapj`).

---

### 4. Tek Tıkla Tarayıcı Entegrasyonu

Chrome'un güvenlik standartları gereği yerel Python dosyasıyla konuşabilmesi için Native Host kaydı yapılır:

#### 🪟 Windows Kullanıcıları:
`install.bat` dosyasına çift tıklayın ve kopyaladığınız **Eklenti ID'sini** yapıştırıp Enter'a basın.

#### 🍏 macOS ve 🐧 Linux Kullanıcıları:
Terminalden şu komutu çalıştırıp Eklenti ID'nizi yapıştırın:
```bash
chmod +x install.sh run_host.sh
./install.sh
```
*(macOS'ta kayıt defteri yoktur; betik Chrome'un standart `~/Library/Application Support/Google/Chrome/NativeMessagingHosts/` dizinine gerekli JSON yapılandırmasını otomatik kopyalar).*

Hazır! Artık herhangi bir web sayfasında metin seçip sağ tıklayarak **"Ema ile dinle"** diyebilirsiniz.

---

## 🤖 AI Ajanları İçin Hızlı Entegrasyon (For AI Agents / LLMs)

```bash
# 1. Depoyu klonla
git clone https://github.com/FrknKoseoglu/ema-lightning-chrome-extension.git
cd ema-lightning-chrome-extension

# 2. Ortamı kur
python3 -m venv .venv && source .venv/bin/activate
pip install ema-lightning torch

# 3. macOS / Linux host kaydı
mkdir -p "$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"
sed "s/<EXTENSION_ID>/$EXT_ID/g" com.emalightning.tts.json > "$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts/com.emalightning.tts.json"
```

---

## 🙏 Teşekkür ve Atıflar

Bu uzantı, gücünü açık kaynak Türkçe yapay zekâ ekosisteminin harika projelerinden almaktadır:
- **Model:** [EMA Lightning](https://huggingface.co/canberkkkkkk/ema-lightning) - Geliştirici: [Canberk Aslan](https://github.com/canberk7)
- **Metin Normalizasyonu:** [normalizer-tr](https://github.com/erdemtuna/normalizer-tr) - Geliştirici: [Erdem Tuna](https://github.com/erdemtuna)

```bibtex
@misc{aslan2026emalightning,
  title        = {EMA Lightning: Tiny, Fast and Accurate Turkish Text to Speech},
  author       = {Aslan, Canberk},
  year         = {2026},
  howpublished = {\url{https://huggingface.co/canberkkkkkk/ema-lightning}}
}
```

---

## 📄 Lisans
Bu proje [Apache 2.0](LICENSE) lisansı ile dağıtılmaktadır. Ticari ve kişisel kullanım için uygundur.
