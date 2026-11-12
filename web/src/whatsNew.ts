// What's new on the site (components/WhatsNew.tsx), newest first. Each item is a key of the
// strings below; the Thai and other translations come from the Gemini tools, never by hand.
import type { Language } from './i18n';

export interface Release {
  version: string;
  /** The release date, YYYY-MM-DD. */
  date: string;
  items: string[];
}

export const RELEASES: Release[] = [
  {
    "version": "1.8.4",
    "date": "2026-11-10",
    "items": [
      "184.1",
      "184.2"
    ]
  },
  {
    "version": "1.8.3",
    "date": "2026-11-10",
    "items": [
      "183.1"
    ]
  },
  {
    "version": "1.8.2",
    "date": "2026-11-10",
    "items": [
      "182.1",
      "182.2"
    ]
  },
  {
    "version": "1.8.1",
    "date": "2026-11-10",
    "items": [
      "181.1",
      "181.2",
      "181.3"
    ]
  },
  {
    "version": "1.8.0",
    "date": "2026-11-10",
    "items": [
      "180.1",
      "180.2",
      "180.3"
    ]
  },
  {
    "version": "1.7.0",
    "date": "2026-11-09",
    "items": [
      "170.1",
      "170.2"
    ]
  },
  {
    "version": "1.6.0",
    "date": "2026-11-09",
    "items": [
      "160.1",
      "160.2",
      "160.3",
      "160.4",
      "160.5",
      "160.6"
    ]
  }
];

