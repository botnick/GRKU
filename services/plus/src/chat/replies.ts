// The fixed answers of the assistant: what the pre-filter says without calling the model, and the
// safe answer that replaces a cut one. English is the source; the other languages come from the
// Gemini tools (grku-tools/i18n-th.mjs, checked with i18n-review.mjs), never by hand.
import type { Language, Refusal } from './guard';

export type ReplyKey = Refusal | 'blocked';

const en: Record<ReplyKey, string> = {
  injection: "I can't change how I work, but I'm happy to help with GRKU and your GR. Try one of these:",
  offtopic: 'I can only help with GRKU, the RICOH GR, and taking photos with it. Try one of these:',
  selfharm:
    "I'm sorry you're going through this. You don't have to face it alone: in Thailand, the Mental Health Hotline 1323 is free and open 24 hours. Elsewhere, please reach out to a local helpline or someone you trust.",
  personal: "I can't help with anyone's personal information. For your own GRKU Plus purchase, use \"I have a key\" in GRKU Plus, or write to support@grku.app.",
  firmware:
    "GRKU never changes the camera firmware, and I can't help with flashing, modifying, or hacking it. Official firmware updates come only from RICOH's own support site. GRKU runs from the SD card instead: [Install guide](/guide/)",
  piracy: 'GRKU Plus keys come only from a purchase on the site. Everything free stays free: every look previews free, and any ten go on your card. [GRKU Plus](/#plus)',
  spam: "I didn't catch a question there. Ask me about GRKU or your GR, for example:",
  blocked: "Sorry, I can't answer that one. Ask me about GRKU, film looks, or your GR.",
};

const th: Record<ReplyKey, string> = {
  injection: "ฉันเปลี่ยนวิธีการทำงานของตัวเองไม่ได้ แต่ยินดีช่วยเรื่อง GRKU และกล้อง GR ลองเลือกคำถามเหล่านี้ได้เลย:",
  offtopic: "ฉันช่วยได้เฉพาะเรื่อง GRKU กล้อง RICOH GR และการถ่ายภาพด้วยกล้องรุ่นนี้ ลองเลือกคำถามเหล่านี้ได้เลย:",
  selfharm: "เสียใจที่คุณกำลังเจอเรื่องหนักแบบนี้นะ คุณไม่จำเป็นต้องรับมือกับมันเพียงลำพัง ในประเทศไทย โทรสายด่วนสุขภาพจิต 1323 ได้ฟรีตลอด 24 ชั่วโมง หากอยู่ที่อื่น ลองติดต่อสายด่วนช่วยเหลือในพื้นที่หรือคนที่คุณไว้ใจ",
  personal: "ฉันไม่สามารถช่วยค้นหาข้อมูลส่วนตัวของผู้อื่นได้ หากต้องการสอบถามเกี่ยวกับการซื้อ GRKU Plus ของคุณเอง ให้ใช้ปุ่ม \"ฉันมีคีย์อยู่แล้ว\" ใน GRKU Plus หรือติดต่อ support@grku.app",
  firmware: "GRKU ไม่ได้เปลี่ยนเฟิร์มแวร์ของกล้อง และฉันไม่สามารถช่วยแฟลช แก้ไข หรือแฮ็กเฟิร์มแวร์ได้ การอัปเดตเฟิร์มแวร์อย่างเป็นทางการต้องดาวน์โหลดจากเว็บไซต์ฝ่ายสนับสนุนของ RICOH เท่านั้น ส่วน GRKU ทำงานผ่านการ์ด SD แทน: [คู่มือการติดตั้ง](/guide/)",
  piracy: "คีย์ GRKU Plus มีจำหน่ายผ่านการซื้อบนเว็บไซต์เท่านั้น ส่วนทุกอย่างที่ให้ใช้ฟรีก็ยังใช้ฟรีเหมือนเดิม คุณสามารถดูตัวอย่างฟิล์มลุคทั้งหมดได้ฟรี และเลือกได้ 10 แบบลงการ์ดของคุณ [GRKU Plus](/#plus)",
  spam: "ไม่เข้าใจคำถาม ลองถามเกี่ยวกับ GRKU หรือกล้อง GR ได้เลย เช่น:",
  blocked: "ขอโทษ ฉันตอบคำถามนี้ไม่ได้ ลองถามเกี่ยวกับ GRKU ฟิล์มลุค หรือกล้อง GR ของคุณได้เลย",
};

const zhHans: Record<ReplyKey, string> = {
  injection: "我无法改变自己的工作方式，但很乐意帮你解决 GRKU 和 RICOH GR 相机相关的问题。你可以试试下面这些问题：",
  offtopic: "我只能帮助解答有关 GRKU、RICOH GR 相机及其摄影技巧的问题。你可以试试下面这些问题：",
  selfharm: "很抱歉你正在经历这些。你不必独自面对这一切：在泰国，可以免费拨打心理健康热线 1323，该热线全天 24 小时开放。在其他地区，请联系当地的求助热线，或向你信任的人寻求帮助。",
  personal: "我无法提供任何人的个人信息。关于您自己已购买的 GRKU Plus，请在 GRKU Plus 中选择“我已有密钥”，或发送邮件至 support@grku.app。",
  firmware: "GRKU 不会更改相机固件，我也无法协助刷写、修改或破解固件。官方固件更新只能通过 RICOH 官方支持网站获取。GRKU 则直接从 SD 卡运行： [安装指南](/guide/)",
  piracy: "GRKU Plus 密钥只能通过本站购买获取。所有免费功能始终免费：所有胶片风格均可免费预览，任意选择十种即可写入 SD 卡。[GRKU Plus](/#plus)",
  spam: "我没看懂你的问题。你可以问我有关 GRKU 或 GR 相机的问题，例如：",
  blocked: "抱歉，我无法回答这个问题。你可以问我有关 GRKU、胶片风格或 GR 相机的问题。",
};

