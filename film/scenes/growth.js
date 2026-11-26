// Athletes at every Summer Games, one bar each, growing left to right on the first sentence.
// On the second, a rule marks 10,000 and the bars above it since 1996 turn black-on-red.
Bezel.scene((root, kit) => {
  const { u, colours, props } = kit;
  const s = kit.stage();
  const wide = kit.shape === "wide";
  const g = kit.grid(12, 8);
  const snap = (x) => 1 - Math.pow(1 - x, 5);
  const data = props.athletes;
  const max = 12000;

  const head = kit.text(root, props.heading, { x: g.x(0), y: g.y(0), size: wide ? 6 : 5.6, font: "heading", colour: colours.text, maxWidth: g.cell(0, 0, 12).width,
    style: { letterSpacing: "-0.045em", lineHeight: "0.95" } });
  const area = g.cell(0, 1.8, 12, 4.7);
  const step = area.width / data.length;
  const bw = step * 0.72;
  const yOf = (v) => area.y + area.height * (1 - v / max);
  const bars = data.map(([year, v], i) => kit.svg("rect", { x: area.x + i * step, y: area.y + area.height, width: bw, height: 0,
    fill: colours.text }, s));
  const base = kit.svg("rect", { x: area.x, y: area.y + area.height, width: area.width, height: u * 0.25, fill: colours.text }, s);
  const ten = kit.svg("line", { x1: area.x, x2: area.x, y1: yOf(10000), y2: yOf(10000), stroke: colours.text, "stroke-width": u * 0.2, "stroke-dasharray": u + " " + u * 0.7 }, s);
  const tenLabel = kit.text(root, props.line, { x: area.x, y: yOf(10000) - u * 4.2, size: 3, weight: 700, colour: colours.text });
  // First year flush left, middle one centred on its bar, last flush right: none leave the grid.
  const yearAt = [[0, "left"], [Math.floor(data.length / 2), "center"], [data.length - 1, "right"]];
  const years = yearAt.map(([i, align]) => kit.text(root, String(data[i][0]), { x: align === "left" ? area.x : align === "right" ? area.x + area.width : area.x + i * step + bw / 2,
    y: area.y + area.height + u * 1.4, size: 2.8, weight: 600, align, colour: colours.muted, fit: false }));
  const source = kit.text(root, props.source, { x: area.x + area.width, y: area.y + area.height + u * 5.4, size: 2.6, colour: colours.muted, align: "right", fit: false });

  return (t) => {
    head.style.clipPath = `inset(-30% ${(1 - kit.progress(t, 0.05, 0.4, snap)) * 105 - 5}% -30% -5%)`;
    bars.forEach((bar, i) => {
      const h = area.height * (data[i][1] / max) * kit.progress(t, 0.4 + i * 0.05, 0.35, snap);
      bar.setAttribute("y", String(area.y + area.height - h));
      bar.setAttribute("height", String(h));
      // Before the second sentence every bar is black; then the 10,000 club turns red.
      if (data[i][0] >= props.from) bar.setAttribute("fill", t >= kit.at(1) + 0.3 ? props.accent || colours.accent : colours.text);
    });
    ten.setAttribute("x2", String(area.x + area.width * kit.progress(t, kit.at(1), 0.45, snap)));
    tenLabel.style.clipPath = `inset(-30% ${(1 - kit.progress(t, kit.at(1) + 0.2, 0.3, snap)) * 105 - 5}% -30% -5%)`;
    years.forEach((y) => (y.style.opacity = String(kit.progress(t, 1.6, 0.3))));
    source.style.opacity = String(kit.progress(t, 2, 0.3));
  };
});