const STRINGS: Record<Language, Record<string, string>> = {
  "en": {
    "title": "What's new",
    "lead": "Each update of GRKU, newest first. To update, write the card again from this page, or copy the new package to it.",
    "latest": "New",
    "older": "Earlier updates",
    "full": "Full change list on GitHub",
    "navLabel": "What's new",
    "184.1": "Writing the card is safer: if the write stops halfway, the card still starts GRKU and keeps saving your settings.",
    "184.2": "The FUJIFILM looks have plain descriptions on the site, such as \"Classic Chrome, a film simulation of the FUJIFILM cameras\".",
    "183.1": "Fixed \"mem error\" when you hold MENU and turn the camera on to install. If 1.8.0 to 1.8.2 showed it, write the card again with this version.",
    "182.1": "Date Imprint, Bloom, Halation, and Grain have a Show Icon setting, so you can hide their icon in live view.",
    "182.2": "The GRKU icons in live view line up with the text next to them.",
    "181.1": "The ADJ button now just closes the Recipes page. Only OK applies a recipe.",
    "181.2": "A recipe saved on the camera keeps the exposure settings too.",
    "181.3": "The GRKU icons in live view no longer cover the white balance shift.",
    "180.1": "Ten FUJIFILM film simulations: Provia, Velvia, Astia, Classic Chrome, Classic Neg, Pro Neg Std, Reala Ace, Eterna, Eterna BB, and Acros. They are free and take no slot.",
    "180.2": "Support for the new firmware: GR III 2.21, GR IIIx 1.71, GR IV 1.21, and GR IV Monochrome 1.11.",
    "180.3": "ADJ opens where you left it, even after you turn the camera off.",
    "170.1": "Installation guides in Thai for every camera.",
    "170.2": "The site writes the card and builds GRKU.zip for GR IV again, and the Thai site does too.",
    "160.1": "New modules: Border, Crop (35 to 70 mm), Diffusion (Black Pro-Mist), and Light Leak.",
    "160.2": "Recipes: save a whole look with its camera settings and switch to it in one step in ADJ. Add popular recipes from this site.",
    "160.3": "U1 to U3 of the mode dial can keep your GRKU settings or apply a recipe.",
    "160.4": "Enable at Start: choose whether GRKU is on each time you turn the camera on.",
    "160.5": "The film library grows to over 100 looks, each with a film box icon in the colors of the real box.",
    "160.6": "GRKU starts faster when you turn the camera on."
  },
  "zh-Hans": {
    "title": "更新日志",
    "lead": "GRKU 各版本更新，按时间倒序排列。如需更新，请通过本页面重新写入存储卡，或将新固件包复制至卡中。",
    "latest": "最新",
    "older": "历史更新",
    "full": "在 GitHub 查看完整更新列表",
    "navLabel": "更新日志",
    "184.1": "提高存储卡写入安全性：若写入中断，存储卡仍可正常启动 GRKU 并保留您的设置。",
    "184.2": "网站上为 FUJIFILM 色彩风格补充了简明说明，例如“Classic Chrome，源自 FUJIFILM 相机的胶片模拟”。",
    "183.1": "修复了按住 MENU 键开机安装时出现“mem error”的问题。若在 1.8.0 至 1.8.2 版本中遇到此错误，请使用此版本重新写入存储卡。",
    "182.1": "日期打印、柔焦、光晕和颗粒效果新增“显示图标”设置，可在实时取景中隐藏对应图标。",
    "182.2": "实时取景中的 GRKU 图标现与相邻文本保持对齐。",
    "181.1": "ADJ 键调整为仅退出配方页面，仅在按 OK 键时应用配方。",
    "181.2": "相机中保存的配方现可同时保留曝光设置。",
    "181.3": "实时取景中的 GRKU 图标不再遮挡白平衡微调信息。",
    "180.1": "新增 10 种 FUJIFILM 胶片模拟：Provia、Velvia、Astia、Classic Chrome、Classic Neg、Pro Neg Std、Reala Ace、Eterna、Eterna BB 与 Acros。完全免费且不占用自定义槽位。",
    "180.2": "支持最新固件版本：GR III 2.21、GR IIIx 1.71、GR IV 1.21 及 GR IV Monochrome 1.11。",
    "180.3": "关机后重新开机，ADJ 菜单仍将保留上次停留的位置。",
    "170.1": "新增全系列相机的泰语安装指南。",
    "170.2": "网站已恢复为 GR IV 写入存储卡并构建 GRKU.zip 的功能，泰语网站同步恢复。",
    "160.1": "新增功能模块：边框、裁剪（35 至 70 mm）、柔光滤镜（黑柔）及漏光。",
    "160.2": "配方功能：保存色彩风格及相机参数，可在 ADJ. 模式下一键切换。支持添加本站热门配方。",
    "160.3": "模式拨盘的 U1 至 U3 档位可保留 GRKU 设置或直接调用配方。",
    "160.4": "开机启用：可设置每次开机时是否默认开启 GRKU。",
    "160.5": "胶片库扩展至 100 多款风格，均配有还原真实包装配色的胶卷图标。",
    "160.6": "提升了相机开机时 GRKU 的启动速度。"
  },
  "zh-Hant": {
    "title": "最新消息",
    "lead": "GRKU 各版本更新記錄，依發布時間由新至舊排列。如需更新，請於此頁面重新寫入記憶卡，或將新版本套件複製至記憶卡中。",
    "latest": "最新",
    "older": "歷次更新",
    "full": "至 GitHub 查看完整更新清單",
    "navLabel": "最新消息",
    "184.1": "提升記憶卡寫入安全性：即使寫入過程意外中斷，記憶卡仍可正常啟動 GRKU 並保留各項設定。",
    "184.2": "網站上針對 FUJIFILM 色彩風格提供清楚的說明，例如「Classic Chrome：FUJIFILM 相機的底片模擬風格」。",
    "183.1": "已修復安裝時按住 MENU 鍵開機出現「mem error」的問題。若使用 1.8.0 至 1.8.2 版本時曾遇到此錯誤，請使用此版本重新寫入記憶卡。",
    "182.1": "日期打印、柔光、光暈與顆粒效果新增「顯示圖示」設定，可選擇在即時預覽畫面中隱藏對應圖示。",
    "182.2": "即時預覽畫面中的 GRKU 圖示已調整為與相鄰文字齊平。",
    "181.1": "現在按 ADJ 鍵僅會關閉色彩配方選單，需按 OK 鍵才會套用所選配方。",
    "181.2": "於相機內儲存色彩配方時，亦會一併保留當前的曝光設定。",
    "181.3": "即時預覽畫面中的 GRKU 圖示不再遮擋白平衡偏移顯示。",
    "180.1": "新增十款 FUJIFILM 底片模擬風格：Provia、Velvia、Astia、Classic Chrome、Classic Neg、Pro Neg Std、Reala Ace、Eterna、Eterna BB 與 Acros。完全免費且不佔用使用者風格欄位。",
    "180.2": "支援最新相機韌體版本：GR III 2.21、GR IIIx 1.71、GR IV 1.21 以及 GR IV Monochrome 1.11。",
    "180.3": "按下 ADJ 鍵時將直接返回上次停留的選單位置，相機重新開機後依然有效。",
    "170.1": "新增各款相機的泰文安裝指南。",
    "170.2": "官方網站與泰文站點皆已恢復支援 GR IV 的記憶卡寫入及 GRKU.zip 封裝檔案產生功能。",
    "160.1": "新增擴充功能：邊框效果、裁切（35 至 70 mm）、柔焦濾鏡（黑柔焦鏡）與漏光效果。",
    "160.2": "色彩配方：儲存完整色彩外觀與相機設定，可於 ADJ. 模式一鍵切換。亦可自本網站加入熱門配方。",
    "160.3": "模式轉盤 U1 至 U3 可保留您的 GRKU 設定，或直接套用配方。",
    "160.4": "開機時啟用：設定每次開啟相機時是否自動啟動 GRKU。",
    "160.5": "底片庫擴充至 100 種以上外觀，各配方均具備原廠包裝配色之底片盒圖示。",
    "160.6": "縮短開機時 GRKU 的啟動時間。"
  },
  "ja": {
    "title": "更新履歴",
    "lead": "GRKUの各バージョンの更新履歴です（新しい順）。アップデートするには、このページからSDカードに再度書き込むか、新しいパッケージをカードにコピーしてください。",
    "latest": "新着",
    "older": "過去のアップデート",
    "full": "GitHubですべての更新履歴を見る",
    "navLabel": "更新履歴",
    "184.1": "SDカードへの書き込みの安全性が向上：途中で書き込みが中断された場合でもGRKUが正常に起動し、設定の保存を維持します。",
    "184.2": "サイト上でFUJIFILM調の各ルックに説明文を追加（例：「クラシッククローム：FUJIFILMカメラのフィルムシミュレーション」）。",
    "183.1": "MENUボタンを押しながら電源を入れた際（インストール時）に「mem error」と表示される不具合を修正。1.8.0〜1.8.2で発生した場合は、本バージョンでカードに再度書き込んでください。",
    "182.1": "日付写し込み、ブルーム、ハレーション、粒状感に「アイコン表示」設定を追加。ライブビュー上のアイコンを非表示にできます。",
    "182.2": "ライブビュー上のGRKUアイコンと隣接するテキストの配置を揃えました。",
    "181.1": "ADJ.レバー／ボタンの動作を変更：レシピ画面を閉じるのみとなり、OKボタンでのみレシピが適用されます。",
    "181.2": "カメラ本体に保存されたレシピに、露出設定も保持されるように改善。",
    "181.3": "ライブビュー表示時に、GRKUアイコンがホワイトバランス微調整の表示と重ならないよう修正。",
    "180.1": "FUJIFILMのフィルムシミュレーション10種に対応：PROVIA、Velvia、ASTIA、クラシッククローム、クラシックネガ、PRO Neg.Std、REALA ACE、ETERNA、ETERNA ブリーチバイパス、ACROS。スロットを消費せず無料で利用可能。",
    "180.2": "最新ファームウェアに対応：GR III（Ver. 2.21）、GR IIIx（Ver. 1.71）、GR IV（Ver. 1.21）、GR IV Monochrome（Ver. 1.11）。",
    "180.3": "電源をオフにしても、ADJ.メニューが前回終了時の位置を保持して開くように改善。",
    "170.1": "全機種のタイ語版インストールガイドを追加。",
    "170.2": "本サイトおよびタイ語版サイトにおいて、GR IV向けのSDカード書き込みおよびGRKU.zipの生成機能を再開。",
    "160.1": "新機能モジュールを追加：ボーダー（枠）、クロップ（35〜70mm）、ディフュージョン（Black Pro-Mist調）、ライトリーク（光漏れ）。",
    "160.2": "レシピ機能：画作りとカメラ設定をまとめて保存し、ADJ.から素早く呼び出せます。本サイトの人気レシピの追加にも対応しました。",
    "160.3": "モードダイヤルのU1〜U3に、GRKUの設定の保持やレシピの割り当てが可能になりました。",
    "160.4": "起動時有効設定：カメラの電源を入れた際に、GRKUを自動で有効にするか選択できるようになりました。",
    "160.5": "フィルムライブラリが100種類以上に拡充。実物のパッケージカラーを再現したフィルム箱アイコンが付きました。",
    "160.6": "カメラ起動時のGRKUの立ち上がり速度を向上しました。"
  },
  "ko": {
    "title": "새로운 기능",
    "lead": "GRKU의 업데이트 내역입니다(최신순). 업데이트하려면 이 페이지에서 카드를 다시 쓰거나 새 패키지를 카드에 복사하십시오.",
    "latest": "최신",
    "older": "이전 업데이트",
    "full": "GitHub에서 전체 변경 사항 보기",
    "navLabel": "새로운 기능",
    "184.1": "카드 쓰기 안정성 향상: 쓰기 작업이 도중에 중단되어도 카드가 GRKU를 정상적으로 실행하며 설정을 계속 유지합니다.",
    "184.2": "웹사이트에서 \"후지필름 카메라의 필름 시뮬레이션인 Classic Chrome\"과 같이 FUJIFILM 룩에 대한 명확한 설명을 제공합니다.",
    "183.1": "MENU 버튼을 누른 상태로 카메라를 켜서 설치할 때 발생하던 \"mem error\"를 수정했습니다. 1.8.0~1.8.2 버전에서 해당 오류가 표시된 경우, 본 버전으로 카드를 다시 쓰십시오.",
    "182.1": "날짜 삽입, 블룸, 할레이션, 그레인 기능에 아이콘 표시 설정이 추가되어 라이브 뷰에서 해당 아이콘을 숨길 수 있습니다.",
    "182.2": "라이브 뷰의 GRKU 아이콘이 인접한 텍스트의 정렬과 일치하도록 조정되었습니다.",
    "181.1": "이제 ADJ 버튼을 누르면 레시피 페이지만 닫힙니다. OK 버튼을 눌러야만 레시피가 적용됩니다.",
    "181.2": "카메라에 저장된 레시피에 노출 설정도 함께 유지됩니다.",
    "181.3": "라이브 뷰의 GRKU 아이콘이 화이트 밸런스 보정 표시를 더 이상 가리지 않습니다.",
    "180.1": "FUJIFILM 필름 시뮬레이션 10종 추가: Provia, Velvia, Astia, Classic Chrome, Classic Neg, Pro Neg Std, Reala Ace, Eterna, Eterna BB, Acros. 슬롯을 차지하지 않으며 무료로 제공됩니다.",
    "180.2": "신규 펌웨어 지원: GR III 2.21, GR IIIx 1.71, GR IV 1.21, GR IV Monochrome 1.11.",
    "180.3": "카메라 전원을 껐다 켜도 ADJ 메뉴가 마지막으로 사용했던 위치에서 열립니다.",
    "170.1": "모든 카메라 기종에 대한 태국어 설치 가이드가 추가되었습니다.",
    "170.2": "웹사이트(태국어 사이트 포함)에서 GR IV용 카드 쓰기 및 GRKU.zip 생성을 다시 지원합니다.",
    "160.1": "신규 모듈 추가: 테두리, 크롭(35~70mm), 디퓨전(Black Pro-Mist), 빛 번짐.",
    "160.2": "레시피: 카메라 설정과 전체 룩을 저장하고 한 번에 전환할 수 있습니다. 웹사이트에서 인기 레시피를 추가해 보세요.",
    "160.3": "모드 다이얼의 U1~U3에 기존 설정을 유지하거나 새 레시피를 지정할 수 있습니다.",
    "160.4": "시작 시 활성화: 카메라를 켤 때 GRKU를 자동으로 실행할지 설정합니다.",
    "160.5": "실제 필름 패키지 색상을 반영한 아이콘과 함께 100종 이상의 필름 룩을 제공합니다.",
    "160.6": "카메라를 켤 때 GRKU가 더 빠르게 시작됩니다."
  },
  "th": {
    "title": "มีอะไรใหม่",
    "lead": "รวมทุกอัปเดตของ GRKU เรียงจากใหม่ไปเก่า อัปเดตได้โดยเขียนข้อมูลลงการ์ดใหม่จากหน้านี้ หรือคัดลอกไฟล์เวอร์ชันใหม่ลงในการ์ด",
    "latest": "ใหม่",
    "older": "อัปเดตก่อนหน้า",
    "full": "ดูรายการเปลี่ยนแปลงทั้งหมดบน GitHub",
    "navLabel": "มีอะไรใหม่",
    "184.1": "เขียนการ์ดได้ปลอดภัยขึ้น แม้จะหยุดเขียนกะทันหัน การ์ดยังคงเปิดใช้งาน GRKU ได้และบันทึกการตั้งค่าไว้เหมือนเดิม",
    "184.2": "เพิ่มคำอธิบายโทนสีของ FUJIFILM บนเว็บไซต์ให้อ่านง่าย เช่น \"Classic Chrome โทนสีจำลองฟิล์มของกล้อง FUJIFILM\"",
    "183.1": "แก้ปัญหา \"mem error\" เมื่อกด MENU ค้างไว้แล้วเปิดกล้องเพื่อติดตั้ง หากเคยพบปัญหานี้ในเวอร์ชัน 1.8.0 ถึง 1.8.2 ให้เขียนข้อมูลลงการ์ดใหม่ด้วยเวอร์ชันนี้",
    "182.1": "Date Imprint, Bloom, Halation และ Grain เพิ่มตัวเลือก แสดงไอคอน เพื่อซ่อนไอคอนในหน้าจอถ่ายภาพ (Live View) ได้",
    "182.2": "จัดตำแหน่งไอคอน GRKU ในหน้าจอถ่ายภาพให้ตรงกับข้อความด้านข้าง",
    "181.1": "ปุ่ม ADJ จะทำหน้าที่แค่ปิดหน้าสูตรสีเท่านั้น ต้องกด OK เพื่อเลือกใช้สูตรสี",
    "181.2": "สูตรสีที่บันทึกลงกล้องจะจำค่าการเปิดรับแสงไว้ด้วย",
    "181.3": "ไอคอน GRKU ในหน้าจอถ่ายภาพไม่บังการปรับชดเชยไวต์บาลานซ์ (WB Shift) แล้ว",
    "180.1": "เพิ่มฟิล์มซิมูเลชันของ FUJIFILM 10 แบบ ได้แก่ Provia, Velvia, Astia, Classic Chrome, Classic Neg, Pro Neg Std, Reala Ace, Eterna, Eterna BB และ Acros ใช้ฟรีโดยไม่เปลืองช่องบันทึก",
    "180.2": "รองรับเฟิร์มแวร์ใหม่ GR III 2.21, GR IIIx 1.71, GR IV 1.21 และ GR IV Monochrome 1.11",
    "180.3": "เมนู ADJ จะเปิดค้างไว้ที่หน้าล่าสุด แม้จะปิดกล้องไปแล้วก็ตาม",
    "170.1": "เพิ่มคู่มือการติดตั้งภาษาไทยสำหรับกล้องทุกรุ่น",
    "170.2": "เว็บไซต์กลับมาเขียนการ์ดและสร้างไฟล์ GRKU.zip สำหรับ GR IV ได้แล้ว รวมถึงบนเว็บไซต์ภาษาไทยด้วย",
    "160.1": "เพิ่มโมดูลใหม่ Border, Crop (35 ถึง 70 มม.), Diffusion (Black Pro-Mist) และ Light Leak",
    "160.2": "สูตรสี: บันทึกโทนภาพพร้อมการตั้งค่ากล้อง แล้วสลับใช้ได้ทันทีจากปุ่ม ADJ และยังเพิ่มสูตรสียอดนิยมจากเว็บนี้ได้ด้วย",
    "160.3": "โหมด U1 ถึง U3 บนแป้นหมุนสามารถจำค่า GRKU ที่ตั้งไว้ หรือจะผูกเข้ากับสูตรสีก็ได้",
    "160.4": "เปิดใช้เมื่อเริ่ม: เลือกว่าจะให้ GRKU ทำงานทันทีทุกครั้งที่เปิดกล้องหรือไม่",
    "160.5": "คลังฟิล์มเพิ่มขึ้นเป็นกว่า 100 โทน มาพร้อมไอคอนกล่องฟิล์มตามสีของกล่องจริง",
    "160.6": "GRKU พร้อมใช้งานเร็วขึ้นเมื่อเปิดกล้อง"
  }
};

export type NewsStrings = typeof STRINGS.en & Record<string, string>;

export function newsStrings(language: Language): NewsStrings {
  return (STRINGS[language] ?? STRINGS.en) as NewsStrings;
}
