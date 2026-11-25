
const cpuHistory = [];
const memoryHistory = [];
const labels = [];

let resourceChart;

function initializeChart() {
    const ctx = document.getElementById("resourceChart");

    resourceChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "CPU Usage",
                    data: cpuHistory,
                    borderColor: "#38bdf8",
                    backgroundColor: "rgba(56, 189, 248, 0.1)",
                    tension: 0.4,
                    fill: true
                },
                {
                    label: "Memory Usage",
                    data: memoryHistory,
                    borderColor: "#a78bfa",
                    backgroundColor: "rgba(167, 139, 250, 0.1)",
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    ticks: {
                        color: "#94a3b8",
                        callback: value => value + "%"
                    },
                    grid: {
                        color: "#263247"
                    }
                },
                x: {
                    ticks: { color: "#94a3b8" },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: {
                    labels: { color: "#e2e8f0" }
                }
            }
        }
    });
}

function addActivity(message) {
    const activityList = document.getElementById("activity-list");
    const item = document.createElement("p");

    item.className = "activity-item";
    item.textContent = `${new Date().toLocaleTimeString()} - ${message}`;

    activityList.prepend(item);

    while (activityList.children.length > 8) {
        activityList.lastElementChild.remove();
    }
}

async function updateHealth() {
    try {
        const response = await fetch("/health");

        if (!response.ok) {
            throw new Error("Health check failed");
        }

        const data = await response.json();

        document.getElementById("app-status").textContent = "Operational";
        document.getElementById("flask-health").textContent = "Healthy";
        document.getElementById("api-health").textContent = "Healthy";

        document.getElementById("version-value").textContent = data.version;
        document.getElementById("deployment-version").textContent = data.version;

    } catch (error) {
        document.getElementById("app-status").textContent = "Unavailable";
        document.getElementById("flask-health").textContent = "Offline";
        document.getElementById("api-health").textContent = "Offline";

        addActivity("Application health check failed");
    }
}

async function updateMetrics() {
    try {
        const response = await fetch("/api/metrics");

        if (!response.ok) {
            throw new Error("Metrics request failed");
        }

        const data = await response.json();

        document.getElementById("cpu-value").textContent =
            data.cpu_usage + "%";

        document.getElementById("memory-value").textContent =
            data.memory_usage + "%";

        const seconds = Math.floor(data.uptime_seconds);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        document.getElementById("uptime-value").textContent =
            `${hours}h ${minutes % 60}m ${seconds % 60}s`;

        labels.push(new Date().toLocaleTimeString());

        cpuHistory.push(data.cpu_usage);
        memoryHistory.push(data.memory_usage);

        if (labels.length > 15) {
            labels.shift();
            cpuHistory.shift();
            memoryHistory.shift();
        }

        if (resourceChart) {
            resourceChart.update();
        }

    } catch (error) {
        addActivity("Unable to retrieve system metrics");
    }
}

async function updateStatus() {
    try {
        const response = await fetch("/api/status");

        if (!response.ok) {
            throw new Error("Status request failed");
        }

        const data = await response.json();

        document.getElementById("app-status").textContent =
            data.status === "running" ? "Operational" : "Unavailable";

    } catch (error) {
        console.error("Status check failed:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initializeChart();

    updateHealth();
    updateMetrics();
    updateStatus();

    addActivity("Monitoring dashboard initialized");

    setInterval(updateMetrics, 3000);
    setInterval(updateHealth, 10000);
    setInterval(updateStatus, 10000);
});
