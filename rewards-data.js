/* Gegenstände für Capys Zimmer, Bastelideen, Experimente und Lieder. */
window.ITEMS = [
  // gift: kommt als Geschenk nach einer Einheit. price: im Shop mit Capy-Geld kaufbar.
  { id: "napf", emo: "🥣", name: "Fressnapf", gift: true },
  { id: "haus", emo: "🛖", name: "Häuschen", gift: true },
  { id: "teich", emo: "💧", name: "Badeteich", gift: true },
  { id: "mandarine", emo: "🍊", name: "Mandarine", gift: true },
  { id: "decke", emo: "🧣", name: "Kuscheldecke", gift: true },
  { id: "melone", emo: "🍉", name: "Melone", gift: true },
  { id: "blume", emo: "🌺", name: "Blume", gift: true },
  { id: "ball", emo: "⚽", name: "Ball", gift: true },
  { id: "kissen", emo: "🛏️", name: "Bettchen", gift: true },
  { id: "pflanze", emo: "🪴", name: "Pflanze", gift: true },
  { id: "buch", emo: "📚", name: "Bücher", gift: true },
  { id: "kamera", emo: "📷", name: "Reporter-Kamera", gift: true },
  { id: "mikro", emo: "🎤", name: "Mikrofon", gift: true },
  { id: "freund", emo: "🐢", name: "Schildkröten-Freund", gift: true },
  { id: "schmetterling", emo: "🦋", name: "Schmetterling", gift: true },
  { id: "apfel", emo: "🍎", name: "Apfel", gift: true },
  { id: "krone", emo: "👑", name: "Glitzerkrone", price: 15 },
  { id: "regenbogen", emo: "🌈", name: "Regenbogen", price: 20 },
  { id: "palme", emo: "🌴", name: "Palme", price: 12 },
  { id: "teddy", emo: "🧸", name: "Kuscheltier", price: 10 },
  { id: "ballon", emo: "🎈", name: "Luftballon", price: 6 },
  { id: "kuchen", emo: "🎂", name: "Kuchen", price: 8 },
  { id: "musik", emo: "🎶", name: "Musikbox", price: 14 },
  { id: "stern", emo: "🌟", name: "Glitzerstern", price: 18 },
  { id: "papagei", emo: "🦜", name: "Papagei-Freund", price: 25 },
  { id: "einhorn", emo: "🦄", name: "Einhorn-Figur", price: 30 },
  { id: "schatz", emo: "🪙", name: "Schatztruhe", price: 22 },
  { id: "laterne", emo: "🏮", name: "Laterne", price: 9 }
];

