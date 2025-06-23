// --- KONFIGURASI FIREBASE ---
// Konfigurasi ini diambil dari proyek Firebase Anda.
const firebaseConfig = {
  apiKey: "AIzaSyCKZJ2TpvHyescHOo5HHfRcI9FOCL2aRWA",
  authDomain: "otomatisasi-rumah-kaca.firebaseapp.com",
  databaseURL: "https://otomatisasi-rumah-kaca-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "otomatisasi-rumah-kaca",
  storageBucket: "otomatisasi-rumah-kaca.appspot.com",
  messagingSenderId: "700746703077",
  appId: "1:700746703077:web:855779cda73025835e340c",
  measurementId: "G-QN9R8DB19P"
};

// Menjalankan semua logika setelah halaman HTML selesai dimuat
document.addEventListener('DOMContentLoaded', () => {

  // --- INISIALISASI & REFERENSI ---
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();

  // Kumpulan path database agar mudah dikelola
  const DB_PATHS = {
    suhu: "/rumahkaca/suhu",
    kelembabanUdara: "/rumahkaca/kelembaban_udara",
    kelembabanTanah: "/rumahkaca/kelembaban_tanah",
    cahaya: "/rumahkaca/cahaya",
    modeOtomatis: "/modeOtomatis",
    kontrolManual: "/kontrolManual"
  };

  // Kumpulan referensi ke elemen HTML
  const elements = {
    suhu: document.getElementById("suhu"),
    kelembabanUdara: document.getElementById("kelembaban_udara"),
    kelembabanTanah: document.getElementById("kelembaban_tanah"),
    cahaya: document.getElementById("cahaya"),
    modeSwitch: document.getElementById("mode-otomatis"),
    btnLampu: document.getElementById("btn-lampu"),
    btnKipas: document.getElementById("btn-kipas"),
    btnPompa: document.getElementById("btn-pompa")
  };
  
  const manualButtons = [elements.btnLampu, elements.btnKipas, elements.btnPompa];

  let isModeOtomatis = true;

  // --- LOGIKA PEMBARUAN SENSOR ---
  /**
   * Mengatur listener untuk memperbarui nilai sensor dari Firebase ke elemen HTML.
   * @param {HTMLElement} element - Elemen HTML yang akan diperbarui.
   * @param {string} path - Path ke data di Firebase Realtime Database.
   */
  function listenToSensor(element, path) {
    db.ref(path).on("value", snapshot => {
      if (element) {
        element.innerText = snapshot.val();
      }
    });
  }

  listenToSensor(elements.suhu, DB_PATHS.suhu);
  listenToSensor(elements.kelembabanUdara, DB_PATHS.kelembabanUdara);
  listenToSensor(elements.kelembabanTanah, DB_PATHS.kelembabanTanah);
  listenToSensor(elements.cahaya, DB_PATHS.cahaya);


  // --- LOGIKA MODE OTOMATIS ---
  /**
   * Mengaktifkan atau menonaktifkan semua tombol kontrol manual.
   * @param {boolean} enabled - True untuk mengaktifkan, false untuk menonaktifkan.
   */
  function setManualButtonsState(enabled) {
    manualButtons.forEach(button => {
      if (button) {
        button.disabled = !enabled;
      }
    });
  }

  // Listener untuk status mode otomatis dari Firebase
  db.ref(DB_PATHS.modeOtomatis).on("value", snapshot => {
    isModeOtomatis = snapshot.val();
    elements.modeSwitch.checked = isModeOtomatis;
    setManualButtonsState(!isModeOtomatis);
  });

  // Listener untuk toggle switch di halaman web
  elements.modeSwitch.addEventListener("change", () => {
    db.ref(DB_PATHS.modeOtomatis).set(elements.modeSwitch.checked);
  });


  // --- LOGIKA TOMBOL KONTROL MANUAL ---
  /**
   * Mengatur listener untuk tombol kontrol manual (on/off).
   * @param {string} deviceName - Nama perangkat (cth: "lampu").
   * @param {HTMLElement} buttonElement - Elemen tombol yang dikontrol.
   */
  function setupDeviceToggleButton(deviceName, buttonElement) {
    if (!buttonElement) return;

    let deviceStatus = false;
    const devicePath = `${DB_PATHS.kontrolManual}/${deviceName}`;

    // Listener untuk status perangkat dari Firebase
    db.ref(devicePath).on("value", snapshot => {
      deviceStatus = snapshot.val() ?? false;
      updateButtonUI(buttonElement, deviceStatus);
    });

    // Listener untuk klik pada tombol di halaman web
    buttonElement.onclick = () => {
      if (isModeOtomatis) {
        return alert("Mode Otomatis aktif! Nonaktifkan terlebih dahulu untuk menggunakan kontrol manual.");
      }
      const newStatus = !deviceStatus;
      db.ref(devicePath).set(newStatus);
    };
  }

  /**
   * Memperbarui tampilan UI sebuah tombol (warna dan teks).
   * @param {HTMLElement} element - Elemen tombol yang akan diperbarui.
   * @param {boolean} state - Status terkini perangkat (true untuk ON, false untuk OFF).
   */
  function updateButtonUI(element, state) {
    element.classList.remove("on", "off");
    element.classList.add(state ? "on" : "off");
    element.innerText = state ? "ON" : "OFF";
  }

  setupDeviceToggleButton("lampu", elements.btnLampu);
  setupDeviceToggleButton("kipas", elements.btnKipas);
  setupDeviceToggleButton("pompa", elements.btnPompa);

});