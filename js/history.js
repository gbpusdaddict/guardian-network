document.addEventListener("DOMContentLoaded", function () {

    const historyContainer =
        document.getElementById("historyContainer");

    const clearHistoryButton =
        document.getElementById("clearHistory");

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

                <button class="view-location">
                    View Location
                </button>

                <button class="delete-history">
                    Delete
                </button>
            `;

            div.querySelector(".view-location")
                .addEventListener("click", function () {

                if (item.location) {
                    window.open(item.location, "_blank");
                }

            });

            div.querySelector(".delete-history")
                .addEventListener("click", function () {

                const confirmDelete =
                    confirm("Delete this emergency record?");

                if (!confirmDelete) return;

                history.splice(index, 1);

                localStorage.setItem(
                    "guardianHistory",
                    JSON.stringify(history)
                );

                loadHistory();

            });

            historyContainer.appendChild(div);

        });

    }

    clearHistoryButton.addEventListener("click", function () {

        const confirmDelete =
            confirm("Clear ALL emergency history?");

        if (!confirmDelete) return;

        localStorage.removeItem("guardianHistory");

        loadHistory();

    });

    loadHistory();

});