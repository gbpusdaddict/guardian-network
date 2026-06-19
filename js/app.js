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

    function updateStatus(message) {
        if (statusText) {
            statusText.textContent = message;
        }
    }

    function getContacts() {
        return JSON.parse(localStorage.getItem("guardianContacts")) || [];
    }

    function saveContacts(contacts) {
        localStorage.setItem(
            "guardianContacts",
            JSON.stringify(contacts)
        );
    }

    function getHistory() {
        return JSON.parse(localStorage.getItem("guardianHistory")) || [];
    }

    function saveHistory(history) {
        localStorage.setItem(
            "guardianHistory",
            JSON.stringify(history)
        );
    }

    /* ================= CONTACTS ================= */

    function displayContacts() {

        const contacts = getContacts();

        if (!contactList) return;

        contactList.innerHTML = "";

        if (contacts.length === 0) {
            contactList.innerHTML =
                "<li>No contacts saved.</li>";
            return;
        }

        contacts.forEach((contact, index) => {

            const li = document.createElement("li");

            li.innerHTML = `
                <strong>${contact.name}</strong>
                (${contact.number})
                <button class="delete-contact">
                    Delete
                </button>
            `;

            li.querySelector(".delete-contact")
                .addEventListener("click", function () {

                    contacts.splice(index, 1);

                    saveContacts(contacts);

                    displayContacts();

                    updateStatus("Contact deleted.");
                });

            contactList.appendChild(li);
        });
    }

    if (saveButton) {

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
                alert("Maximum of 5 contacts allowed.");
                return;
            }

            if (
                contacts.some(
                    contact => contact.number === number
                )
            ) {
                alert("Number already exists.");
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

    }

    /* ================= SOS ================= */

    function activateSOS() {

        const contacts = getContacts();

        if (contacts.length === 0) {
            alert("Please add at least one emergency contact.");
            return;
        }

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

                updateStatus("🚨 EMERGENCY ACTIVE");

                if (siren) {
                    siren.play().catch(() => {});
                }

                const contactsSentTo = contacts.map(contact => ({
                    name: contact.name,
                    number: contact.number
                }));

                const history = getHistory();

                history.unshift({
                    type: "SOS",
                    date: new Date().toLocaleString(),
                    location: mapLink,
                    latitude: lat,
                    longitude: lng,
                    contactsSentTo: contactsSentTo
                });

                if (history.length > 100) {
                    history.pop();
                }

                saveHistory(history);

                const numbers =
                    contacts.map(c => c.number).join(",");

                const firstNumber =
                    contacts[0].number;

                const message =
`🚨 EMERGENCY ALERT 🚨

I need help immediately.

My location:
${mapLink}`;

                if (
                    /Android|iPhone|iPad|iPod/i.test(
                        navigator.userAgent
                    )
                ) {

                    window.location.href =
                        `sms:${numbers}?body=${encodeURIComponent(message)}`;
                }

                setTimeout(() => {
                    window.location.href =
                        `tel:${firstNumber}`;
                }, 2000);

                window.open(mapLink, "_blank");

                alert("SOS ACTIVATED");
            },

            function (error) {

                console.log(error);

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

    /* ================= CHECK-IN ================= */

    if (startCheckInButton) {

        startCheckInButton.addEventListener("click", function () {

            clearInterval(checkInInterval);

            const minutes = Number(checkInTime.value);

            if (!minutes || minutes <= 0) {
                alert("Select a valid time.");
                return;
            }

            let timeLeft = minutes * 60;

            updateStatus("Safety Check-In Active");

            checkInInterval = setInterval(function () {

                const mins =
                    Math.floor(timeLeft / 60);

                const secs =
                    timeLeft % 60;

                if (checkInStatus) {
                    checkInStatus.textContent =
                        `${mins}:${String(secs).padStart(2, "0")}`;
                }

                timeLeft--;

                if (timeLeft < 0) {

                    clearInterval(checkInInterval);

                    const safe =
                        confirm("Are you safe?");

                    if (safe) {

                        updateStatus("User confirmed safe.");

                        if (checkInStatus) {
                            checkInStatus.textContent =
                                "Safety confirmed.";
                        }

                    } else {

                        activateSOS();

                    }
                }

            }, 1000);
        });

    }

    /* ================= STOP EMERGENCY ================= */

    if (stopEmergencyButton) {

        stopEmergencyButton.addEventListener(
            "click",
            function () {

                if (siren) {
                    siren.pause();
                    siren.currentTime = 0;
                }

                updateStatus("Emergency stopped.");
            }
        );
    }

    /* ================= BUTTONS ================= */

    if (sosButton) {
        sosButton.addEventListener("click", activateSOS);
    }

    /* ================= INIT ================= */

    displayContacts();

    console.log("Guardian Network Ready");

});