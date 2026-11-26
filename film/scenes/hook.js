// Two numbers, 128 years apart. A rule drops down each column, the year and city set in
// small type, then the number counts up. Paris is the red one.
Bezel.scene((root, kit) => {
  const { u, colours, props } = kit;
  const s = kit.stage();
  const wide = kit.shape === "wide";
  const g = kit.grid(12, 8);
  const snap = (x) => 1 - Math.pow(1 - x, 5);
  const fmt = (n) => Math.round(n).toLocaleString("en-GB");

  const cols = props.items.map((item, i) => {
    const cell = wide ? g.cell(i * 6, 0, 6, 7) : g.cell(0, i * 3.5, 12, 3.5);
    const colour = i === props.items.length - 1 ? props.accent || colours.accent : colours.text;
    const rule = kit.svg("rect", { x: cell.x, y: cell.y, width: u * 0.35, height: 0, fill: colours.text }, s);
    const when = kit.text(root, item.when, { x: cell.x + u * 2.4, y: cell.y + u * 0.6, size: 3.6, weight: 700, colour: colours.text });
    const number = kit.text(root, "0", { x: cell.x + u * 2, y: cell.y + u * (wide ? 7 : 5.8), size: wide ? 19 : 21, font: "heading", colour, fit: false,
      style: { letterSpacing: "-0.06em", lineHeight: "0.85", fontVariantNumeric: "tabular-nums" } });
    const label = kit.text(root, item.label, { x: cell.x + u * 2.4, y: cell.y + u * (wide ? 25 : 25), size: 3.6, weight: 600, colour: colours.muted });
    return { item, cell, rule, when, number, label, at: Math.max(0.15 + i * 0.6, kit.at(i) + 0.2) };
  });
  const source = kit.text(root, props.source, { x: g.x(0), y: g.y(7) + u * 2.5, size: 2.6, colour: colours.muted });

  return (t) => {
    for (const c of cols) {
      c.rule.setAttribute("height", String(c.cell.height * kit.progress(t, c.at, 0.35, snap)));
      c.when.style.clipPath = `inset(-30% ${(1 - kit.progress(t, c.at + 0.05, 0.3, snap)) * 105 - 5}% -30% -5%)`;
      c.number.textContent = fmt(c.item.value * kit.progress(t, c.at + 0.15, 0.9, snap));
      c.number.style.opacity = t >= c.at + 0.15 ? "1" : "0";
      c.label.style.clipPath = `inset(-30% ${(1 - kit.progress(t, c.at + 0.5, 0.3, snap)) * 105 - 5}% -30% -5%)`;
    }
    source.style.opacity = String(kit.progress(t, cols[1].at + 0.8, 0.3));
  };
});
