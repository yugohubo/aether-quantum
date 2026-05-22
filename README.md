# AetherQuantum - Agentic Quantum Computing Playground

AetherQuantum, tarayıcınızda çalışan, doğal dil komutlarıyla yönetilen yüksek hassasiyetli bir kuantum bilgisayar simülatörü ve laboratuvarıdır. Kompleks sayılarla çalışan 4 qubit'lik bir kuantum durum vektörü (statevector) simülatörü ile yapay zekanın kapı derleme (gate compiler) yeteneklerini birleştirir.

👉 **Canlı Demo:** [https://yugohubo.github.io/aether-quantum/]

---

## 🚀 Özellikler

- **Gelişmiş Kuantum Simülatör Motoru:** Kompleks kuantum genliklerini ($a + bi$) yöneten aritmetik kütüphane. Süperpozisyon, faz dönüşleri ve dolanıklığı (entanglement) tam olarak simüle eder.
- **Kuantum Yapay Zeka Ajanı:** Doğal dilde girilen komutları analiz ederek kuantum devresi kapılarına derler ve her adımda neden o kapıları seçtiğini gösteren bir "Düşünce Zinciri" (Chain of Thought) oluşturur.
- **Dinamik SVG Devre Şeması:** Devre hatlarını gerçek zamanlı olarak çizer. Devre üzerindeki kapılara tıklayarak onları anında silebilirsiniz.
- **Faz Çarkı Göstergeleri (Phase Wheels):** 16 olası durum genliğinin büyüklüğünü ve faz açısını kutupsal eksende görselleştirir.
- **Simüle Ölçüm Histogramı:** 1024 Monte Carlo ölçüm atışı (shots) gerçekleştirerek gerçek bir kuantum donanımının çıktı dağılımını simüle eder.

---

## 🔬 Algoritma Şablonları (Missions)

Uygulama içerisinde yerleşik olarak gelen hazır kuantum protokolleri:

1. **Bell Dolanıklık Durumu (EPR Pair):** $q_0$ ve $q_1$ qubitlerini dolandırarak $\frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$ süperpozisyonunu oluşturur.
2. **GHZ Durumu:** 3 qubit'in makroskobik dolanıklığını simüle eder: $\frac{1}{\sqrt{2}}(|000\rangle + |111\rangle)$.
3. **Grover Arama Algoritması (2 Qubit):** Süperpozisyon içinden aranan $|11\rangle$ durumunun genliğini tek bir adımda yansıtma (diffuser) yoluyla %100 olasılığa yükseltir.
4. **Deutsch-Jozsa Algoritması:** Faz geri tepmesi (phase kickback) kullanarak bir fonksiyonun sabit mi yoksa dengeli mi olduğunu tek bir kuantum sorgusu ile belirler.
5. **Kuantum Işınlama (Quantum Teleportation):** Dolanıklık kanalı ve klasik düzeltme kapıları (CNOT & CZ) aracılığıyla $q_0$'daki bir durumu $q_2$'ye ışınlar.

---

## 🛠️ Yerel Kurulum & Çalıştırma

Proje hiçbir harici kütüphane veya backend sunucusu gerektirmez (Vanilla JS, CSS ve HTML5). Yerel olarak çalıştırmak için:

1. Bu depoyu klonlayın:
   ```bash
   git clone https://github.com/kullanici_adi/aether-quantum.git
   ```
2. Proje dizinine gidin:
   ```bash
   cd aether-quantum
   ```
3. Yerel bir statik sunucu başlatın (örn. Python ile):
   ```bash
   python -m http.server 8000
   ```
4. Tarayıcınızda `http://localhost:8000` adresini açın.

---

## 📂 Dosya Yapısı

```text
├── index.html       # Laboratuvar ana arayüzü ve HTML5 iskeleti
├── styles.css       # Siber-punk koyu tema, glassmorphism ve neon CSS kodları
├── quantum.js       # Kompleks sayılar ve Kuantum Register simülatör motoru
├── agent.js         # Doğal dil işleyici ve Kuantum Kapı Derleyicisi (Agent)
├── app.js           # UI olay yöneticisi, SVG çizim modülü ve grafik bağlayıcı
└── README.md        # Proje dokümantasyonu
```

---

## 🤝 Katkıda Bulunma

Kuantum kapıları, yeni algoritmalar veya görselleştirmeler eklemek isterseniz, lütfen bir Pull Request gönderin veya Issue açın
Sevgiler...