window.CRAFTS = {
  herbst: [
    { title: "Blätter-Capybara", stuff: ["bunte Herbstblätter", "Papier", "Kleber", "brauner Stift"], steps: ["Sammle draußen 5 bis 10 schöne Blätter.", "Lege die Blätter ein paar Tage zwischen Bücher, damit sie flach werden.", "Klebe ein großes braunes Blatt als Körper auf und ein rundes als Kopf.", "Male Augen, Nase und Ohren dazu.", "Zähle: Wie viele Blätter hast du gebraucht? Schreib die Zahl dazu!"] },
    { title: "Laterne mit Tieraugen", stuff: ["leeres Marmeladenglas", "Seidenpapier", "Kleister", "Teelicht (nur mit Erwachsenen!)"], steps: ["Reiße Seidenpapier in kleine Stücke.", "Kleistere die Stücke rund um das Glas.", "Klebe zwei große Augen aus Papier auf: Fertig ist die Eulen-Laterne.", "Mit einem Erwachsenen ein LED-Licht hineinstellen."] }
  ],
  winter: [
    { title: "Schnee-Capybara aus Watte", stuff: ["Watte", "blaues Papier", "Kleber", "Glitzer"], steps: ["Male ein Capybara auf blaues Papier.", "Klebe Wattebäusche als Schneefell auf.", "Streue ein bisschen Glitzer als Schneeflocken.", "Zähle 10 Schneeflocken in Fünfergruppen!"] }
  ],
  fruehling: [
    { title: "Frosch zum Hüpfen (Falten)", stuff: ["grünes Papier (quadratisch)", "Stift"], steps: ["Falte das Papier zu einem Dreieck und wieder auf.", "Falte die Ecken zur Mitte.", "Knicke das untere Ende hoch und wieder runter wie eine Feder.", "Male Augen auf. Drück hinten drauf: Er hüpft!", "Wie viele Sprünge schafft er bis zur Wand?"] }
  ],
  sommer: [
    { title: "Capybara-Fingerpuppe", stuff: ["braunes Papier", "Schere", "Kleber", "Stifte"], steps: ["Schneide einen Papierstreifen und klebe ihn zu einem Ring um deinen Finger.", "Schneide einen runden Kopf aus und klebe ihn vorne dran.", "Male Augen, Nase und kleine Ohren.", "Jetzt kann deine Puppe Matheaufgaben vorlesen!"] }
  ],
  immer: [
    { title: "Tierreporterinnen-Mikrofon", stuff: ["Klopapierrolle", "Alufolie", "Kreppband", "Sticker"], steps: ["Knülle Alufolie zu einer Kugel.", "Stecke die Kugel oben auf die Rolle.", "Wickle Kreppband um die Rolle und beklebe sie.", "Mach ein Interview: Frag jemanden nach seiner Lieblingszahl!"] },
    { title: "Rechen-Eierkarton", stuff: ["Eierkarton mit 10 Mulden", "20 kleine Dinge (Knöpfe, Nudeln)", "Farbe"], steps: ["Male die ersten 5 Mulden blau und die anderen 5 lila an.", "Lege Nudeln hinein und sag sofort, wie viele es sind.", "Wie viele fehlen bis 10? Das sind Zehnerfreunde!"] }
  ]
};

window.EXPERIMENTS = [
  { title: "Warum können Capybaras so gut schwimmen?", stuff: ["Schüssel mit Wasser", "Knete", "Alufolie"], steps: ["Forme aus Knete eine Kugel und lege sie ins Wasser. Was passiert?", "Forme dieselbe Knete zu einem flachen Boot. Was passiert jetzt?", "Capybaras haben Schwimmhäute zwischen den Zehen. So schieben sie viel Wasser weg, wie dein Boot.", "Reporter-Frage: Wie viele Murmeln trägt dein Boot? Schreib die Zahl auf!"] },
  { title: "Regen im Glas", stuff: ["Glas mit Wasser", "Rasierschaum", "Lebensmittelfarbe blau"], steps: ["Sprühe Rasierschaum als Wolke auf das Wasser.", "Tropfe blaue Farbe auf die Wolke.", "Warte: Es regnet im Glas! So entsteht Regen im Regenwald.", "Zähle die Tropfen, bis es regnet."] },
  { title: "Wie viel Wasser trinkt eine Pflanze?", stuff: ["2 Gläser", "Wasser", "Stängel Sellerie oder weiße Blume", "Lebensmittelfarbe"], steps: ["Fülle ein Glas mit Wasser und Farbe.", "Stelle die Blume hinein.", "Schau nach 1 Stunde und nach 1 Tag: Was passiert?", "Im Regenwald trinken Bäume riesige Mengen Wasser!"] }
];

window.SONGS = [
  { title: "Das Zehnerfreunde-Lied", lines: ["Eins und neun, die tanzen fein,", "zwei und acht, die haben gelacht,", "drei und sieben, die sich lieben,", "vier und sechs, die machen Klecks,", "fünf und fünf, die ziehen Strümpf'!", "Zusammen sind sie immer zehn, wie schön!"] },
  { title: "Capy-Klatschreim", lines: ["Capy, Capy, schwimm im Fluss,", "zähl in Fünfern, ohne Stuss!", "Fünf und fünf sind zehn im Nu,", "klatsch und stampf und du und du!"] }
];
