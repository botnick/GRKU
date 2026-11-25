// The "Learn" section of the assistant's knowledge pack (knowledge.ts): short explainers of
// photography basics as they relate to shooting with a RICOH GR and GRKU. General photography
// fundamentals and GRKU's own facts only, no invented numbers. English; the assistant answers in
// the visitor's language.

const TOPICS: readonly { tags: readonly string[]; text: string }[] = [
  {
    tags: ['exposure', 'bright', 'dark', 'compensation', 'ev', 'สว่าง', 'มืด', 'ชดเชย', 'แสง', '曝光', '露出', '노출'],
    text: 'Exposure compensation: the GR meters a scene and you nudge it with exposure compensation. Plus (+) brightens: use it for backlit people, snow, sand, or white walls, which the meter makes too dark. Minus (−) darkens: use it to keep a bright sky or lamps from turning white, and for a moody night look. Slide looks (Velvia, Provia, Kodachrome, Ektachrome) have strong contrast and lose highlights easily, so a little minus is a common starting point in bright light. Film Look shows on the live view, so you can judge before you shoot.',
  },
  {
    tags: ['iso', 'noise', 'grain', 'เกรน', 'นอยส์', 'ไอเอสโอ', '噪点', '雑音', 'ノイズ', '노이즈'],
    text: 'ISO and grain: ISO is how much the camera amplifies the light. Higher ISO lets you use a faster shutter in dim light but adds digital noise; lower ISO is cleaner. Keep ISO as low as the light allows while the shutter stays fast enough to avoid blur. Film grain is different from noise: it is a texture you add for the look. GRKU\'s Grain module adds film grain in four strengths and sizes (System is the camera\'s own grain; Film-like draws color-negative grain, strongest in the midtones). It shows on photos, not on the live view.',
  },
  {
    tags: ['shutter', 'blur', 'shake', 'speed', 'sr', 'stabiliz', 'ชัตเตอร์', 'เบลอ', 'สั่น', '快门', '快門', 'シャッター', '셔터'],
    text: 'Shutter speed and shake: a slow shutter blurs moving subjects and shows hand shake. The GR III, GR IIIx, and GR IV have shake reduction (SR) in the body, which helps you hand-hold slower shutter speeds of still subjects; it does not freeze moving people. Brace yourself, breathe out, and press the shutter gently.',
  },
  {
    tags: ['white balance', 'wb', 'tungsten', 'indoor', 'yellow', 'blue', 'ไวท์บาลานซ์', 'สมดุลแสงขาว', 'ในร่ม', 'ติดเหลือง', 'ติดฟ้า', '白平衡', 'ホワイトバランス', '화이트'],
    text: 'White balance: it decides what the camera treats as neutral white. Auto works for most scenes. Daylight white balance keeps the warm glow of sunset and of indoor lamps. Under orange tungsten light, a tungsten cinema look (Vision3 500T, Eterna 500T) gives the cool, cinematic look of CineStill 800T-style night photos; in daylight the same looks turn blue. Daylight film looks (Portra, Gold, Ektar) are made for daylight and turn warm under lamps.',
  },
  {
    tags: ['focus', 'snap', 'street', 'sharp', 'โฟกัส', 'สแนป', 'สตรีท', 'คมชัด', '对焦', '對焦', 'フォーカス', '스냅', '초점'],
    text: 'Snap focus and street photography: the GR has snap focus, a preset focus distance that it uses when you press the shutter all the way at once, so there is no wait for autofocus. A distance of about 2 to 2.5 m with a smaller aperture keeps most of a street scene sharp. For close subjects, half-press to autofocus as usual.',
  },
  {
    tags: ['crop', 'xpan', 'panorama', 'framing', '50mm', '35mm', 'ratio', 'square', 'ครอป', 'พาโนรามา', 'อัตราส่วน', 'จัตุรัส', '裁剪', '裁切', 'クロップ', '크롭'],
    text: 'Framing and crops: the Crop module crops photos to 35, 40, 50, or 70 mm (50 to 100 mm on GR IIIx) for a tighter view; a crop keeps fewer pixels. The Framing module shoots XPan 65:24 panoramas and other ratios (2.35:1, 16:9, 4:3, 5:4, 7:6, 1:1, 3:4); the screen dims the rest, and Guides adds thirds, center, golden ratio, or diagonals inside the frame.',
  },
  {
    tags: ['difference', 'vs', 'compare', 'portra', 'gold', 'classic chrome', 'classic neg', 'ektar', 'velvia', 'tri-x', 'acros', 'ต่างกัน', 'เทียบ', 'อันไหนดี', '区别', '區別', '違い', '차이'],
    text: 'How film looks differ: Portra 400 gives natural skin and soft, gentle contrast; the safe choice for people. Gold 200 is warmer and more saturated with a nostalgic yellow tint; everyday sunny snaps. Ektar 100 is very vivid and fine-grained; landscapes and travel. Ultramax 400 is bright and punchy everyday color. Classic Chrome has muted color and firmer tones for a documentary feel; Classic Neg has more contrast and cool, cyan-leaning shadows. Velvia is the most saturated slide look; Provia is a balanced slide look. Cinema looks (Vision3, Eterna) have a wide range and a filmic grade; the 500T versions are for tungsten light. Black and white: Tri-X is classic and gritty with strong contrast, HP5 is medium-contrast for street and available light, Acros is fine-grained and smooth.',
  },
  {
    tags: ['scene', 'portrait', 'skin', 'people', 'landscape', 'sky', 'sea', 'night', 'city', 'food', 'cafe', 'travel', 'overcast', 'cloudy', 'ภาพคน', 'ผิว', 'วิว', 'ท้องฟ้า', 'กลางคืน', 'เมือง', 'อาหาร', 'คาเฟ่', 'เที่ยว', 'ฟ้าครึ้ม', '人像', '夜景', '风景', '風景', '人物', '야경', '인물'],
    text: 'Picking a look for a scene: people and skin: Portra 400, Pro 400H, Xtra 400. Landscapes, sky, and sea: Ektar 100, Velvia 100, Provia 100F. Night city under lamps: Vision3 500T, Eterna 500T, with the Glow module for halation around lights. Overcast days: a warm look such as Gold 200 or Ultramax 400 adds life. Food and cafés: Portra or Gold for warm, appetizing color. Street in black and white: Tri-X 400 or HP5 Plus 400. Try any of them on your own photos first on /develop/.',
  },
  {
    tags: ['night', 'dark', 'low light', 'กลางคืน', 'มืด', 'แสงน้อย', '夜', '夜景', '야간'],
    text: 'Night photos: hold the camera steady and let shake reduction help; raise ISO enough to keep the shutter fast for people; use a little minus exposure compensation so lights and signs keep their color. Tungsten cinema looks (Vision3 500T, Eterna 500T) suit streets under lamps. The Glow module adds bloom and film halation around lights, and Diffusion adds the soft glow of a Black Pro-Mist filter; neither shows on the live view, so check the photo after the shot.',
  },
  {
    tags: ['diffusion', 'glow', 'mist', 'halation', 'bloom', 'soft', 'dreamy', 'leak', 'date', 'border', 'ฟุ้ง', 'นุ่ม', 'ฝัน', 'แสงรั่ว', 'วันที่', 'ขอบ', '柔焦', '光晕', 'ソフト', '부드'],
    text: 'When to use the effect modules: Diffusion (Black Pro-Mist 1/8, 1/4, 1/2) softens highlights and gives a gentle glow, good for portraits and night lights; Film Softness on its own makes detail fall off like a film scan. Glow adds bloom and red film halation around bright points. Light Leak adds vignette, dust, leaks, and scratches for a worn film feel. Date Imprint prints a film-camera date in a corner. Border adds a white or black frame. Grain adds film texture. These work on photos, not on the live view.',
  },
  {
    tags: ['card', 'not detected', 'reader', 'connect', 'usb', 'การ์ด', 'ไม่เจอ', 'เชื่อมต่อ', '读卡', 'カード', '카드'],
    text: 'Troubleshooting the card: the site writes the card through a card reader on a computer in Chrome or Edge; the camera\'s USB cable does not work for this. On a phone, Safari, or Firefox, download GRKU.zip and copy the contents of SD_ROOT to the card root. If GRKU does not show in ADJ, wait 8 to 10 seconds after power-on (longer on GR IV and on the first start), and hold MENU at power-on once the first time.',
  },
];

export const LEARN = {
  tags: [...new Set(TOPICS.flatMap((topic) => topic.tags))],
  text: TOPICS.map((topic) => topic.text).join('\n'),
};
