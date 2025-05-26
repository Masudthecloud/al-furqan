// utils/tajweed.ts

// Dar Al-Maarifah Tajweed rule mapping: pattern => Tailwind text color class
export const tajweedRules: Record<string, string> = {
  // RED - Required Madd
  "\u064e\u0627": "text-[#e60000]",
  "\u064f\u0648": "text-[#e60000]",
  "\u0650\u064a": "text-[#e60000]",
  "\u064e\u0648\u0654": "text-[#e60000]",
  "\u064f\u0648\u0654": "text-[#e60000]",
  "\u0650\u064a\u0654": "text-[#e60000]",

  // GREEN - Ghunnah
  "\u0646\u0651": "text-[#009900]",
  "\u0645\u0651": "text-[#009900]",
  "\u0646\u0652": "text-[#009900]",

  // BLUE - Qalqalah
  "\u0642": "text-[#0000cc]",
  "\u0637": "text-[#0000cc]",
  "\u0628": "text-[#0000cc]",
  "\u062c": "text-[#0000cc]",
  "\u062f": "text-[#0000cc]",

  // DARK BLUE - Ikhfa
  "\u0646\u0652\u062a": "text-[#000066]",
  "\u0646\u0652\u062b": "text-[#000066]",
  "\u0646\u0652\u062c": "text-[#000066]",

  // LIGHT BROWN - Idgham
  "\u0644\u0651": "text-[#996633]",
  "\u0631\u0651": "text-[#996633]",

  // PINK - Heavy Letters
  "\u062e": "text-[#ff66b2]",
  "\u0635": "text-[#ff66b2]",
  "\u0636": "text-[#ff66b2]",
  "\u063a": "text-[#ff66b2]",
  "\u0638": "text-[#ff66b2]",

  // GRAY - Sukoon (silent letters)
  "\u0652": "text-[#666666]",
};

// Function to apply Tajweed color spans without breaking Arabic ligatures (mobile-safe)
export const applyTajweedColors = (
  text: string,
  showTajweed: boolean
): React.ReactNode => {
  if (!showTajweed || !text) return <>{text}</>;

  const rules: [RegExp, string][] = Object.entries(tajweedRules).map(
    ([pattern, className]) => [new RegExp(pattern, "g"), className]
  );

  let html = text;
  for (const [regex, cls] of rules) {
    html = html.replace(regex, (match) => `<span class="${cls}">${match}</span>`);
  }

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};
