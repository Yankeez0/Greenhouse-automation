// Konfigurasi Firebase
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

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Fungsi untuk update tampilan data sensor
function updateElement(id, path) {
    db.ref(path).on("value", snapshot => {
        document.getElementById(id).innerText = snapshot.val();
    });
}

// Tampilkan data sensor
updateElement("suhu", "/rumahkaca/suhu");
updateElement("kelembaban_udara", "/rumahkaca/kelembaban_udara");
updateElement("kelembaban_tanah", "/rumahkaca/kelembaban_tanah");
updateElement("cahaya", "/rumahkaca/cahaya");

// Status perangkat
let statusLampu = true;
let statusKipas = true;
let statusPompa = true;

// Fungsi pembaruan tampilan tombol
function updateButton(id, state) {
    const el = document.getElementById(id);
    el.classList.remove("on", "off");
    el.classList.add(state ? "on" : "off");
    el.innerText = state ? "ON" : "OFF";
}

// Pantau perubahan status perangkat dari Firebase
db.ref("/kontrolManual/lampu").on("value", snapshot => {
    statusLampu = snapshot.val();
    updateButton("btn-lampu", statusLampu);
});

db.ref("/kontrolManual/kipas").on("value", snapshot => {
    statusKipas = snapshot.val();
    updateButton("btn-kipas", statusKipas);
});

db.ref("/kontrolManual/pompa").on("value", snapshot => {
    statusPompa = snapshot.val();
    updateButton("btn-pompa", statusPompa);
});

// Fungsi untuk mengirim status ON/OFF dan langsung perbarui variabel lokal
function setControl(device, state) {
    db.ref(`/kontrolManual/${device}`).set(state)
        .then(() => {
            if (device === "lampu") statusLampu = state;
            else if (device === "kipas") statusKipas = state;
            else if (device === "pompa") statusPompa = state;
        })
        .catch(error => {
            console.error("Gagal memperbarui kontrol:", error);
        });
}