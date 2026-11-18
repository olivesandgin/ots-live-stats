function visibleText(value) {
    return value.replace(/<[^>]*>/g, "").replace(/&nbsp;|&#160;|&#xA0;/gi, " ")
        .replace(/[\u00a0\u202f]/g, " ").replace(/&minus;|&#8722;|\u2212/g, "-").trim()
}

function readMetric(html, group, label, format) {
    const pair = new RegExp(
        '<div\\b[^>]*\\bclass=["\'][^"\']*\\b' + group + '__label\\b[^"\']*["\'][^>]*>' +
        '\\s*' + label + '\\s*:\\s*</div>\\s*<div\\b[^>]*\\bclass=["\'][^"\']*\\b' +
        group + '__value\\b[^"\']*["\'][^>]*>([\\s\\S]*?)</div>', "gi"
    )
    const rows = [...html.matchAll(pair)]
    if (rows.length !== 1) throw new Error("Missing or ambiguous " + label)
    const match = visibleText(rows[0][1]).match(format)
    if (!match) throw new Error("Unexpected format for " + label)
    const value = Number(match[1].replace(/[, ]/g, ""))
    if (!Number.isFinite(value)) throw new Error("Invalid " + label)
    return value
}

export function parseSignal(html) {
    const canonical = (html.match(/<link\b[^>]*>/gi) || []).some(tag =>
        /\brel=["']canonical["']/i.test(tag) && /\bhref=["']https:\/\/www\.mql5\.com\/en\/signals\/2397535\/?["']/i.test(tag))
    if (!canonical || !/\bhref=["']\/en\/users\/olivesandgin(?:\/seller)?["']/i.test(html)) {
        throw new Error("Unexpected MQL5 signal identity")
    }
    const number = "(?:\\d{1,3}(?:[, ]\\d{3})+|\\d+)(?:\\.\\d+)?"
    const growthPct = readMetric(html, "s-list-info", "Growth", new RegExp("^([+-]?" + number + ")\\s*%$"))
    const equityDrawdownPct = readMetric(html, "s-data-columns", "By Equity", new RegExp("^(" + number + ")\\s*%(?:\\s*\\([^()]+\\))?$"))
    const trades = readMetric(html, "s-data-columns", "Trades", /^((?:\d{1,3}(?:[, ]\d{3})+|\d+))$/)
    const profitFactor = readMetric(html, "s-data-columns", "Profit Factor", new RegExp("^(" + number + ")$"))
    if (!Number.isSafeInteger(trades)) throw new Error("Invalid trade count")
    return { growthPct, equityDrawdownPct, trades, profitFactor }
}
