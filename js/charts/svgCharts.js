import { formatBytes } from "../format.js";

// js piscine = 777
//  module 200
// piscine go 123
/// isBonus
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
    const pad = { top: 18, right: 18, bottom: 36, left: 60 };
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
        const txt = svgEl("text", { x: pad.left - 10, y: y + 4, "text-anchor": "end", fill: "#374151", "font-size": "11" });
        txt.textContent = formatBytes(v);
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

function buildXpSourceBuckets(transactions) {
    return transactions.reduce(
        (acc, tx) => {
            const amount = Number(tx?.amount) || 0;
            if (amount <= 0) return acc;

            if (tx?.isBonus) {
                acc.bonus += amount;
                return acc;
            }

            const eventCode = Number(tx?.event?.id);
            if (eventCode === 777) {
                acc.jsPiscine += amount;
            } else if (eventCode === 123) {
                acc.goPiscine += amount;
            } else {
                acc.module += amount;
            }

            return acc;
        },
        { jsPiscine: 0, goPiscine: 0, module: 0, bonus: 0 }
    );
}

function renderXpSourcePie(container, transactions) {
    if (!transactions || transactions.length === 0) {
        renderEmpty(container, "No XP source data yet.");
        return;
    }

    const buckets = buildXpSourceBuckets(transactions);
    const slices = [
        { label: "JS Piscine", value: buckets.jsPiscine, color: "#0ea5a3" },
        { label: "Go Piscine", value: buckets.goPiscine, color: "#1d4ed8" },
        { label: "Module", value: buckets.module, color: "#64748b" },
        { label: "Bonus", value: buckets.bonus, color: "#f59e0b" }
    ].filter((slice) => slice.value > 0);

    const total = slices.reduce((sum, s) => sum + s.value, 0);
    if (total <= 0) {
        renderEmpty(container, "No XP source data yet.");
        return;
    }

    clearNode(container);

    const width = 520;
    const height = 330;
    const cx = 150;
    const cy = 165;
    const r = 120;

    const svg = svgEl("svg", {
        viewBox: `0 0 ${width} ${height}`,
        width: "100%",
        height: "100%",
        role: "img",
        "aria-label": "XP source distribution pie chart"
    });

    let currentAngle = 0;
    slices.forEach((slice) => {
        const angle = (slice.value / total) * 360;
        const start = polarToCartesian(cx, cy, r, currentAngle);
        const end = polarToCartesian(cx, cy, r, currentAngle + angle);
        const largeArc = angle > 180 ? 1 : 0;

        const d = [
            `M ${cx} ${cy}`,
            `L ${start.x} ${start.y}`,
            `A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`,
            "Z"
        ].join(" ");

        svg.appendChild(
            svgEl("path", {
                d,
                fill: slice.color,
                stroke: "#ffffff",
                "stroke-width": 1
            })
        );

        currentAngle += angle;
    });

    const totalLabel = svgEl("text", {
        x: 328,
        y: 54,
        fill: "#111827",
        "font-size": "14",
        "font-weight": "600"
    });
    totalLabel.textContent = "Total XP:";
    svg.appendChild(totalLabel);

    const totalValue = svgEl("text", {
        x: 398,
        y: 54,
        fill: "#374151",
        "font-size": "14"
    });
    totalValue.textContent = formatBytes(total);
    svg.appendChild(totalValue);

    slices.forEach((slice, i) => {
        const y = 94 + i * 48;
        const percent = ((slice.value / total) * 100).toFixed(1);

        svg.appendChild(svgEl("rect", { x: 306, y: y - 12, width: 14, height: 14, fill: slice.color, rx: 2 }));

        const label = svgEl("text", { x: 328, y, fill: "#111827", "font-size": "14" });
        label.textContent = `${slice.label}: ${percent}%`;
        svg.appendChild(label);

        const amount = svgEl("text", { x: 328, y: y + 18, fill: "#4b5563", "font-size": "13" });
        amount.textContent = formatBytes(slice.value);
        svg.appendChild(amount);
    });

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

function buildCollaborationData(audits, selfLogin) {
    const counts = new Map();
    const seenGroupIds = new Set();

    (audits || []).forEach((entry) => {
        const group = entry?.group;
        if (!group) return;

        const groupId = group?.id;
        if (groupId != null) {
            if (seenGroupIds.has(groupId)) return;
            seenGroupIds.add(groupId);
        }

        const members = Array.isArray(group.members) ? group.members : [];
        const memberLogins = Array.from(
            new Set(members.map((m) => m?.userLogin).filter(Boolean))
        );

        if (selfLogin && !memberLogins.includes(selfLogin)) return;

        memberLogins.forEach((login) => {
            if (login === selfLogin) return;
            counts.set(login, (counts.get(login) || 0) + 1);
        });
    });

    return Array.from(counts.entries())
        .map(([login, count]) => ({ login, count }))
        .sort((a, b) => b.count - a.count || a.login.localeCompare(b.login));
}

function renderCollaborationBars(container, audits, selfLogin) {
    const data = buildCollaborationData(audits, selfLogin).slice(0, 10);

    if (data.length === 0) {
        renderEmpty(container, "No group collaboration data yet.");
        return;
    }

    clearNode(container);

    const width = 620;
    const height = 280;
    const pad = { top: 22, right: 30, bottom: 26, left: 65 };
    const innerW = width - pad.left - pad.right;
    const innerH = height - pad.top - pad.bottom;
    const rowH = innerH / data.length;
    const barH = Math.max(10, rowH * 0.58);
    const maxCount = Math.max(...data.map((d) => d.count), 1);

    const svg = svgEl("svg", {
        viewBox: `0 0 ${width} ${height}`,
        width: "100%",
        height: "100%",
        role: "img",
        "aria-label": "Grouped with each teammate bar chart"
    });

    data.forEach((d, i) => {
        const y = pad.top + i * rowH + (rowH - barH) / 2;
        const barW = (d.count / maxCount) * innerW;

        svg.appendChild(
            svgEl("rect", {
                x: pad.left,
                y,
                width: innerW,
                height: barH,
                fill: "#f1f5f9",
                rx: 4
            })
        );

        svg.appendChild(
            svgEl("rect", {
                x: pad.left,
                y,
                width: barW,
                height: barH,
                fill: "#0b6e4f",
                rx: 4
            })
        );

        const label = svgEl("text", {
            x: pad.left - 8,
            y: y + barH * 0.72,
            "text-anchor": "end",
            fill: "#1f2937",
            "font-size": "11"
        });
        label.textContent = d.login;
        svg.appendChild(label);

        const value = svgEl("text", {
            x: pad.left + barW + 6,
            y: y + barH * 0.72,
            fill: "#111827",
            "font-size": "11",
            "font-weight": "600"
        });
        value.textContent = String(d.count);
        svg.appendChild(value);
    });

    const axis = svgEl("line", {
        x1: pad.left,
        y1: pad.top - 4,
        x2: pad.left,
        y2: height - pad.bottom + 2,
        stroke: "#94a3b8"
    });
    svg.appendChild(axis);

    container.appendChild(svg);
}

export function renderCharts(profileData) {
    const chartA = document.getElementById("chart-a");
    const chartC = document.getElementById("chart-c");
    const chartD = document.getElementById("chart-d");

    if (!chartA || !chartC || !chartD) return;

    const tx = profileData?.xp_transactions || [];
    const audits = profileData?.audit || [];
    const selfLogin = profileData?.user?.[0]?.login || "";

    renderXpLineChart(chartA, tx);
    renderXpSourcePie(chartC, tx);
    renderCollaborationBars(chartD, audits, selfLogin);
}

export function renderChartPlaceholders() {
    const chartA = document.getElementById("chart-a");
    const chartC = document.getElementById("chart-c");
    const chartD = document.getElementById("chart-d");

    if (chartA) chartA.textContent = "Graph A loading...";
    if (chartC) chartC.textContent = "Graph C loading...";
    if (chartD) chartD.textContent = "Graph D loading...";
}