#include <WiFi.h>
#include <FirebaseESP32.h>
#include <DHT.h>

#define WIFI_SSID "NAMAWIFI"
#define WIFI_PASSWORD "PASSWORDWIFI"
#define FIREBASE_HOST "otomatisasi-rumah-kaca-default-rtdb.asia-southeast1.firebasedatabase.app"
#define FIREBASE_AUTH "APIKEY"

#define DHTPIN 4
#define DHTTYPE DHT11

#define RELAY_LAMPU 16
#define RELAY_KIPAS 17
#define RELAY_POMPA 18

#define SOIL_PIN 34       // sensor kelembaban tanah (analog)
#define LDR_PIN 35        // sensor cahaya (analog)

FirebaseData fbdo;
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Menyambungkan WiFi...");
  }

  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  Firebase.reconnectWiFi(true);

  dht.begin();

  pinMode(RELAY_LAMPU, OUTPUT);
  pinMode(RELAY_KIPAS, OUTPUT);
  pinMode(RELAY_POMPA, OUTPUT);
}

void loop() {
  // Sensor baca
  float suhu = dht.readTemperature();
  float kelembabanUdara = dht.readHumidity();
  int kelembabanTanah = analogRead(SOIL_PIN);     // 0–4095
  int nilaiCahaya = analogRead(LDR_PIN);          // 0–4095

  // Kalibrasi nilai (jika perlu)
  int kelembabanTanahPersen = map(kelembabanTanah, 4095, 0, 0, 100);
  int intensitasCahaya = map(nilaiCahaya, 4095, 0, 0, 100); // makin kecil, makin gelap

  // Kirim ke Firebase
  Firebase.setFloat(fbdo, "/rumahkaca/suhu", suhu);
  Firebase.setFloat(fbdo, "/rumahkaca/kelembaban_udara", kelembabanUdara);
  Firebase.setInt(fbdo, "/rumahkaca/kelembaban_tanah", kelembabanTanahPersen);
  Firebase.setInt(fbdo, "/rumahkaca/cahaya", intensitasCahaya);

  // Mode otomatis atau manual?
  bool modeOtomatis = Firebase.getBool(fbdo, "/modeOtomatis");

  if (modeOtomatis) {
    // 🔁 Logika otomatis
    bool kipas = suhu > 35;
    bool lampu = intensitasCahaya < 30;       // 0 sangat gelap, 100 sangat terang
    bool pompa = kelembabanTanahPersen < 40;

    digitalWrite(RELAY_KIPAS, kipas ? HIGH : LOW);
    digitalWrite(RELAY_LAMPU, lampu ? HIGH : LOW);
    digitalWrite(RELAY_POMPA, pompa ? HIGH : LOW);

    Firebase.setBool(fbdo, "/kontrolManual/kipas", kipas);
    Firebase.setBool(fbdo, "/kontrolManual/lampu", lampu);
    Firebase.setBool(fbdo, "/kontrolManual/pompa", pompa);
  } else {
    // 🎮 Manual kontrol dari web
    bool kipas = Firebase.getBool(fbdo, "/kontrolManual/kipas");
    bool lampu = Firebase.getBool(fbdo, "/kontrolManual/lampu");
    bool pompa = Firebase.getBool(fbdo, "/kontrolManual/pompa");

    digitalWrite(RELAY_KIPAS, kipas ? HIGH : LOW);
    digitalWrite(RELAY_LAMPU, lampu ? HIGH : LOW);
    digitalWrite(RELAY_POMPA, pompa ? HIGH : LOW);
  }

  delay(5000);
}