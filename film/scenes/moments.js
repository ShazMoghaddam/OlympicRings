// Key moments, one row per sentence: the year set big in its colour, a rule, and what
// happened, in black beside it (or under it in narrow frames).
Bezel.scene((root, kit) => {
  const { u, colours, props } = kit;
  const s = kit.stage();
  const wide = kit.shape === "wide";
  const g = kit.grid(12, 8);
  const snap = (x) => 1 - Math.pow(1 - x, 5);
  const full = g.cell(0, 0, 12, 8);

  const head = kit.text(root, props.heading, { x: g.x(0), y: g.y(0), size: wide ? 5.6 : 5.2, font: "heading", colour: colours.text, maxWidth: full.width,
    style: { letterSpacing: "-0.045em", lineHeight: "0.95" } });
  const top = g.y(1.3), rowH = (full.y + full.height - top) / props.items.length;
  const yearW = g.cell(0, 0, wide ? 3.4 : 4.4).width;
  const rows = props.items.map((item, i) => {
    const y = top + i * rowH;
    const rule = kit.svg("rect", { x: full.x, y, width: 0, height: u * 0.2, fill: colours.text }, s);
    const year = kit.text(root, item.year, { x: full.x, y: y + u * 1.4, size: item.year.length > 5 ? 6.6 : 8.6, font: "heading", colour: item.colour, fit: false,
      style: { letterSpacing: "-0.05em", lineHeight: "0.9" } });
    const what = kit.text(root, item.what, { x: full.x + yearW + u * 2, y: y + u * 2, size: wide ? 3.7 : 4.3, weight: 600, colour: colours.text, maxWidth: full.width - yearW - u * 2 });
    return { rule, year, what, at: Math.max(0.4 + i * 0.6, kit.at(i + (props.from ?? 0)) + 0.15) };
  });

  return (t) => {
    head.style.clipPath = `inset(-30% ${(1 - kit.progress(t, 0.05, 0.4, snap)) * 105 - 5}% -30% -5%)`;
    for (const r of rows) {
      r.rule.setAttribute("width", String(full.width * kit.progress(t, r.at, 0.35, snap)));
      const y = kit.progress(t, r.at + 0.05, 0.35, snap);
      r.year.style.clipPath = `inset(${(1 - y) * 130 - 30}% -5% -30% -5%)`;
      r.year.style.translate = `0 ${(1 - y) * u * 3}px`;
      r.what.style.clipPath = `inset(-30% ${(1 - kit.progress(t, r.at + 0.3, 0.4, snap)) * 105 - 5}% -30% -5%)`;
    }
  };
});
