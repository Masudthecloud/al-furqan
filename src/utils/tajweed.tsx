import React from "react";

// Full-word Tajweed highlights that preserve Arabic ligatures
const tajweedHighlights: [RegExp, string][] = [
  [/(الرَّحِيمِ|الرَّحْمَٰنِ|السَّمَاوَاتِ|النَّاسِ)/g, "text-[#e60000]"],
  [/(إِنَّ|مُّحَمَّدٌ|نّ)/g, "text-[#009900]"],
  [/(يَبْلُغُ|يَجْعَلُ|يُبْدِئُ)/g, "text-[#0000cc]"],
  [/(مِن ثَمَرَاتٍ|مِن تَحْتِهَا|مِن جُوعٍ)/g, "text-[#000066]"],
  [/(يَلْهُو|اللَّهُ|الرَّبِّ)/g, "text-[#996633]"],
  [/(الضَّالِّينَ|الصِّرَاطَ|ظَلَمُوا)/g, "text-[#ff66b2]"],
  [/(يَسْتَغْفِرُونَ|أَسْكَنَّا|مَسْكَنًا)/g, "text-[#666666]"],
];

// Apply Tajweed coloring without breaking Arabic ligatures
export const applyTajweedColors = (
  text: string,
  showTajweed: boolean
): React.ReactNode => {
  if (!showTajweed || !text) return <>{text}</>;

  let html = text;
  for (const [regex, className] of tajweedHighlights) {
    html = html.replace(
      regex,
      (match) => `<span class="${className}">${match}</span>`
    );
  }

  return <span dir="rtl" lang="ar" dangerouslySetInnerHTML={{ __html: html }} />;
};
