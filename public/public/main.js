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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Sensor values
function updateElement(id, path) {
  db.ref(path).on("value", snapshot => {
    document.getElementById(id).innerText = snapshot.val();
  });
}

updateElement("suhu", "/rumahkaca/suhu");
updateElement("kelembaban_udara", "/rumahkaca/kelembaban_udara");
updateElement("kelembaban_tanah", "/rumahkaca/kelembaban_tanah");
updateElement("cahaya", "/rumahkaca/cahaya");

// Mode otomatis
let modeOtomatis = true;
const modeSwitch = document.getElementById("mode-otomatis");

db.ref("/modeOtomatis").on("value", snapshot => {
  modeOtomatis = snapshot.val();
  modeSwitch.checked = modeOtomatis;
  updateManualButtonsState(!modeOtomatis);
});

modeSwitch.addEventListener("change", () => {
  db.ref("/modeOtomatis").set(modeSwitch.checked);
});

// Tombol perangkat
function setupToggle(device, btnId) {
  let status = false;

  db.ref(`/kontrolManual/${device}`).on("value", snapshot => {
    status = snapshot.val() ?? false;
    updateButton(btnId, status);
  });

  document.getElementById(btnId).onclick = () => {
    if (modeOtomatis) return alert("Nonaktifkan mode otomatis untuk kontrol manual!");
    const newState = !status;
    db.ref(`/kontrolManual/${device}`).set(newState);
  };
}

function updateButton(id, state) {
  const el = document.getElementById(id);
  el.classList.remove("on", "off");
  el.classList.add(state ? "on" : "off");
  el.innerText = state ? "ON" : "OFF";
}

function updateManualButtonsState(enabled) {
  ["btn-lampu", "btn-kipas", "btn-pompa"].forEach(id => {
    document.getElementById(id).disabled = !enabled;
  });
}

setupToggle("lampu", "btn-lampu");
setupToggle("kipas", "btn-kipas");
setupToggle("pompa", "btn-pompa");
