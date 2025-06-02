# Greenhouse-automation
Proyek ini adalah tugas mata kuliah Sistem digital dengan judul "sistem monitoring dan kontrol otomatis untuk rumah kaca" menggunakan ESP32, dengan sensor suhu, kelembaban, kelembaban tanah, dan cahaya. Semua data dikirim dan dikendalikan melalui Firebase Realtime Database dan ditampilkan dalam dashboard web real-time.

## Fitur Utama
- Pemantauan suhu dan kelembaban udara dengan DHT22
- Simulasi kelembaban tanah menggunakan potensiometer
- Deteksi intensitas cahaya menggunakan LDR
- Kontrol otomatis dan manual untuk:
  - Kipas (berdasarkan suhu)
  - Pompa air (berdasarkan kelembaban tanah)
  - Lampu (berdasarkan intensitas cahaya)
- Kirim & baca data secara real-time ke/dari Firebase
- Dashboard Web untuk monitoring dan kontrol perangkat secara langsung
