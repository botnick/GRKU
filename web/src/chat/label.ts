// The few words of the chat button, in the page script (ChatLauncher.tsx); the rest of the
// chat's text loads with the panel (strings.ts). From the Gemini tools, never by hand.
import type { Language } from '../i18n';

export interface LauncherText {
  open: string;
  /** The label beside the button: it says that this is an AI assistant. */
  ai: string;
  hint: string;
  /** The mascot's hello, once a visit. */
  greet: string;
  dismiss: string;
  /** What GRKU Plus adds to the assistant, in the GRKU Plus sheet. */
  plusBenefit: string;
}

const TEXT: Record<Language, LauncherText> = {
  en: { open: 'Ask GRKU', ai: "Ask the AI assistant", hint: 'Stuck on this step? Ask me.', greet: "Hi! I'm GRKU's AI assistant. Ask me anything about installing GRKU, choosing film looks, or your GR.", dismiss: 'Dismiss', plusBenefit: 'Deeper conversations, more detailed answers' },
  th: { open: "ถาม GRKU", ai: "ถามผู้ช่วย AI", hint: "ติดอยู่ตรงขั้นตอนนี้ใช่ไหมคะ ถามเราได้เลยค่ะ", greet: "สวัสดีค่ะ! เราคือ AI ผู้ช่วยของ GRKU ยินดีตอบทุกคำถามเกี่ยวกับการติดตั้ง GRKU ซึ่งเป็นส่วนเสริมที่ทำงานผ่านการ์ด SD การเลือกฟิล์มลุค หรือกล้อง RICOH GR ค่ะ", dismiss: "ปิด", plusBenefit: "คุยได้ลึกขึ้น พร้อมคำตอบที่ละเอียดกว่าเดิม" },
  'zh-Hans': { open: "咨询 GRKU", ai: "询问 AI 助手", hint: "卡在这一步了？问问我。", greet: "你好！我是 GRKU 的 AI 助手。关于 GRKU 安装、胶片风格选择或你的 GR 相机，任何问题都可以问我。", dismiss: "关闭", plusBenefit: "更深入的交流，更详尽的解答" },
  'zh-Hant': { open: "詢問 GRKU", ai: "詢問 AI 助理", hint: "卡在這個步驟了嗎？問我吧。", greet: "嗨！我是 GRKU 的 AI 助理，專門回答 GRKU 安裝、底片風格選擇，以及 RICOH GR 相機使用上的問題。歡迎隨時問我！", dismiss: "關閉", plusBenefit: "對話更深入，解答更詳盡" },
  ja: { open: "GRKUに質問", ai: "AIに質問する", hint: "ここで困ったら、気軽に聞いてください。", greet: "こんにちは！GRKUのAIアシスタントです。GRKUのインストール方法やフィルムルックの選び方、GRカメラについて、何でもお気軽にご質問ください。", dismiss: "閉じる", plusBenefit: "より深い対話と、詳しい回答" },
  ko: { open: "GRKU에 질문하기", ai: "AI에게 질문하기", hint: "여기서 막히셨나요? 물어보세요.", greet: "안녕하세요! GRKU AI 도우미입니다. GRKU 설치 방법이나 필름 룩 선택, RICOH GR 카메라에 관해 궁금한 점을 무엇이든 물어보세요.", dismiss: "닫기", plusBenefit: "더 깊이 있는 대화와 상세한 답변" },
};

export const launcherText = (language: Language): LauncherText => TEXT[language];
