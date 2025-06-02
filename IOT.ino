#include <WiFi.h>
#include <DHT.h>
#include <Firebase_ESP_Client.h>

// ----------------------------
// KONFIGURASII
// ----------------------------
#define WIFI_SSID ""
#define WIFI_PASSWORD ""

#define API_KEY "AIzaSyCKZJ2TpvHyescHOo5HHfRcI9FOCL2aRWA"
#define DATABASE_URL "https://otomatisasi-rumah-kaca-default-rtdb.asia-southeast1.firebasedatabase.app"

// Dummy akun Firebase (dibutuhkan walaupun mode test)
#define USER_EMAIL "yankeerx05@gmail.com"
#define USER_PASSWORD ""

// ----------------------------
// INISIALISASI
// ----------------------------
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

#define DHTPIN 15
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

const int potPin = 35;    // Sensor kelembaban tanah
const int ldrPin = 34;    // Sensor cahaya (LDR)
const int kipas = 18;
const int pompa = 19;
const int lampu = 21;

const float suhuThreshold = 30.0;
const int tanahThreshold = 1500;
const int cahayaThreshold = 1500;

// ----------------------------
// SETUP
// ----------------------------
void setup() {
  Serial.begin(115200);

  pinMode(kipas, OUTPUT);
  pinMode(pompa, OUTPUT);
  pinMode(lampu, OUTPUT);

  dht.begin();

  // Koneksi WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Menghubungkan ke WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println("\nWiFi Terhubung!");

  // Konfigurasi Firebase
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

// ----------------------------
// LOOP UTAMA
// ----------------------------
void loop() {
  float suhu = dht.readTemperature();
  float kelembaban = dht.readHumidity();
  int tanah = analogRead(potPin);
  int cahaya = analogRead(ldrPin);

  // Validasi data
  if (isnan(suhu) || isnan(kelembaban)) {
    Serial.println("Gagal membaca DHT22!");
    return;
  }

  // Debug ke serial
  Serial.println("---- Data Sensor ----");
  Serial.println("Suhu: " + String(suhu) + " °C");
  Serial.println("Kelembaban Udara: " + String(kelembaban) + " %");
  Serial.println("Kelembaban Tanah: " + String(tanah));
  Serial.println("Cahaya: " + String(cahaya));

  // Otomasi perangkat
  digitalWrite(kipas, suhu > suhuThreshold ? HIGH : LOW);
  digitalWrite(pompa, tanah < tanahThreshold ? HIGH : LOW);
  digitalWrite(lampu, cahaya < cahayaThreshold ? HIGH : LOW);

  // Kirim data ke Firebase
  Firebase.RTDB.setFloat(&fbdo, "/rumahKaca/suhu", suhu);
  Firebase.RTDB.setFloat(&fbdo, "/rumahKaca/kelembaban_udara", kelembaban);
  Firebase.RTDB.setInt(&fbdo, "/rumahKaca/kelembaban_tanah", tanah);
  Firebase.RTDB.setInt(&fbdo, "/rumahKaca/cahaya", cahaya);

  delay(5000); // kirim data setiap 5 detik
}
