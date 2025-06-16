#include <WiFi.h>
#include <DHT.h>
#include <Firebase_ESP_Client.h>

// ----------- Konfigurasi WiFi ------------
#define WIFI_SSID "NAMA_WIFI_ANDA"
#define WIFI_PASSWORD "PASSWORD_WIFI_ANDA"

// ----------- Konfigurasi Firebase --------
#define API_KEY "API_KEY_ANDA"
#define DATABASE_URL "https://otomatisasi-rumah-kaca-default-rtdb.asia-southeast1.firebasedatabase.app"

#define USER_EMAIL "dummy@email.com"
#define USER_PASSWORD "12345678"

// ----------- Inisialisasi Firebase --------
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// ----------- Sensor & Output --------------
#define DHTPIN 15
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

const int soilPin = 35;   // Potensiometer simulasi kelembaban tanah
const int ldrPin = 34;    // Sensor LDR (cahaya)
const int lampuPin = 21;  // Hanya kontrol lampu

// ----------- Status Lampu ---------------
bool statusLampu = false;

void setup() {
  Serial.begin(115200);
  pinMode(lampuPin, OUTPUT);
  dht.begin();

  // Koneksi WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println("\nWiFi Connected!");

  // Konfigurasi Firebase
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  float suhu = dht.readTemperature();
  float kelembaban_udara = dht.readHumidity();
  int kelembaban_tanah = analogRead(soilPin);
  int cahaya = analogRead(ldrPin);

  // Validasi DHT
  if (isnan(suhu) || isnan(kelembaban_udara)) {
    Serial.println("Gagal membaca DHT!");
    return;
  }

  // Kirim ke Firebase
  Firebase.RTDB.setFloat(&fbdo, "/rumahkaca/suhu", suhu);
  Firebase.RTDB.setFloat(&fbdo, "/rumahkaca/kelembaban_udara", kelembaban_udara);
  Firebase.RTDB.setInt(&fbdo, "/rumahkaca/kelembaban_tanah", kelembaban_tanah);
  Firebase.RTDB.setInt(&fbdo, "/rumahkaca/cahaya", cahaya);

  // Ambil status lampu dari Firebase dan aktifkan output
  if (Firebase.RTDB.getBool(&fbdo, "/kontrolManual/lampu")) {
    statusLampu = fbdo.boolData();
    digitalWrite(lampuPin, statusLampu ? HIGH : LOW);
  }

  // Debug
  Serial.println("Suhu: " + String(suhu));
  Serial.println("Kelembaban Udara: " + String(kelembaban_udara));
  Serial.println("Kelembaban Tanah: " + String(kelembaban_tanah));
  Serial.println("Cahaya: " + String(cahaya));
  Serial.println("Lampu: " + String(statusLampu));
  Serial.println("-----");

  delay(5000);
}
