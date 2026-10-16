/* Eigener kleiner PDF-Erzeuger ohne fremde Bibliothek:
   Jede Seite wird auf ein Canvas gemalt und als Bild in eine A4-PDF gelegt.
   Alles passiert im Browser, nichts wird verschickt. */
window.PDF = (function () {
  const W = 1240, H = 1754; // A4 bei 150 dpi
  const FONT = '"Arial Rounded MT Bold", "Avenir Next Rounded", "Nunito", Arial, sans-serif';

  async function build(pageFns) {
    const enc = new TextEncoder();
    const chunks = []; let len = 0; const offs = [];
    const push = d => { const b = typeof d === 'string' ? enc.encode(d) : d; chunks.push(b); len += b.length; };
    const imgs = [];
    for (const fn of pageFns) {
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
      await fn(ctx);
      const b64 = c.toDataURL('image/jpeg', 0.9).split(',')[1];
      const bin = atob(b64); const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      imgs.push(arr);
    }
    const n = imgs.length;
    // Objektnummern: 1 Katalog, 2 Seitenbaum, dann je Seite 3 Objekte
    const pageId = i => 3 + i * 3, contId = i => 4 + i * 3, imgId = i => 5 + i * 3;
    const total = 2 + n * 3;
    push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    const obj = (id, body) => { offs[id] = len; push(id + ' 0 obj\n'); push(body); push('\nendobj\n'); };
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    obj(2, `<< /Type /Pages /Count ${n} /Kids [${imgs.map((_, i) => pageId(i) + ' 0 R').join(' ')}] >>`);
    imgs.forEach((img, i) => {
      obj(pageId(i), `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im${i} ${imgId(i)} 0 R >> >> /Contents ${contId(i)} 0 R >>`);
      const cs = `q 595.28 0 0 841.89 0 0 cm /Im${i} Do Q`;
      obj(contId(i), `<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`);
      offs[imgId(i)] = len;
      push(`${imgId(i)} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${W} /Height ${H} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.length} >>\nstream\n`);
      push(img); push('\nendstream\nendobj\n');
    });
    const xref = len;
    let x = `xref\n0 ${total + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= total; i++) x += String(offs[i]).padStart(10, '0') + ' 00000 n \n';
    push(x + `trailer\n<< /Size ${total + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
    return new Blob(chunks, { type: 'application/pdf' });
  }

  function download(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  /* ---------- Zeichenhilfen ---------- */
  function txt(ctx, s, x, y, size = 40, opt = {}) {
    ctx.font = `${opt.bold === false ? '' : 'bold '}${size}px ${FONT}`;
    ctx.fillStyle = opt.color || '#2b2550'; ctx.textAlign = opt.align || 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(s, x, y);
  }
  // Text mit Zeilenumbruch, gibt neue y-Position zurück
  function para(ctx, s, x, y, maxW, size = 34, opt = {}) {
    ctx.font = `${opt.bold ? 'bold ' : ''}${size}px ${FONT}`; ctx.fillStyle = opt.color || '#2b2550'; ctx.textAlign = 'left';
    const words = String(s).split(' '); let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, x, y); y += size * 1.4; line = w; } else line = test;
    }
    if (line) { ctx.fillText(line, x, y); y += size * 1.4; }
    return y;
  }
  function rrect(ctx, x, y, w, h, r, fill, stroke, lw = 4) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
  }
  function svgImg(svg, x, y, w, h, ctx) {
    return new Promise(res => {
      const img = new Image();
      img.onload = () => { ctx.drawImage(img, x, y, w, h); res(); };
      img.onerror = () => res();
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.includes('xmlns') ? svg : svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"'));
    });
  }
  function frame(ctx, col = '#9a72dd') {
    rrect(ctx, 40, 40, W - 80, H - 80, 50, null, col, 10);
    ctx.font = `50px ${FONT}`;
    ['✨', '🌿', '⭐', '🦋'].forEach((e, i) => ctx.fillText(e, [70, W - 130, 70, W - 130][i], [120, 120, H - 70, H - 70][i]));
  }
  function footer(ctx) { txt(ctx, 'Capys Mathe-Regenwald · ' + U.dateDE(), W / 2, H - 70, 24, { align: 'center', bold: false, color: '#8a84a8' }); }
  const name = () => Store.state.name || 'Reporterin';
  const buddy = () => Store.state.buddy || 'Capy';

  /* ---------- Die einzelnen PDFs ---------- */
  async function coloring(variant = 0) {
    const scenes = ['🌴', '🦋', '🍂', '❄️', '🌸', '☀️'];
    const s = U.season();
    const deco = { herbst: ['🍂', '🍁', '🎃'], winter: ['❄️', '⛄', '🧣'], fruehling: ['🌸', '🐣', '🌷'], sommer: ['☀️', '🍉', '🌊'] }[s];
    const blob = await build([async ctx => {
      frame(ctx);
      txt(ctx, `Mal ${buddy()} bunt an!`, W / 2, 190, 64, { align: 'center' });
      txt(ctx, `${U.seasonName[s]}-Ausmalbild für ${name()}`, W / 2, 250, 34, { align: 'center', bold: false, color: '#5f5a80' });
      await svgImg(Capy.svg({ mood: variant % 2 ? 'cheer' : 'happy', outline: true, hat: true }), 220, 330, 800, 800, ctx);
      // einfache Ausmal-Formen rundherum
      ctx.strokeStyle = '#222'; ctx.lineWidth = 4;
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(170 + i * 225, 1350, 70, 40, 0, 0, Math.PI * 2); ctx.stroke(); }
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(160 + i * 185, 1470, 34, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(160 + i * 185, 1504); ctx.lineTo(160 + i * 185, 1560); ctx.stroke(); }
      ctx.globalAlpha = .35; ctx.font = `70px ${FONT}`; deco.forEach((d, i) => ctx.fillText(d, 140 + i * 400, 1650)); ctx.globalAlpha = 1;
      para(ctx, 'Mathe-Extra: Male 5 Blätter grün und 5 Blätter gelb. Wie viele sind es zusammen?', 120, 1240, W - 240, 30);
      footer(ctx);
    }]);
    download(blob, 'Capy-Ausmalbild.pdf');
  }

  async function steps(title, sub, stuff, list, icon, file) {
    const blob = await build([async ctx => {
      frame(ctx, '#3f9fe0');
      await svgImg(Capy.svg({ mood: 'cheer' }), W - 360, 100, 250, 250, ctx);
      txt(ctx, icon, 110, 230, 110, { bold: false });
      let y = para(ctx, title, 110, 420, W - 220, 60, { bold: true });
      y = para(ctx, sub, 110, y + 10, W - 220, 30, { color: '#5f5a80' });
      y += 30; txt(ctx, 'Das brauchst du:', 110, y, 40); y += 60;
      stuff.forEach(s => { y = para(ctx, '• ' + s, 140, y, W - 280, 34); });
      y += 30; txt(ctx, 'So geht es:', 110, y, 40); y += 60;
      list.forEach((s, i) => {
        rrect(ctx, 110, y - 44, 64, 64, 32, '#efe6fd');
        txt(ctx, String(i + 1), 142, y, 38, { align: 'center', color: '#5b3a99' });
        y = para(ctx, s, 200, y, W - 330, 34) + 18;
      });
      footer(ctx);
    }]);
    download(blob, file);
  }
  function craft() {
    const s = U.season();
    const list = CRAFTS[s].concat(CRAFTS.immer);
    const c = U.pick(list);
    return steps(c.title, `Bastelidee für den ${U.seasonName[s]} von ${buddy()}`, c.stuff, c.steps, '✂️', 'Capy-Bastelidee.pdf');
  }
  function experiment() {
    const e = U.pick(EXPERIMENTS);
    return steps(e.title, 'Experiment für Tierforscherinnen (mit einem Erwachsenen)', e.stuff, e.steps, '🔬', 'Capy-Experiment.pdf');
  }
  async function song() {
    const sg = U.pick(SONGS);
    const blob = await build([async ctx => {
      frame(ctx);
      txt(ctx, '🎶', W / 2, 260, 120, { align: 'center', bold: false });
      txt(ctx, sg.title, W / 2, 400, 58, { align: 'center' });
      let y = 520; sg.lines.forEach(l => { txt(ctx, l, W / 2, y, 44, { align: 'center', bold: false }); y += 80; });
      para(ctx, 'Tipp: Klatsche bei jeder Zahl in die Hände und stampfe bei der Zehn!', 140, y + 60, W - 280, 32, { color: '#5f5a80' });
      await svgImg(Capy.svg({ mood: 'cheer' }), W / 2 - 170, H - 520, 340, 340, ctx);
      footer(ctx);
    }]);
    download(blob, 'Capy-Lied.pdf');
  }
  async function steckbrief() {
    const blob = await build([async ctx => {
      frame(ctx, '#4fae74');
      txt(ctx, '🎤 Tier-Steckbrief', W / 2, 200, 64, { align: 'center' });
      txt(ctx, `Reporterin: ${name()}`, W / 2, 270, 34, { align: 'center', bold: false });
      rrect(ctx, 140, 330, W - 280, 460, 30, null, '#4fae74', 5);
      txt(ctx, 'Hier ist Platz für ein Bild von deinem Tier', W / 2, 570, 30, { align: 'center', bold: false, color: '#9a9ab0' });
      const rows = ['Name des Tieres:', 'Wo lebt es?', 'Was frisst es?', 'Wie groß ist es? (in cm)', 'Wie viele Beine hat es?', 'Das finde ich toll:'];
      let y = 880; rows.forEach(r => { txt(ctx, r, 150, y, 36); ctx.strokeStyle = '#b9b2d6'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(150, y + 60); ctx.lineTo(W - 150, y + 60); ctx.stroke(); y += 130; });
      footer(ctx);
    }]);
    download(blob, 'Tier-Steckbrief.pdf');
  }
  async function clockCraft() {
    const blob = await build([async ctx => {
      frame(ctx, '#9a72dd');
      txt(ctx, 'Bastel-Uhr zum Ausschneiden', W / 2, 190, 56, { align: 'center' });
      para(ctx, 'Ausschneiden, auf Pappe kleben, Zeiger mit einer Musterbeutelklammer in der Mitte befestigen.', 140, 260, W - 280, 30, { color: '#5f5a80' });
      await svgImg(V.clockSVG(0, 0, { hideHands: true }).replace('class="clock-svg" ', ''), 220, 360, 800, 800, ctx);
      // Zeiger zum Ausschneiden
      ctx.strokeStyle = '#222'; ctx.lineWidth = 4;
      rrect(ctx, 200, 1260, 300, 50, 25, '#ffd6dc', '#222'); txt(ctx, 'Stunde (kurz)', 350, 1296, 26, { align: 'center' });
      rrect(ctx, 600, 1260, 440, 40, 20, '#d4e6ff', '#222'); txt(ctx, 'Minute (lang)', 820, 1290, 26, { align: 'center' });
      para(ctx, 'Merke: Der kurze Zeiger zeigt die Stunde. Der lange Zeiger zeigt die Minuten.', 140, 1420, W - 280, 34);
      footer(ctx);
    }]);
    download(blob, 'Bastel-Uhr.pdf');
  }
  async function playMoney() {
    const blob = await build([async ctx => {
      txt(ctx, 'Spielgeld für den Kaufladen', W / 2, 120, 52, { align: 'center' });
      txt(ctx, 'Ausschneiden und los geht der Regenwald-Kiosk! (Nur Spielgeld)', W / 2, 175, 28, { align: 'center', bold: false, color: '#5f5a80' });
      const notes = [5, 5, 10, 10, 20, 20, 50, 50];
      let y = 230;
      for (let i = 0; i < notes.length; i += 2) {
        for (let k = 0; k < 2; k++) await svgImg(V.moneySVG(notes[i + k]), 90 + k * 540, y, 500, 276, ctx);
        y += 300;
      }
      const coins = [1, 1, 1, 1, 1, 2, 2, 2, 2, 2];
      for (let i = 0; i < coins.length; i++) await svgImg(V.moneySVG(coins[i]), 90 + (i % 5) * 215, y + Math.floor(i / 5) * 210, 190, 190, ctx);
    }]);
    download(blob, 'Spielgeld.pdf');
  }

  const WORLD_NAMES = { w1: 'Klasse 1: Zahlen bis 20', w2: 'Brücke ins Land der großen Zahlen', w3: 'Klasse 2: Zahlen bis 100' };
  async function certificate(world) {
    const st = Store.state;
    const skills = SKILLS.filter(s => s.world === world);
    const mastered = skills.filter(s => st.gems.includes(s.id));
    const practiced = skills.filter(s => st.skills[s.id] && st.skills[s.id].solved > 0);
    const blob = await build([async ctx => {
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#dcf1ff'); g.addColorStop(1, '#f0e6ff');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      rrect(ctx, 60, 60, W - 120, H - 120, 60, '#fff', '#ffc94d', 14);
      txt(ctx, '🏅', W / 2, 260, 130, { align: 'center', bold: false });
      txt(ctx, 'URKUNDE', W / 2, 380, 90, { align: 'center', color: '#5b3a99' });
      txt(ctx, 'Tierreporterin für Mathematik', W / 2, 450, 44, { align: 'center', color: '#1d5f96' });
      txt(ctx, name(), W / 2, 580, 96, { align: 'center', color: '#9a72dd' });
      para(ctx, `hat mit ${buddy()} die Welt „${WORLD_NAMES[world]}“ erforscht.`, 160, 670, W - 320, 36);
      let y = 790; txt(ctx, 'Diese Stärken hast du gesammelt:', 160, y, 36); y += 60;
      (mastered.length ? mastered : practiced).slice(0, 7).forEach(s => { y = para(ctx, `💎 ${s.title}`, 190, y, W - 380, 34); });
      if (!practiced.length) y = para(ctx, 'Die ersten Schritte sind gemacht!', 190, y, W - 380, 34);
      y += 20;
      const items = st.items.map(id => (ITEMS.find(i => i.id === id) || {}).emo).filter(Boolean).slice(0, 14).join(' ');
      if (items) { txt(ctx, 'Gesammelte Schätze:', 160, y, 34); y += 70; ctx.font = `56px ${FONT}`; ctx.fillText(items, 160, y); y += 40; }
      await svgImg(Capy.svg({ mood: 'cheer', hat: true }), W / 2 - 130, H - 440, 260, 260, ctx);
      txt(ctx, U.dateDE(), 200, H - 150, 32, { bold: false });
      txt(ctx, `🐾 ${buddy()}`, W - 200, H - 150, 36, { align: 'right' });
    }]);
    download(blob, `Urkunde-${world}.pdf`);
  }

  async function letter(data) {
    const blob = await build([async ctx => {
      frame(ctx, '#3f9fe0');
      await svgImg(Capy.svg({ mood: 'comfort' }), 100, 100, 260, 260, ctx);
      txt(ctx, `Liebe ${name()},`, 400, 220, 54);
      txt(ctx, `ein Brief von ${buddy()} 💌`, 400, 290, 34, { bold: false, color: '#5f5a80' });
      let y = 440;
      data.forEach(p => { y = para(ctx, p, 120, y, W - 240, 38) + 30; });
      txt(ctx, `Deine Freundin / dein Freund ${buddy()} 🐾`, 120, y + 40, 38);
      footer(ctx);
    }]);
    download(blob, 'Capy-Brief.pdf');
  }

  return { build, download, coloring, craft, experiment, song, steckbrief, clockCraft, playMoney, certificate, letter };
})();
