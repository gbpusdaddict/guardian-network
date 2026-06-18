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
    const customCheckIn = document.getElementById("customCheckIn");
    const checkInStatus = document.getElementById("checkInStatus");

    let checkInInterval = null;

    /* ================= HELPERS ================= */

    function updateStatus(message) {
        statusText.textContent = message;
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

    /* ================= CONTACTS ================= */

    function displayContacts() {

        const contacts = getContacts();

        contactList.innerHTML = "";

        if (contacts.length === 0) {
            contactList.innerHTML = "<li>No contacts saved.</li>";
            return;
        }

        contacts.forEach((contact, index) => {

            const li = document.createElement("li");

            li.innerHTML = `
                <strong>${contact.name}</strong> (${contact.number})
                <button class="delete-contact">Delete</button>
            `;

            li.querySelector(".delete-contact").addEventListener("click", function () {

                contacts.splice(index, 1);

                saveContacts(contacts);
                displayContacts();

            });

            contactList.appendChild(li);

        });
    }

    saveButton.addEventListener("click", function () {

        const name = emergencyName.value.trim();
        const number = emergencyNumber.value.trim();

        if (!name || !number) {
            alert("Enter contact name and number.");
            return;
        }

        if (!/^\d{11}$/.test(number)) {
            alert("Phone number must be exactly 11 digits.");
            return;
        }

        const contacts = getContacts();

        if (contacts.length >= 5) {
            alert("Maximum of 5 emergency contacts allowed.");
            return;
        }

        if (contacts.some(contact => contact.number === number)) {
            alert("This number already exists.");
            return;
        }

        contacts.push({
            name,
            number
        });

        saveContacts(contacts);

        emergencyName.value = "";
        emergencyNumber.value = "";

        displayContacts();

        updateStatus("Contact saved successfully.");
    });

    /* ================= SOS ================= */

    function activateSOS() {

        if (!navigator.geolocation) {
            alert("GPS is not supported on this device.");
            return;
        }

        updateStatus("Getting location...");

        navigator.geolocation.getCurrentPosition(

            function (position) {

                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                const mapLink =
                    `https://www.google.com/maps?q=${lat},${lng}`;

                updateStatus("Emergency Active");

                if (siren) {
                    siren.play().catch(() => {});
                }

                const history = getHistory();

                history.unshift({
                    date: new Date().toLocaleString(),
                    latitude: lat,
                    longitude: lng,
                    location: mapLink
                });

                saveHistory(history);

                const contacts = getContacts();

                if (contacts.length > 0) {

                    const numbers = contacts
                        .map(contact => contact.number)
                        .join(",");

                    const message =
                        `EMERGENCY ALERT! My location: ${mapLink}`;

                    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {

                        window.location.href =
                            `sms:${numbers}?body=${encodeURIComponent(message)}`;

                    }

                }

                window.open(mapLink, "_blank");

                alert("SOS Activated Successfully");

            },

            function (error) {

                console.error(error);

                switch (error.code) {

                    case 1:
                        alert("Location permission denied.");
                        break;

                    case 2:
                        alert("Location unavailable.");
                        break;

                    case 3:
                        alert("Location request timed out.");
                        break;

                    default:
                        alert("Unable to get location.");

                }

                updateStatus("Location failed.");

            },

            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }

        );

    }

    sosButton.addEventListener("click", activateSOS);

    stopEmergencyButton.addEventListener("click", function () {

        if (siren) {
            siren.pause();
            siren.currentTime = 0;
        }

        updateStatus("Safe");

    });

    /* ================= CHECK-IN ================= */

    startCheckInButton.addEventListener("click", function () {

        clearInterval(checkInInterval);

        let minutes;

        if (customCheckIn && customCheckIn.value.trim() !== "") {
            minutes = Number(customCheckIn.value);
        } else {
            minutes = Number(checkInTime.value);
        }

        if (!minutes || minutes <= 0) {
            alert("Enter a valid check-in time.");
            return;
        }

        let timeLeft = minutes * 60;

        updateStatus("Check-in active");

        checkInInterval = setInterval(function () {

            const mins = Math.floor(timeLeft / 60);
            const secs = timeLeft % 60;

            checkInStatus.textContent =
                `${mins}:${String(secs).padStart(2, "0")}`;

            timeLeft--;

            if (timeLeft < 0) {

                clearInterval(checkInInterval);

                const safe = confirm("Are you safe?");

                if (safe) {

                    updateStatus("Safe");
                    checkInStatus.textContent =
                        "Safety confirmed.";

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