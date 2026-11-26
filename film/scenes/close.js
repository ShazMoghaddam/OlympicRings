// The close, kept short: the name, the link on a block of colour so it pops, a small credit
// for the charts, and the signature with its links on coloured chips.
Bezel.scene((root, kit) => {
  const { u, colours, props } = kit;
  const s = kit.stage();
  const g = kit.grid(12, 8);
  const snap = (x) => 1 - Math.pow(1 - x, 5);
  const full = g.cell(0, 0, 12, 8);
  const base = root.getBoundingClientRect();
  const bottomOf = (el) => el.getBoundingClientRect().bottom - base.top;

  const stripeH = u * 1.4;
  const stripes = props.colours.map((fill, i) => kit.svg("rect", { x: full.x + (i * full.width) / 5, y: full.y, width: 0, height: stripeH, fill }, s));
  const name = kit.text(root, props.name, { x: full.x, y: full.y + u * 5, size: 9, font: "heading", colour: colours.text, maxWidth: full.width,
    style: { letterSpacing: "-0.055em", lineHeight: "0.92" } });
  // A link that looks like a link: white on a block of colour.
  const chip = (text, x, y, fill, size) => {
    const el = kit.text(root, text, { x: x + u * 1.6, y: y + u * 0.9, size, weight: 700, colour: "#FFFFFF", fit: false });
    const r = el.getBoundingClientRect();
    const box = kit.svg("rect", { x, y, width: 0, height: r.height + u * 1.8, fill }, s);
    return { el, box, w: r.width + u * 3.2, h: r.height + u * 1.8 };
  };
  const chipColours = props.chipColours || props.colours;
  const link = chip(props.url, full.x, bottomOf(name) + u * 4, chipColours[0], 3.4);
  const credit = kit.text(root, props.credit, { x: full.x, y: bottomOf(name) + u * 4 + link.h + u * 2.6, size: 3, weight: 600, colour: colours.muted, maxWidth: full.width });
  const by = kit.text(root, props.by, { x: full.x, y: bottomOf(credit) + u * 5, size: 3.4, weight: 700, colour: colours.text, maxWidth: full.width });
  // Chips sit side by side, and wrap to a new line when the next one won't fit.
  let x = full.x, linkY = bottomOf(by) + u * 1.6;
  const links = props.links.map((text, i) => {
    const colour = chipColours[(i + 1) % chipColours.length];
    let c = chip(text, x, linkY, colour, 2.9);
    if (x > full.x && x + c.w > full.x + full.width) {
      c.el.remove(); c.box.remove();
      x = full.x; linkY += c.h + u * 1.2;
      c = chip(text, x, linkY, colour, 2.9);
    }
    x += c.w + u * 1.6;
    return c;
  });

  return (t) => {
    stripes.forEach((el, i) => el.setAttribute("width", String((full.width / 5) * kit.progress(t, i * 0.06, 0.35, snap))));
    name.style.clipPath = `inset(-30% ${(1 - kit.progress(t, 0.15, 0.4, snap)) * 105 - 5}% -30% -5%)`;
    const l = kit.progress(t, 0.45, 0.35, snap);
    link.box.setAttribute("width", String(link.w * l));
    link.el.style.opacity = l > 0.6 ? "1" : "0";
    credit.style.clipPath = `inset(-30% ${(1 - kit.progress(t, 0.8, 0.35, snap)) * 105 - 5}% -30% -5%)`;
    const at = Math.max(1.2, kit.at(1));
    by.style.clipPath = `inset(-30% ${(1 - kit.progress(t, at, 0.35, snap)) * 105 - 5}% -30% -5%)`;
    links.forEach((c, i) => {
      const k = kit.progress(t, at + 0.3 + i * 0.12, 0.3, snap);
      c.box.setAttribute("width", String(c.w * k));
      c.el.style.opacity = k > 0.6 ? "1" : "0";
    });
  };
});
