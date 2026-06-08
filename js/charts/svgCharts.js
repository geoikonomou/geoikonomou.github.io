export function renderChartPlaceholders() {
    const chartA = document.getElementById("chart-a");
    const chartB = document.getElementById("chart-b");

    if (chartA) chartA.textContent = "Graph A placeholder";
    if (chartB) chartB.textContent = "Graph B placeholder";
}