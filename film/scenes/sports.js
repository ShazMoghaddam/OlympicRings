// The sports: five at every Games, each with a square in one of the five colours, then
// two facts set below a rule.
Bezel.scene((root, kit) => {
  const { u, colours, props } = kit;
  const s = kit.stage();
  const wide = kit.shape === "wide";
  const g = kit.grid(12, 8);
  const snap = (x) => 1 - Math.pow(1 - x, 5);
  const full = g.cell(0, 0, 12, 8);

  const head = kit.text(root, props.heading, { x: g.x(0), y: g.y(0), size: wide ? 5.6 : 5.2, font: "heading", colour: colours.text, maxWidth: full.width,
    style: { letterSpacing: "-0.045em", lineHeight: "0.95" } });
  const sq = u * 6;
  const listTop = g.y(1.3), step = u * (wide ? 7.4 : 9.4);
  const sports = props.sports.map((name, i) => {
    const y = listTop + i * step;
    const box = kit.svg("rect", { x: full.x, y, width: 0, height: sq, fill: props.colours[i % props.colours.length] }, s);
    const label = kit.text(root, name, { x: full.x + sq + u * 3, y: y - u * 0.5, size: wide ? 5 : 6.2, weight: 700, colour: colours.text });
    return { box, label };
  });
  const factsTop = listTop + props.sports.length * step + u * 1;
  const rule = kit.svg("rect", { x: full.x, y: factsTop, width: 0, height: u * 0.3, fill: colours.text }, s);
  const facts = [];
  let y = factsTop + u * 2.4;
  for (const f of props.facts) {
    const el = kit.text(root, f, { x: full.x, y, size: wide ? 3.8 : 4.4, weight: 600, colour: colours.text, maxWidth: full.width });
    facts.push(el);
    y = el.getBoundingClientRect().bottom - root.getBoundingClientRect().top + u * 1.8;
  }

  return (t) => {
    head.style.clipPath = `inset(-30% ${(1 - kit.progress(t, 0.05, 0.4, snap)) * 105 - 5}% -30% -5%)`;
    const start = Math.max(0.4, kit.at(0) + 0.9);
    sports.forEach((sp, i) => {
      const k = kit.progress(t, start + i * 0.35, 0.3, snap);
      sp.box.setAttribute("width", String(sq * k));
      sp.label.style.clipPath = `inset(-30% ${(1 - kit.progress(t, start + i * 0.35 + 0.1, 0.3, snap)) * 105 - 5}% -30% -5%)`;
    });
    rule.setAttribute("width", String(full.width * kit.progress(t, kit.at(1), 0.4, snap)));
    facts.forEach((f, i) => (f.style.clipPath = `inset(-30% ${(1 - kit.progress(t, kit.at(1 + i) + 0.2, 0.45, snap)) * 105 - 5}% -30% -5%)`));
  };
});
