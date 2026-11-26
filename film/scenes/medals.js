// The all-time medal table: one bar per team, on its sentence, with how many Games each
// took part in. One bar, the one the story is about, in colour.
Bezel.scene((root, kit) => {
  const { u, colours, props } = kit;
  const s = kit.stage();
  const wide = kit.shape === "wide";
  const g = kit.grid(12, 8);
  const snap = (x) => 1 - Math.pow(1 - x, 5);
  const full = g.cell(0, 0, 12, 8);
  const fmt = (n) => Math.round(n).toLocaleString("en-GB");

  const head = kit.text(root, props.heading, { x: g.x(0), y: g.y(0), size: wide ? 5.6 : 5.2, font: "heading", colour: colours.text, maxWidth: full.width,
    style: { letterSpacing: "-0.045em", lineHeight: "0.95" } });
  const top = g.y(1.4), rowH = Math.min((full.y + full.height - top - u * 10) / props.rows.length, u * 15);
  const max = Math.max(...props.rows.map((r) => r.value));
  const barMax = full.width - u * 22;
  const rows = props.rows.map((r, i) => {
    const y = top + i * rowH;
    const name = kit.text(root, r.name, { x: full.x, y, size: 3.7, weight: 700, colour: colours.text });
    const games = kit.text(root, r.games, { x: full.x + full.width, y: y + u * 0.3, size: 3, weight: 500, align: "right", colour: colours.muted, fit: false });
    const bar = kit.svg("rect", { x: full.x, y: y + u * 5.2, width: 0, height: u * 3.4, fill: r.colour || colours.text }, s);
    const num = kit.text(root, "0", { x: full.x, y: y + u * 4.6, size: 4.4, font: "heading", colour: colours.text, fit: false, style: { fontVariantNumeric: "tabular-nums" } });
    return { r, name, games, bar, num, w: (barMax * r.value) / max, at: Math.max(0.5 + i * 0.6, kit.at(i + (props.from ?? 0)) + 0.15) };
  });
  const note = kit.text(root, props.note, { x: full.x, y: top + rowH * props.rows.length + u * 1.5, size: 3.4, weight: 600, colour: colours.muted, maxWidth: full.width });
  const source = kit.text(root, props.source, { x: full.x, y: note.getBoundingClientRect().bottom - root.getBoundingClientRect().top + u * 1.5, size: 2.6, colour: colours.muted, maxWidth: full.width });

  return (t) => {
    head.style.clipPath = `inset(-30% ${(1 - kit.progress(t, 0.05, 0.4, snap)) * 105 - 5}% -30% -5%)`;
    for (const it of rows) {
      it.name.style.clipPath = `inset(-30% ${(1 - kit.progress(t, it.at, 0.3, snap)) * 105 - 5}% -30% -5%)`;
      it.games.style.opacity = String(kit.progress(t, it.at + 0.2, 0.3));
      const k = kit.progress(t, it.at + 0.1, 0.7, snap);
      it.bar.setAttribute("width", String(it.w * k));
      it.num.textContent = fmt(it.r.value * k);
      it.num.style.left = full.x + it.w * k + u * 1.6 + "px";
      it.num.style.opacity = t >= it.at + 0.1 ? "1" : "0";
    }
    const n = Math.max(rows[rows.length - 1].at + 1, kit.at(props.noteAt ?? 0));
    note.style.clipPath = `inset(-30% ${(1 - kit.progress(t, n, 0.45, snap)) * 105 - 5}% -30% -5%)`;
    source.style.opacity = String(kit.progress(t, n + 0.5, 0.3));
  };
});
