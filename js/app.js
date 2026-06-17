document.addEventListener("DOMContentLoaded", function () {

    /* ================= ELEMENTS ================= */

    const siren = document.getElementById("siren");
    const statusText = document.getElementById("status");

    const sosButton = document.querySelector(".sos-btn");
    const stopEmergencyButton = document.getElementById("stopEmergency");

    const emergencyName = document.getElementById("emergencyName");
    const emergencyNumber = document.getElementById("emergencyNumber");
    const saveButton = document.getElementById("saveContact");
    const contactList = document.getElementById("contactList");

    const startCheckInButton = document.getElementById("startCheckIn");
    const checkInTime = document.getElementById("checkInTime");
    const checkInStatus = document.getElementById("checkInStatus");

    let checkInInterval = null;

    /* ================= HELPERS ================= */

    function updateStatus(msg) {
        statusText.innerText = msg;
    }

    function getContacts() {
        return JSON.parse(localStorage.getItem("guardianContacts")) || [];
    }

    function saveContacts(contacts) {
        localStorage.setItem("guardianContacts", JSON.stringify(contacts));
    }

    function getHistory() {
        return JSON.parse(localStorage.getItem("guardianHistory")) || [];
    }

    function saveHistory(history) {
        localStorage.setItem("guardianHistory", JSON.stringify(history));
    }

    /* ================= CONTACT DISPLAY ================= */

    function displayContacts() {
        const contacts = getContacts();
        contactList.innerHTML = "";

        if (contacts.length === 0) {
            contactList.innerHTML = "<li>No contacts saved.</li>";
            return;
        }

        contacts.forEach((c, index) => {
            const li = document.createElement("li");

            li.innerHTML = `
                <strong>${c.name}</strong> (${c.number})
                <button class="delete">Delete</button>
            `;

            li.querySelector(".delete").addEventListener("click", function () {
                contacts.splice(index, 1);
                saveContacts(contacts);
                displayContacts();
            });

            contactList.appendChild(li);
        });
    }

    /* ================= SAVE CONTACT ================= */

    saveButton.addEventListener("click", function () {

        const name = emergencyName.value.trim();
        const number = emergencyNumber.value.trim();

        if (!name || !number) {
            alert("Enter name and number");
            return;
        }

        const contacts = getContacts();

        if (contacts.length >= 5) {
            alert("Max 5 contacts allowed");
            return;
        }

        if (contacts.some(c => c.number === number)) {
            alert("Number already exists");
            return;
        }

        contacts.push({ name, number });

        saveContacts(contacts);

        emergencyName.value = "";
        emergencyNumber.value = "";

        displayContacts();
    });

    /* ================= SOS FUNCTION ================= */

    function activateSOS() {

        if (!navigator.geolocation) {
            alert("GPS not supported");
            return;
        }

        updateStatus("Getting location...");

        navigator.geolocation.getCurrentPosition(function (pos) {

            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            const mapLink = `https://www.google.com/maps?q=${lat},${lng}`;

            updateStatus("EMERGENCY ACTIVE");

            siren.play().catch(() => {});

            /* SAVE HISTORY */
            const history = getHistory();

            history.unshift({
                date: new Date().toLocaleString(),
                location: mapLink,
                contacts: getContacts().length
            });

            saveHistory(history);

            /* SMS */
         const contacts = getContacts();

const numbers = contacts.map(c => c.number).join(",");

const message =
    `EMERGENCY ALERT!\nMy location: ${mapLink}`;

if (numbers) {

    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {

        window.location.href =
            `sms:${numbers}?body=${encodeURIComponent(message)}`;

    } else {

        console.log(
            "SMS feature works best on mobile devices."
        );
    }
}
            alert("SOS SENT:\n" + mapLink);

        }, function () {
            alert("Unable to get location");
        });
    }

    /* ================= STOP EMERGENCY ================= */

    stopEmergencyButton.addEventListener("click", function () {
        siren.pause();
        siren.currentTime = 0;
        updateStatus("Safe");
    });

    /* ================= SOS BUTTON ================= */

    sosButton.addEventListener("click", activateSOS);

    /* ================= CHECK-IN ================= */

    startCheckInButton.addEventListener("click", function () {

        clearInterval(checkInInterval);

        let time = Number(checkInTime.value) * 60;

        updateStatus("Check-in active");

        checkInInterval = setInterval(function () {

            let m = Math.floor(time / 60);
            let s = time % 60;

            checkInStatus.innerText =
                `${m}:${s < 10 ? "0" : ""}${s}`;

            time--;

            if (time < 0) {
                clearInterval(checkInInterval);

                const safe = confirm("Are you safe?");

                if (safe) {
                    checkInStatus.innerText = "Safe confirmed";
                    updateStatus("Safe");
                } else {
                    activateSOS();
                }
            }

        }, 1000);
    });

    /* ================= INIT ================= */

    displayContacts();

    console.log("Guardian Network Ready");
});