// The poster: the grid flashes up, a red circle and a black bar snap into their cells, the
// name lands big along the bottom and the three details drop into their columns.
Bezel.scene((root, kit) => {
  const { u, colours, props } = kit;
  const s = kit.stage();
  const wide = kit.shape === "wide";
  const g = kit.grid(12, 8);
  const snap = (x) => 1 - Math.pow(1 - x, 5);

  const lines = g.lines(s, { colour: colours.accent, opacity: 0.35 });
  // Five stripes in the five ring colours: the film's colours, not the emblem.
  const c = wide ? g.cell(8, 0, 4, 4) : g.cell(7, 0, 5, 3.6);
  const stripeH = c.height / 5;
  const stripes = props.colours.map((fill, i) => kit.svg("rect", { x: c.x, y: c.y + i * stripeH, width: 0, height: stripeH * 0.78, fill }, s));
  const bar = g.cell(0, 4, wide ? 8 : 12, 1);
  const barRect = kit.svg("rect", { x: bar.x, y: bar.y + bar.height * 0.4, width: 0, height: bar.height * 0.22, fill: colours.text }, s);
  const info = props.details.map((txt, i) => {
    const cell = wide ? g.cell((i % 2) * 3.8, Math.floor(i / 2) * 1.6, 3.6, 1) : g.cell(0, i * 0.9, 6.5, 1);
    return kit.text(root, txt, { x: cell.x, y: cell.y, size: 3.2, weight: 600, colour: colours.text, maxWidth: cell.width - u });
  });
  const name = g.cell(0, 5, 12, 3);
  const title = kit.text(root, props.name, { x: name.x, y: name.y - u * 1.5, size: wide ? 14 : 12.5, font: "heading", colour: colours.text, maxWidth: name.width,
    style: { letterSpacing: "-0.055em", lineHeight: "0.9" } });

  return (t) => {
    lines.style.opacity = String(0.35 * kit.progress(t, 0, 0.15) * (1 - kit.progress(t, 1.6, 0.4)));
    stripes.forEach((el, i) => el.setAttribute("width", String(c.width * kit.progress(t, 0.2 + i * 0.08, 0.4, snap))));
    barRect.setAttribute("width", String(bar.width * kit.progress(t, 0.45, 0.4, snap)));
    const n = kit.progress(t, 0.7, 0.45, snap);
    title.style.clipPath = `inset(${(1 - n) * 130 - 30}% -5% -30% -5%)`;
    title.style.translate = `0 ${(1 - n) * u * 5}px`;
    info.forEach((el, i) => {
      const at = i < 3 ? Math.max(1.1 + i * 0.15, kit.at(1) + i * 0.5) : Math.max(2.2, kit.at(2));
      el.style.clipPath = `inset(-30% ${(1 - kit.progress(t, at, 0.3, snap)) * 105 - 5}% -30% -5%)`;
    });
  };
});
