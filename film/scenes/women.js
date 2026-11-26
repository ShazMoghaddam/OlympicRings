// Women's share of athletes, one column per year, each on its own sentence. A bar under
// each number fills to its share of half (the line that means equal). Paris is red.
Bezel.scene((root, kit) => {
  const { u, colours, props } = kit;
  const s = kit.stage();
  const wide = kit.shape === "wide";
  const g = kit.grid(12, 8);
  const snap = (x) => 1 - Math.pow(1 - x, 5);
  const n = props.items.length;

  const head = kit.text(root, props.heading, { x: g.x(0), y: g.y(0), size: wide ? 5.6 : 5.2, font: "heading", colour: colours.text, maxWidth: g.cell(0, 0, 12).width,
    style: { letterSpacing: "-0.045em", lineHeight: "0.95" } });
  const cols = props.items.map((item, i) => {
    const cell = wide ? g.cell(i * (12 / n), 2, 12 / n, 6) : g.cell((i % 2) * 6, 2 + Math.floor(i / 2) * 3, 6, 3);
    const colour = i === n - 1 ? props.accent || colours.accent : colours.text;
    const rule = kit.svg("rect", { x: cell.x, y: cell.y, width: u * 0.3, height: 0, fill: colours.text }, s);
    const year = kit.text(root, String(item.year), { x: cell.x + u * 2, y: cell.y + u * 0.4, size: 3.4, weight: 700, colour: colours.text });
    const number = kit.text(root, "0%", { x: cell.x + u * 1.8, y: cell.y + u * 5, size: wide ? 11 : 13, font: "heading", colour, fit: false,
      style: { letterSpacing: "-0.06em", lineHeight: "0.85", fontVariantNumeric: "tabular-nums" } });
    const track = cell.width - u * 4;
    const bar = kit.svg("rect", { x: cell.x + u * 2, y: cell.y + u * (wide ? 18 : 19.5), width: 0, height: u * 0.9, fill: colour }, s);
    return { item, cell, rule, year, number, track, bar, at: Math.max(0.5 + i * 0.6, kit.at(i) + 0.2) };
  });

  return (t) => {
    head.style.clipPath = `inset(-30% ${(1 - kit.progress(t, 0.05, 0.4, snap)) * 105 - 5}% -30% -5%)`;
    for (const c of cols) {
      c.rule.setAttribute("height", String(c.cell.height * 0.9 * kit.progress(t, c.at, 0.35, snap)));
      c.year.style.clipPath = `inset(-30% ${(1 - kit.progress(t, c.at + 0.05, 0.3, snap)) * 105 - 5}% -30% -5%)`;
      const k = kit.progress(t, c.at + 0.15, 0.7, snap);
      const v = c.item.value * k;
      c.number.textContent = (c.item.value % 1 ? v.toFixed(1) : Math.round(v)) + "%";
      c.number.style.opacity = t >= c.at + 0.15 ? "1" : "0";
      c.bar.setAttribute("width", String(c.track * (c.item.value / 50) * k));
    }
  };
});
