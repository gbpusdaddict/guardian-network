document.addEventListener("DOMContentLoaded", function () {

    const historyContainer =
        document.getElementById("historyContainer");

    const clearHistoryButton =
        document.getElementById("clearHistory");

    /* ================= LOAD HISTORY ================= */

    function loadHistory() {

        const history =
            JSON.parse(localStorage.getItem("guardianHistory")) || [];

        historyContainer.innerHTML = "";

        if (history.length === 0) {

            historyContainer.innerHTML =
                "<p>No emergency history yet.</p>";

            return;
        }

        history.forEach((item, index) => {

            const div = document.createElement("div");
            div.className = "history-item";

            div.innerHTML = `
                <p><strong>${item.date}</strong></p>
                <p>Contacts Sent: ${item.contacts}</p>
                <button class="view">View Location</button>
            `;

            div.querySelector(".view").addEventListener("click", function () {
                window.open(item.location, "_blank");
            });

            historyContainer.appendChild(div);
        });
    }

    /* ================= CLEAR HISTORY ================= */

    clearHistoryButton.addEventListener("click", function () {

        const confirmDelete = confirm("Clear all emergency history?");

        if (!confirmDelete) return;

        localStorage.removeItem("guardianHistory");

        loadHistory();
    });

    /* ================= INIT ================= */

    loadHistory();

    console.log("History page loaded");
});