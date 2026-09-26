export type DetectedLang = {
  lang: string;
  locale: string;
  label: string;
  labelMy: string;
};

const SCRIPT_RULES: Array<{ re: RegExp; lang: string; locale: string; label: string; labelMy: string }> = [
  { re: /[\u1000-\u109F\uAA60-\uAA7F\uA9E0-\uA9FF]/, lang: "my", locale: "my-MM", label: "Myanmar", labelMy: "မြန်မာ" },
  { re: /[\u3040-\u30FF]/, lang: "ja", locale: "ja-JP", label: "Japanese", labelMy: "ဂျပန်" },
  { re: /[\uAC00-\uD7AF]/, lang: "ko", locale: "ko-KR", label: "Korean", labelMy: "ကိုရီးယား" },
  { re: /[\u4E00-\u9FFF]/, lang: "zh", locale: "zh-CN", label: "Chinese", labelMy: "တရုတ်" },
  { re: /[\u0900-\u097F]/, lang: "hi", locale: "hi-IN", label: "Hindi", labelMy: "ဟိန္ဒီ" },
  { re: /[\u0E00-\u0E7F]/, lang: "th", locale: "th-TH", label: "Thai", labelMy: "ထိုင်း" },
  { re: /[\u0600-\u06FF]/, lang: "ar", locale: "ar-SA", label: "Arabic", labelMy: "အာရဗီ" },
  { re: /[\u0400-\u04FF]/, lang: "ru", locale: "ru-RU", label: "Russian", labelMy: "ရုရှ" },
];

export function detectLang(text: string): DetectedLang {
  for (const rule of SCRIPT_RULES) {
    if (rule.re.test(text)) {
      return { lang: rule.lang, locale: rule.locale, label: rule.label, labelMy: rule.labelMy };
    }
  }
  return { lang: "en", locale: "en-US", label: "English", labelMy: "အင်္ဂလိပ်" };
}
