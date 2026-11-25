// The few words of the chat button, in the page script (ChatLauncher.tsx); the rest of the
// chat's text loads with the panel (strings.ts). From the Gemini tools, never by hand.
import type { Language } from '../i18n';

export interface LauncherText {
  open: string;
  hint: string;
  /** The mascot's hello, once a visit. */
  greet: string;
  dismiss: string;
  /** What GRKU Plus adds to the assistant, in the GRKU Plus sheet. */
  plusBenefit: string;
}

const TEXT: Record<Language, LauncherText> = {
  en: { open: 'Ask GRKU', hint: 'Stuck on this step? Ask me.', greet: 'Hi! Need a hand with GRKU?', dismiss: 'Dismiss', plusBenefit: 'Deeper conversations, more detailed answers' },
  th: { open: "ถาม GRKU", hint: "ติดตรงขั้นตอนไหน? ถามได้เลย", greet: "สวัสดี! มีอะไรให้ช่วยเกี่ยวกับ GRKU ไหม", dismiss: "ปิด", plusBenefit: "คุยได้ลึกขึ้น พร้อมคำตอบที่ละเอียดกว่าเดิม" },
  'zh-Hans': { open: "咨询 GRKU", hint: "卡在这一步了？问问我。", greet: "你好！用 GRKU 时，有什么需要帮忙的吗？", dismiss: "关闭", plusBenefit: "更深入的交流，更详尽的解答" },
  'zh-Hant': { open: "詢問 GRKU", hint: "卡在這個步驟了嗎？問我吧。", greet: "嗨！使用 GRKU 時，有什麼需要幫忙的嗎？", dismiss: "關閉", plusBenefit: "對話更深入，解答更詳盡" },
  ja: { open: "GRKUに質問", hint: "ここで困ったら、気軽に聞いてください。", greet: "こんにちは！GRKUのことで何かお手伝いしましょうか？", dismiss: "閉じる", plusBenefit: "より深い対話と、詳しい回答" },
  ko: { open: "GRKU에 질문하기", hint: "여기서 막히셨나요? 물어보세요.", greet: "안녕하세요! GRKU 사용을 도와드릴까요?", dismiss: "닫기", plusBenefit: "더 깊이 있는 대화와 상세한 답변" },
};

export const launcherText = (language: Language): LauncherText => TEXT[language];
