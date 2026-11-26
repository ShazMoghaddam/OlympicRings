// Who has hosted: one row per continent, each on its sentence, with a bar of squares (one
// per Games) and the count. Africa's row has no squares, just a red marker and a zero.
Bezel.scene((root, kit) => {
  const { u, colours, props } = kit;
  const s = kit.stage();
  const wide = kit.shape === "wide";
  const g = kit.grid(12, 8);
  const snap = (x) => 1 - Math.pow(1 - x, 5);
  const rows = props.rows;

  const head = kit.text(root, props.heading, { x: g.x(0), y: g.y(0), size: wide ? 5.6 : 5.2, font: "heading", colour: colours.text, maxWidth: g.cell(0, 0, 12).width,
    style: { letterSpacing: "-0.045em", lineHeight: "0.95" } });
  // The grid's right and bottom edges (g.x(12) would be one gutter past the right edge).
  const full = g.cell(0, 0, 12, 8);
  const right = full.x + full.width, bottom = full.y + full.height;
  const top = g.y(2), rowH = (bottom - top) / rows.length;
  const nameW = g.cell(0, 0, wide ? 2.6 : 3.6).width;
  const sq = Math.min(rowH * 0.42, (g.cell(0, 0, 12).width - nameW - u * 10) / 17.6);
  const items = rows.map((row, i) => {
    const y = top + i * rowH;
    const zero = row.value === 0;
    const rule = kit.svg("rect", { x: g.x(0), y, width: 0, height: u * 0.2, fill: colours.text }, s);
    const name = kit.text(root, row.name, { x: g.x(0), y: y + u * 1.2, size: 3.6, weight: 700, colour: colours.text });
    const squares = Array.from({ length: row.value }, (_, k) => kit.svg("rect", { x: g.x(0) + nameW + k * sq * 1.1, y: y + rowH / 2 - sq / 2 + u * 0.4, width: sq, height: sq, fill: colours.text, opacity: 0 }, s));
    const marker = zero ? kit.svg("rect", { x: g.x(0) + nameW, y: y + rowH / 2 - sq / 2 + u * 0.4, width: sq, height: sq, fill: "none", stroke: props.accent || colours.accent, "stroke-width": u * 0.35, opacity: 0 }, s) : null;
    const count = kit.text(root, String(row.value), { x: right, y: y + u * 0.6, size: wide ? 6 : 5.6, font: "heading", align: "right", colour: zero ? props.accent || colours.accent : colours.text, fit: false,
      style: { letterSpacing: "-0.05em", lineHeight: "0.9" } });
    return { row, rule, name, squares, marker, count, at: Math.max(0.4 + i * 0.5, kit.at(i) + 0.15) };
  });

  return (t) => {
    head.style.clipPath = `inset(-30% ${(1 - kit.progress(t, 0.05, 0.4, snap)) * 105 - 5}% -30% -5%)`;
    for (const it of items) {
      it.rule.setAttribute("width", String(g.cell(0, 0, 12).width * kit.progress(t, it.at, 0.35, snap)));
      it.name.style.clipPath = `inset(-30% ${(1 - kit.progress(t, it.at + 0.05, 0.3, snap)) * 105 - 5}% -30% -5%)`;
      it.squares.forEach((q, k) => q.setAttribute("opacity", t >= it.at + 0.15 + k * 0.035 ? "1" : "0"));
      if (it.marker) it.marker.setAttribute("opacity", String(kit.progress(t, it.at + 0.4, 0.2)));
      it.count.style.clipPath = `inset(${(1 - kit.progress(t, it.at + 0.2, 0.35, snap)) * 130 - 30}% -5% -30% -5%)`;
    }
  };
});
