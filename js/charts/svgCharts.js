function clearNode(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
}

function svgEl(tag, attrs = {}) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, String(value)));
    return el;
}

function formatDateLabel(isoDate) {
    const d = new Date(isoDate);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric"});
}

function renderEmpty(container, message) {
    clearNode(container);
    container.textContent = message;
}

function renderXpLineChart(container, transactions) {
    if (!transactions || transactions.length === 0 ) {
        renderEmpty(container, "No XP data yet.");
        return;
    }

    clearNode(container);

    const width = 720;
    const height = 260;
    const pad = { top: 18, right: 18, bottom: 36, left: 32 };
    const innerW = width - pad.left - pad.right;
    const innerH = height - pad.top - pad.bottom;

    let running = 0;
    const points = transactions.map((t) => {
        running += Number(t.amount) || 0;
        return { createdAt: t.createdAt, cumulative: running };
    });

    const minY = 0;
    const maxY = Math.max(...points.map((p) => p.cumulative), 1);

    const xFor = (i) => pad.left + (i / Math.max(points.length - 1, 1)) * innerW;
    const yFor = (v) => pad.top + (1 - (v - minY) / (maxY - minY)) * innerH;

    const svg = svgEl("svg", {
        viewBox: `0 0 ${width} ${height}`,
        width: "100%",
        height: "100%",
        role: "img",
        "aria-label": "Cumulative XP over time"
    });

    const bg = svgEl("rect", { x: 0, y: 0, width, height, fill: "#fff" });
    svg.appendChild(bg);

    const axisColor = "#6b7280";
    svg.appendChild(svgEl("line", { x1: pad.left, y1: pad.top, x2: pad.left, y2: height - pad.bottom, stroke: axisColor }));
    svg.appendChild(svgEl("line", { x1: pad.left, y1: height - pad.bottom, x2: width - pad.right, y2: height - pad.bottom, stroke: axisColor }));

    const ticks = 4;
    for (let i = 0; i <= ticks; i +=1) {
        const v = minY + (i/ticks) * (maxY -minY);
        const y = yFor(v);
        svg.appendChild(svgEl("line", { x1: pad.left, y1: y, x2: width - pad.right, y2: y, stroke: "#e5e7eb" }));
        const txt = svgEl("text", { x: pad.left - 8, y: y + 4, "text-anchor": "end", fill: "#374151", "font-size": "11" });
        txt.textContent = Math.round(v).toString();
        svg.appendChild(txt);
    }

    const pathData = points
    .map((p,i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(p.cumulative)}`)
    .join(" ");

    const path = svgEl("path", {
        d: pathData,
        fill: "none",
        stroke: "#0b6e4f",
        "stroke-width": 2.5
    });
    svg.appendChild(path);

    const last = points[points.length - 1];
    const dot = svgEl("circle", { cx: xFor(points.length -1), cy: yFor(last.cumulative), r: 4, fill: "#0b6e4f" });
    svg.appendChild(dot);

    const firstDate = formatDateLabel(points[0].createdAt);
    const lastDate = formatDateLabel(last.createdAt);

    const leftLabel = svgEl("text", { x: pad.left, y: height -12, fill: "#374151", "font-size": "11" });
    leftLabel.textContent = firstDate;
    svg.appendChild(leftLabel);
    
    const rightLabel = svgEl("text", { x: width - pad.right, y: height - 12, "text-anchor": "end", fill: "#374151", "font-size": "11" });
    rightLabel.textContent = lastDate;
    svg.appendChild(rightLabel);

    container.appendChild(svg);
}

function polarToCartesian(cx, cy, r, angleDeg) {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function arcPath(cx, cy, r, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function renderPassFailDonut(container, passCount, failCount) {
    const pass = Number(passCount) || 0;
    const fail = Number(failCount) || 0;
    const total = pass + fail;

    if (total <= 0) {
        renderEmpty(container, "No progress data yet.");
        return;
    }

    clearNode(container);

    const width = 420;
    const height = 220;
    const cx = 110;
    const cy = 110;
    const r = 72;

    const passAngle = (pass / total) * 360;

    const svg = svgEl("svg", {
        viewBox: `0 0 ${width} ${height}`,
        width: "100%",
        height: "100%",
        role: "img",
        "aria-label": "Pass fail ratio donut chart"
    });

    svg.appendChild(svgEl("circle", { cx, cy, r, fill: "none", stroke: "#e5e7eb", "stroke-width": 26 }));

    const passArc = svgEl("path", {
        d: arcPath(cx, cy, r, 0, passAngle),
        fill: "none",
        stroke: "#0b6e4f",
        "stroke-width": 26,
        "stroke-linecap": "round"
    });

    const failArc = svgEl("path", {
        d: arcPath(cx, cy, r, passAngle, 360),
        fill: "none",
        stroke: "#b42318",
        "stroke-width": 26,
        "stroke-linecap": "round"
    });

    svg.appendChild(passArc);
    svg.appendChild(failArc);

    const center = svgEl("text", { x: cx, y: cy + 4, "text-anchor": "middle", fill: "#111827", "font-size": "16", "font-weight": "600" });
    center.textContent = `${Math.round((pass / total) * 100)}%`;
    svg.appendChild(center);

    const legend1 = svgEl("text", { x: 230, y: 85, fill: "#0b6e4f", "font-size": "14" });
    legend1.textContent = `Pass: ${pass}`;
    svg.appendChild(legend1);

    const legend2 = svgEl("text", { x: 230, y: 115, fill: "#b42318", "font-size": "14" });
    legend2.textContent = `Fail: ${fail}`;
    svg.appendChild(legend2);

    container.appendChild(svg);
}

export function renderCharts(profileData) {
    const chartA = document.getElementById("chart-a");
    const chartB = document.getElementById("chart-b");

    if (!chartA || !chartB) return;

    const tx = profileData?.xp_transactions || [];
    const passCount = profileData?.progress_pass?.aggregate?.count || 0;
    const failCount = profileData?.progress_fail?.aggregate?.count || 0;

    renderXpLineChart(chartA, tx);
    renderPassFailDonut(chartB, passCount, failCount);
}

export function renderChartPlaceholders() {
    const chartA = document.getElementById("chart-a");
    const chartB = document.getElementById("chart-b");

    if (chartA) chartA.textContent = "Graph A loading...";
    if (chartB) chartB.textContent = "Graph B loading...";
}