const zhHant: Record<ReplyKey, string> = {
  injection: "我無法改變自己的運作方式，但很樂意協助你使用 GRKU 和 RICOH GR。你可以試試以下問題：",
  offtopic: "我只能協助解答 GRKU、RICOH GR 相機及相關攝影問題。你可以試試以下問題：",
  selfharm: "很抱歉你正在經歷這些。你不必獨自面對這一切：在泰國，可以免費撥打 1323 心理健康專線，全天 24 小時都有服務。如果你在其他地方，請聯絡當地的求助專線，或找信任的人聊聊。",
  personal: "我無法協助提供他人的個人資料。若要查詢您自己購買 GRKU Plus 的相關資訊，請在 GRKU Plus 中選擇「我已有金鑰」，或來信至 support@grku.app。",
  firmware: "GRKU 絕不會變更相機韌體，我也無法協助刷寫、修改或破解韌體。官方韌體更新僅能從 RICOH 官方支援網站取得。GRKU 是直接從 SD 卡執行：[安裝指南](/guide/)",
  piracy: "GRKU Plus 啟用金鑰僅能透過本網站購買取得。所有免費功能皆維持免費：所有色彩配方均可免費預覽，且可將任選十組寫入記憶卡。[GRKU Plus](/#plus)",
  spam: "我不太理解您的提問。歡迎詢問 GRKU 或 GR 相機相關問題，例如：",
  blocked: "抱歉，我無法回答此問題。歡迎詢問關於 GRKU、底片風格或您的 GR 相機等問題。",
};

const ja: Record<ReplyKey, string> = {
  injection: "動作の仕組みを変えることはできませんが、GRKUやRICOH GRについてならお手伝いできます。次の項目から選んでください。",
  offtopic: "GRKU、RICOH GR、またはGRでの撮影についてのみお手伝いできます。次の項目から選んでください。",
  selfharm: "つらい思いをされているのですね。一人で抱え込まないでください。タイにお住まいの場合は、こころの相談窓口1323に無料で24時間相談できます。それ以外の地域にお住まいの場合は、現地の相談窓口や信頼できる人に連絡してください。",
  personal: "個人情報についてはお答えできません。ご自身のGRKU Plusの購入については、GRKU Plusで「キーをお持ちの方」を選択するか、support@grku.app までお問い合わせください。",
  firmware: "GRKUはカメラのファームウェアを変更しません。また、ファームウェアの書き換え、改変、ハッキングについてはお手伝いできません。公式ファームウェアの更新は、RICOH公式サポートサイトからのみ行ってください。GRKUはSDカードから動作します。[インストールガイド](/guide/)",
  piracy: "GRKU Plusのキーは、サイトでの購入によってのみ入手できます。無料の機能はすべて無料のままです。すべてのルックを無料でプレビューでき、そのうち好きな10種類をSDカードに保存できます。[GRKU Plus](/#plus)",
  spam: "質問を読み取れませんでした。GRKUやGRについて、たとえば次のようなことを聞いてください。",
  blocked: "申し訳ありませんが、その質問にはお答えできません。GRKU、フィルムルック、またはGRについてお尋ねください。",
};

const ko: Record<ReplyKey, string> = {
  injection: "작동 방식을 변경할 수는 없지만, GRKU와 RICOH GR에 관한 질문에는 기꺼이 답변해 드릴게요. 다음 중 하나를 선택해 보세요:",
  offtopic: "GRKU와 RICOH GR, 그리고 이를 활용한 사진 촬영에 관한 질문만 도와드릴 수 있어요. 다음 중 하나를 선택해 보세요:",
  selfharm: "힘든 시간을 보내고 계시군요. 혼자 감당하지 않으셔도 됩니다. 태국에서는 정신건강 상담 전화 1323으로 무료 상담을 24시간 받을 수 있어요. 다른 지역에 계신다면 가까운 상담 기관이나 믿을 수 있는 사람에게 도움을 요청해 주세요.",
  personal: "다른 사람의 개인정보에 관한 요청에는 도움을 드릴 수 없어요. 본인의 GRKU Plus 구매와 관련된 문의라면 GRKU Plus 화면에서 \"키가 있습니다\"를 선택하거나 support@grku.app으로 문의해 주세요.",
  firmware: "GRKU는 카메라 펌웨어를 변경하지 않으며, 펌웨어를 플래싱하거나 수정 또는 해킹하는 방법은 안내할 수 없습니다. 공식 펌웨어 업데이트는 RICOH 공식 지원 사이트에서만 제공됩니다. GRKU는 SD 카드에서 실행됩니다. [설치 안내](/guide/)",
  piracy: "GRKU Plus 키는 사이트에서 구매한 경우에만 제공됩니다. 무료 기능은 계속 무료로 이용할 수 있습니다. 모든 필름 룩을 무료로 미리 볼 수 있으며, 원하는 10개를 SD 카드에 담을 수 있습니다. [GRKU Plus](/#plus)",
  spam: "질문을 이해하지 못했습니다. GRKU나 GR 카메라에 관해 질문해 주세요. 예를 들면 다음과 같습니다.",
  blocked: "죄송합니다. 해당 질문에는 답변할 수 없습니다. GRKU, 필름 룩 또는 GR 카메라에 관해 질문해 주세요.",
};

export const REPLIES: Record<Language, Record<ReplyKey, string>> = {
  en,
  th,
  'zh-Hans': zhHans,
  'zh-Hant': zhHant,
  ja,
  ko,
};
