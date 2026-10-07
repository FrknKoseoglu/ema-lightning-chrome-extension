# ⚡ EMA Lightning - Chrome Extension

> **Cebinize ve tarayıcınıza sığan Türkçe metin okuma asistanı.**  
> Web sayfalarını, haberleri ve seçtiğiniz Türkçe metinleri **yerel GPU (NVIDIA CUDA) veya CPU'nuz üzerinde**, hiçbir bulut servisine veya API anahtarına ihtiyaç duymadan milisaniyeler içinde seslendirir.

Bu proje; [Canberk Aslan](https://huggingface.co/canberkkkkkk) tarafından geliştirilen ve Türkçe TTS alanında 0.92% WER ile son teknoloji doğruluk sunan [**EMA Lightning**](https://huggingface.co/canberkkkkkk/ema-lightning) (5.6M DiT + 3M HiFi-GAN, ~34 MB) modelini doğrudan Google Chrome tarayıcısına bağlayan yerel bir uzantıdır.

---

## ✨ Özellikler

- 🚀 **Sunucusuz & Tamamen Yerel (Native Messaging):** Arka planda `localhost` portu veya terminal açmanıza gerek yoktur. Chrome, siz tuşa bastığınızda işletim sistemi seviyesinde doğrudan Python motorunu tetikler.
- ⚡ **YouTube Tarzı Canlı Akış (Streaming):** Metnin tamamının bitmesini beklemez; ilk cümle üretildiği anda (2-3 sn içinde) sesi tamponlayıp hoparlörden çalmaya başlar.
- 🎨 **Resmi EMA Lightning Teması:** Orijinal mor, fuşya ve şeftali gradyan renkleriyle modern, cam efektli (glassmorphic) sayfa içi medya oynatıcı kartı.
- 🗕 **Küçültülebilir Oynatıcı (`−`):** Sayfayı okurken görüş açınızı kapatmaması için tek tıkla zarif bir Mini Bar'a dönüşür, istediğinizde büyütülebilir.
- 📖 **Haber & Read Mode Desteği:** İster fareyle bir metin bloğu seçip sağ tıklayarak dinleyin, ister tüm sayfayı/haberi tek tıkla seslendirin.
- 🔒 **%100 Gizlilik:** Hiçbir metin veya ses bilgisayarınızdan dışarı çıkmaz. Tamamen offline çalışır.

---

## 🛠️ Kurulum Rehberi (İnsanlar İçin)

### 1. Gereksinimler
- **Python 3.11 veya 3.12** (Windows x64)
- **Google Chrome**

### 2. Python ve Model Bağımlılıkları
Bir terminal açarak `ema-lightning` ve PyTorch kütüphanelerini yükleyin (NVIDIA ekran kartınız varsa CUDA destekli kurmanız önerilir):

```bash
# Sanal ortam oluşturun ve aktif edin
python -m venv .venv
.\.venv\Scripts\activate

# Model kütüphanesini kurun
pip install ema-lightning

# (Önerilen) NVIDIA GPU hızlandırması için PyTorch CUDA:
pip install torch --index-url https://download.pytorch.org/whl/cu124
```

### 3. Uzantıyı Chrome'a Yükleyin
1. Google Chrome'u açın ve adres çubuğuna `chrome://extensions` yazın.
2. Sağ üst köşedeki **Geliştirici modu (Developer mode)** anahtarını açın.
3. **Paketlenmemiş öge yükle (Load unpacked)** butonuna tıklayın ve bu deponun içindeki `extension` klasörünü seçin.
4. Eklenti kartının altında beliren 32 haneli **Kimlik (ID)** kodunu kopyalayın (Örn: `iajhgfljpfghkhnonancfpjfnkmceapj`).

### 4. Tek Tıkla Kayıt (Windows Host Bağlantısı)
Depo ana dizinindeki `install.bat` dosyasına çift tıklayın ve kopyaladığınız **Eklenti ID'sini** yapıştırıp Enter'a basın.  
*(Bu işlem, Chrome'un uzantıyla arka planda iletişim kurabilmesi için Windows Kayıt Defteri'ne `com.emalightning.tts` anahtarını ekler).*

Hazır! Artık herhangi bir web sayfasını açıp metin seçerek sağ tıklayın ➔ **"Ema ile dinle"** deyin.

---

## 🤖 AI Ajanları İçin Hızlı Entegrasyon (For AI Agents / LLMs)

Eğer bu projeyi bir yapay zeka ajanı veya otomasyon betiği ile klonlayıp kuruyorsanız aşağıdaki adımları izleyin:

```bash
# 1. Depoyu klonla
git clone https://github.com/FrknKoseoglu/ema-lightning-chrome-extension.git
cd ema-lightning-chrome-extension

# 2. Python ortamını hazırla
py -3.12 -m venv .venv
.\.venv\Scripts\pip install ema-lightning torch --index-url https://download.pytorch.org/whl/cu124

# 3. Host manifest dosyasındaki eklenti ID'sini ve bat yolunu güncelle
# com.emalightning.tts.json içerisindeki "allowed_origins" dizisine eklenti kimliğini ekleyin:
# "chrome-extension://<EXTENSION_ID>/"

# 4. Windows Kayıt Defteri anahtarını oluştur
reg add "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.emalightning.tts" /ve /t REG_SZ /d "%CD%\com.emalightning.tts.json" /f
```

### İletişim Protokolü:
Uzantı, `com.emalightning.tts` adıyla kayıtlı `native_host.py` betiğine standart Chrome Native Messaging (4 baytlık uzunluk başlığı + JSON) üzerinden istek atar:
- **İstek Formatı:** `{"action": "SYNTHESIZE", "text": "Okunacak metin..."}`
- **Yanıt Akışı:** Model `tts.stream()` çıktısını `chunk` tipinde Base64 kodlu `.wav` paketleri olarak gönderir; tamamlandığında `{"type": "done"}` mesajı iletir.

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
