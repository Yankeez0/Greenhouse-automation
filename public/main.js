// 🔧 Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCKZJ2TpvHyescHOo5HHfRcI9FOCL2aRWA",
  authDomain: "otomatisasi-rumah-kaca.firebaseapp.com",
  databaseURL: "https://otomatisasi-rumah-kaca-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "otomatisasi-rumah-kaca",
  storageBucket: "otomatisasi-rumah-kaca.firebasestorage.app",
  messagingSenderId: "700746703077",
  appId: "1:700746703077:web:855779cda73025835e340c",
  measurementId: "G-QN9R8DB19P"
};

// 🚀 Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 🔁 Tampilkan data sensor ke tampilan
function updateElement(id, path) {
  db.ref(path).on("value", snapshot => {
    document.getElementById(id).innerText = snapshot.val();
  });
}

updateElement("suhu", "/rumahkaca/suhu");
updateElement("kelembaban_udara", "/rumahkaca/kelembaban_udara");
updateElement("kelembaban_tanah", "/rumahkaca/kelembaban_tanah");
updateElement("cahaya", "/rumahkaca/cahaya");

// ⚡ Kontrol lampu
let statusLampu = false;

function updateButton(id, state) {
  const el = document.getElementById(id);
  el.classList.remove("on", "off");
  el.classList.add(state ? "on" : "off");
  el.innerText = state ? "ON" : "OFF";
}

db.ref("/kontrolManual/lampu").on("value", snapshot => {
  statusLampu = snapshot.val();
  updateButton("btn-lampu", statusLampu);
});

function setControl(device, state) {
  db.ref(`/kontrolManual/${device}`).set(state);
}
