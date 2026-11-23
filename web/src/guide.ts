// The text of the install guide page (components/Guide.tsx). The page also reuses the strings of
// the install (i18n.ts) where the text is the same. The translations come from the Gemini tools
// (grku-tools/i18n-th.mjs), never by hand.
import type { Language } from './i18n';

const en = {
  /** Browser tab title and search result title of the install guide page. */
  title: 'How to install GRKU on a RICOH GR · GRKU',
  /** Search result and link preview description of the install guide page. */
  description: 'Install GRKU step by step: write it to the SD card from Chrome or Edge, or copy GRKU.zip yourself, then start it once on the camera. How to update and uninstall, too.',
  /** Main H1 heading of the beginner install guide page. */
  heading: 'How to install GRKU',
  /** One line under the H1 heading. */
  lead: 'Put GRKU on your SD card, then start it once on the camera. The camera firmware does not change.',
  /** Item in a 'You need' list; the names of the supported cameras follow on the next line. */
  needCamera: 'A supported RICOH GR',
  /** Item in a 'You need' list. */
  needCard: 'An SD card',
  /** Heading of step 1 of the guide. */
  putTitle: 'Put GRKU on the SD card',
  /** Under the step 1 heading, before two tabs: write from the browser, or download a ZIP. */
  putLead: 'Choose one of two ways.',
  /** Small line under the tab 'Write to the SD card' (the recommended way). */
  cardSub: 'Chrome or Edge on a computer. The site writes the files for you.',
  /** Numbered step in the browser-write way. */
  openSite: 'On a computer, open grku.app in Chrome or Edge.',
  /** Numbered step; a note under it says the camera's USB connection won't work. */
  reader: 'Put the SD card in a card reader.',
  /** Numbered step: open the install wizard of the site and pick options. */
  pick: 'Open the install page. Choose your film looks, your camera, and the extras.',
  /** Numbered step; the button label 'Connect SD card' is shown as a button picture right under this text. */
  connect: 'On the last step, press this button. Then select the card itself and allow editing.',
  /** Numbered step; the button 'Install GRKU' is shown under this text. */
  write: 'Check what will change, then press this button.',
  /** Small note under the write step. */
  confirmNote: 'Nothing on the card changes until you confirm.',
  /** Numbered step in the ZIP way; the button 'Download GRKU.zip' is shown under it. */
  download: 'On the last step, press this button.',
  /** Small note under 'Unzip GRKU.zip on your computer.'. */
  unzipNote: 'Some browsers unzip it for you.',
  /** Small note under the step that copies the contents of SD_ROOT to the card; SCRIPT is a folder name, keep it. */
  copyNote: 'The top level of the card then has the SCRIPT folder.',
  /** Button that opens the install wizard. */
  start: 'Start installing',
  /** Heading of step 2 of the guide: what to do on the camera the first time. */
  cameraTitle: 'Start GRKU on the camera',
  /** Line under that heading. SD scripts = a setting of the camera. */
  cameraLead: 'Do this only the first time. It turns on SD scripts, the camera setting that lets it run GRKU from the card.',
  /** Small note under 'Hold MENU while you turn the camera on, then wait until it turns itself off.' Mode Set Command and Complete are English texts on the camera screen, keep them in English. */
  modeSetNote: 'The screen shows Mode Set Command and Complete. Then the camera turns off by itself.',
  /** Numbered step; GRKU shows as a word at the top of the camera screen. */
  powerOn: 'Turn the camera on normally. After a few seconds, GRKU shows at the top of the screen.',
  /** Small note under that step. */
  firstSlow: 'The first start after an install takes longer.',
  /** Highlighted note at the end of the camera steps. MENU is the camera button name. */
  once: 'You hold MENU only this first time. The setting stays on for every card, and updates do not need it.',
  /** Heading of step 3 of the guide: using GRKU on the camera. */
  useTitle: 'Use GRKU',
  /** Line under that heading. ADJ is a lever on the camera, keep ADJ. */
  useLead: 'GRKU is in the ADJ lever while you shoot.',
  /** Numbered step. */
  adj: 'While you shoot, press the ADJ lever.',
  /** Numbered step: GRKU is the sixth entry of the ADJ menu. */
  sixth: 'Choose the sixth entry, GRKU.',
  /** Numbered step; OK is the camera button. */
  look: 'Highlight a film look to see it on the screen. Press OK to keep it.',
  /** Note after the steps. MENU is the camera button; Customize tab (C) is a tab of the camera menu, keep (C). */
  menu: 'Every setting is also in MENU. Open the Customize tab (C): the GRKU section is at the end.',
  /** Section heading. */
  updateTitle: 'Update GRKU later',
  /** Line before a button picture (Update GRKU or Uninstall GRKU) in the update and uninstall sections. */
  withBrowser: 'With Chrome or Edge: connect the card on the last step of the install, then press this button.',
  /** Label before a numbered list of manual steps with the downloaded ZIP. */
  byHand: 'By hand, with GRKU.zip:',
  /** Note in the update section; GRKU is a folder name here. */
  updateKeep: 'GRKU keeps your settings in the GRKU folder, so an update keeps them.',
  /** Note under 'Turn off SD scripts' in the uninstall section. */
  scriptsOffWhere: 'The last step of the install can write the files that turn SD scripts off, or download them.',
  /** Section heading: troubleshooting. */
  helpTitle: 'If something goes wrong',
  /** Troubleshooting question (problem). */
  firmwareQ: 'The camera starts a firmware update when you hold MENU.',
  /** Answer; .bin is a file extension. */
  firmwareA: 'The card has a firmware file. Turn the camera off, delete each .bin file from the top level of the card, then try again.',
  /** Troubleshooting problem; Mode Set Command is the English text on the camera screen, keep it. */
  modeSetQ: 'The camera does not show Mode Set Command.',
  /** Answer; DCIM is a folder name. */
  modeSetA: 'Hold MENU first, then turn the camera on. Check that the files are at the top level of the card, not in DCIM or another folder.',
  /** Troubleshooting problem: the camera hangs during power-on. */
  stuckQ: 'The camera stops while it starts up.',
  /** Answer; a link to the recovery guide follows. */
  stuckA: 'Turn the camera off. If it does not respond, take out the battery. Remove the SD card, then turn the camera on without it. The recovery guide has every step.',
  /** Label of a small table of contents. */
  onThisPage: 'On this page',
};

export type GuideStrings = typeof en;

const th: GuideStrings = {
  title: 'วิธีติดตั้ง GRKU บน RICOH GR · GRKU',
  description: 'ติดตั้ง GRKU ทีละขั้นตอน: เขียนไฟล์ลงการ์ด SD ผ่าน Chrome หรือ Edge หรือคัดลอกไฟล์จาก GRKU.zip เอง แล้วเปิด GRKU บนกล้องหนึ่งครั้ง พร้อมวิธีอัปเดตและถอนการติดตั้ง',
  heading: 'วิธีติดตั้ง GRKU',
  lead: 'ใส่ GRKU ลงในการ์ด SD แล้วเปิดบนกล้องหนึ่งครั้ง โดยไม่เปลี่ยนเฟิร์มแวร์ของกล้อง',
  needCamera: 'กล้อง RICOH GR รุ่นที่รองรับ',
  needCard: 'การ์ด SD',
  putTitle: 'ใส่ GRKU ลงในการ์ด SD',
  putLead: 'เลือกได้ 2 วิธี',
  cardSub: 'ใช้ Chrome หรือ Edge บนคอมพิวเตอร์ เว็บไซต์จะเขียนไฟล์ให้',
  openSite: 'เปิด grku.app ใน Chrome หรือ Edge บนคอมพิวเตอร์',
  reader: 'ใส่การ์ด SD ในเครื่องอ่านการ์ด',
  pick: 'เปิดหน้าติดตั้ง แล้วเลือกฟิล์มลุค กล้อง และตัวเลือกเพิ่มเติม',
  connect: 'ในขั้นตอนสุดท้าย กดปุ่มนี้ แล้วเลือกตัวการ์ดและอนุญาตให้แก้ไขไฟล์',
  write: 'ตรวจสอบสิ่งที่จะเปลี่ยนแปลง แล้วกดปุ่มนี้',
  confirmNote: 'จะไม่มีการเปลี่ยนแปลงใด ๆ บนการ์ดจนกว่าคุณจะยืนยัน',
  download: 'ในขั้นตอนสุดท้าย กดปุ่มนี้',
  unzipNote: 'บางเบราว์เซอร์จะแตกไฟล์ให้โดยอัตโนมัติ',
  copyNote: 'เมื่อคัดลอกแล้ว โฟลเดอร์ SCRIPT จะอยู่ที่ระดับบนสุดของการ์ด',
  start: 'เริ่มติดตั้ง',
  cameraTitle: 'เปิด GRKU บนกล้อง',
  cameraLead: 'ทำขั้นตอนนี้แค่ครั้งแรกเท่านั้น เพื่อเปิดใช้ SD scripts ซึ่งเป็นการตั้งค่ากล้องที่อนุญาตให้กล้องเรียกใช้ GRKU จากการ์ดได้',
  modeSetNote: 'หน้าจอจะแสดง Mode Set Command และ Complete จากนั้นกล้องจะปิดเอง',
  powerOn: 'เปิดกล้องตามปกติ รอสักครู่ แล้ว GRKU จะปรากฏที่ด้านบนของหน้าจอ',
  firstSlow: 'การเปิดใช้งานครั้งแรกหลังติดตั้งจะใช้เวลานานกว่าปกติ',
  once: 'กด MENU แค่ครั้งแรกเท่านั้น การตั้งค่านี้จะยังคงเปิดอยู่กับการ์ดทุกใบ และไม่จำเป็นต้องทำอีกเมื่ออัปเดต',
  useTitle: 'ใช้งาน GRKU',
  useLead: 'ระหว่างถ่ายภาพ สามารถเลือก GRKU ได้จากก้าน ADJ',
  adj: 'ระหว่างถ่ายภาพ กดก้าน ADJ',
  sixth: 'เลือกรายการที่ 6 ซึ่งก็คือ GRKU',
  look: 'เลื่อนไปที่ฟิล์มลุคที่ต้องการเพื่อดูตัวอย่างบนหน้าจอ แล้วกด OK เพื่อเลือก',
  menu: 'การตั้งค่าทั้งหมดอยู่ใน MENU ด้วย เปิดแท็บ Customize (C) แล้วจะพบหมวด GRKU อยู่ท้ายสุด',
  updateTitle: 'อัปเดต GRKU ในภายหลัง',
  withBrowser: 'ใช้ Chrome หรือ Edge: เชื่อมต่อการ์ดในขั้นตอนสุดท้ายของการติดตั้ง แล้วกดปุ่มนี้',
  byHand: 'ทำเองด้วย GRKU.zip:',
  updateKeep: 'GRKU จะเก็บการตั้งค่าของคุณไว้ในโฟลเดอร์ GRKU ดังนั้นเมื่ออัปเดต การตั้งค่าเดิมจะยังอยู่',
  scriptsOffWhere: 'ในขั้นตอนสุดท้ายของการติดตั้ง คุณสามารถเขียนไฟล์สำหรับปิด SD scripts ลงในการ์ด หรือดาวน์โหลดไฟล์เหล่านั้นได้',
  helpTitle: 'หากพบปัญหา',
  firmwareQ: 'กล้องเริ่มอัปเดตเฟิร์มแวร์เมื่อกด MENU ค้างไว้',
  firmwareA: 'ในการ์ดมีไฟล์เฟิร์มแวร์อยู่ ปิดกล้อง ลบไฟล์ .bin ทุกไฟล์ที่อยู่ในระดับบนสุดของการ์ด แล้วลองอีกครั้ง',
  modeSetQ: 'กล้องไม่แสดง Mode Set Command',
  modeSetA: 'กดปุ่ม MENU ค้างไว้ก่อน แล้วเปิดกล้อง ตรวจสอบว่าไฟล์อยู่ที่ระดับบนสุดของการ์ด ไม่ได้อยู่ในโฟลเดอร์ DCIM หรือโฟลเดอร์อื่น',
  stuckQ: 'กล้องค้างระหว่างเปิดเครื่อง',
  stuckA: 'ปิดกล้อง หากกล้องไม่ตอบสนอง ให้ถอดแบตเตอรี่ออก ถอดการ์ด SD แล้วลองเปิดกล้องโดยไม่ใส่การ์ด ดูขั้นตอนทั้งหมดได้ในคู่มือกู้คืนระบบ',
  onThisPage: 'ในหน้านี้',
};

const zhHans: GuideStrings = {
  title: '如何在 RICOH GR 上安装 GRKU · GRKU',
  description: '逐步安装 GRKU：通过 Chrome 或 Edge 将文件写入 SD 卡，或自行复制 GRKU.zip 中的文件，然后在相机上启动一次。本指南还介绍更新和卸载方法。',
  heading: '如何安装 GRKU',
  lead: '将 GRKU 放入 SD 卡，然后在相机上启动一次。相机固件不会改变。',
  needCamera: '受支持的 RICOH GR 相机',
  needCard: '一张 SD 卡',
  putTitle: '将 GRKU 放入 SD 卡',
  putLead: '选择以下任一方式。',
  cardSub: '在电脑上使用 Chrome 或 Edge，由网站为您写入文件。',
  openSite: '在电脑上使用 Chrome 或 Edge 打开 grku.app。',
  reader: '将 SD 卡插入读卡器。',
  pick: '打开安装页面，选择胶片风格、相机型号和附加功能。',
  connect: '在最后一步，点击此按钮。然后选择 SD 卡根目录，并授予编辑权限。',
  write: '确认将要进行的更改，然后点击此按钮。',
  confirmNote: '确认前，SD 卡上的内容不会更改。',
  download: '在最后一步，点击此按钮。',
  unzipNote: '部分浏览器会自动解压。',
  copyNote: '复制后，SD 卡根目录中应有 SCRIPT 文件夹。',
  start: '开始安装',
  cameraTitle: '在相机上启动 GRKU',
  cameraLead: '仅首次操作时执行此步骤。此操作会启用 SD 脚本，这是相机的一项设置，允许相机从存储卡运行 GRKU。',
  modeSetNote: '屏幕上会显示 Mode Set Command 和 Complete。随后相机会自动关机。',
  powerOn: '正常开启相机。几秒钟后，GRKU 会显示在屏幕顶部。',
  firstSlow: '安装后首次启动需要较长时间。',
  once: '仅首次需要按住 MENU。此设置会对所有存储卡持续生效，更新时无需再次操作。',
  useTitle: '使用 GRKU',
  useLead: '拍摄时，可通过 ADJ 杆打开 GRKU。',
  adj: '拍摄时，按下 ADJ 杆。',
  sixth: '选择第六项 GRKU。',
  look: '选中一种胶片风格，即可在屏幕上预览。按 OK 确认。',
  menu: '所有设置也可通过 MENU 访问。打开 Customize 选项卡 (C)，GRKU 栏目位于列表末尾。',
  updateTitle: '更新 GRKU',
  withBrowser: '使用 Chrome 或 Edge：在安装的最后一步连接存储卡，然后按下此按钮。',
  byHand: '使用 GRKU.zip 手动操作：',
  updateKeep: 'GRKU 会将设置保存在 GRKU 文件夹中，因此更新后设置仍会保留。',
  scriptsOffWhere: '在安装的最后一步，可以写入用于关闭 SD 脚本的文件，也可以下载这些文件。',
  helpTitle: '故障排除',
  firmwareQ: '按住 MENU 时，相机开始执行固件更新。',
  firmwareA: '存储卡中存在固件文件。关闭相机，删除存储卡根目录中的所有 .bin 文件，然后重试。',
  modeSetQ: '相机未显示 Mode Set Command。',
  modeSetA: '先按住 MENU 按钮，再开启相机。确认文件位于存储卡根目录，而非 DCIM 或其他文件夹中。',
  stuckQ: '相机在启动过程中卡住。',
  stuckA: '关闭相机。若相机无响应，请取出电池。取出 SD 卡后，不插卡重新开启相机。完整步骤请参阅恢复指南。',
  onThisPage: '本页内容',
};

const zhHant: GuideStrings = {
  title: '如何在 RICOH GR 上安裝 GRKU · GRKU',
  description: '逐步安裝 GRKU：透過 Chrome 或 Edge 將檔案寫入 SD 記憶卡，或自行複製 GRKU.zip 的內容，再於相機上啟動一次。另附更新與解除安裝方式。',
  heading: '如何安裝 GRKU',
  lead: '將 GRKU 放入 SD 記憶卡，再於相機上啟動一次。相機韌體不會變更。',
  needCamera: '支援的 RICOH GR 相機',
  needCard: '一張 SD 記憶卡',
  putTitle: '將 GRKU 放入 SD 記憶卡',
  putLead: '請選擇以下其中一種方式。',
  cardSub: '使用電腦上的 Chrome 或 Edge，由網站為您寫入檔案。',
  openSite: '在電腦上使用 Chrome 或 Edge 開啟 grku.app。',
  reader: '將 SD 記憶卡插入讀卡機。',
  pick: '開啟安裝頁面，選擇底片風格、相機機型及附加功能。',
  connect: '在最後一個步驟，按下此按鈕。接著選取記憶卡本身，並允許編輯。',
  write: '確認將變更的項目，再按下此按鈕。',
  confirmNote: '確認前不會變更記憶卡上的任何內容。',
  download: '在最後一個步驟，按下此按鈕。',
  unzipNote: '部分瀏覽器會自動解壓縮。',
  copyNote: '完成後，記憶卡根目錄中會有 SCRIPT 資料夾。',
  start: '開始安裝',
  cameraTitle: '在相機上啟動 GRKU',
  cameraLead: '只需在第一次設定時執行此步驟。這會啟用 SD 腳本，也就是讓相機能從記憶卡執行 GRKU 的設定。',
  modeSetNote: '螢幕會顯示 Mode Set Command 和 Complete，接著相機會自動關機。',
  powerOn: '正常開啟相機。幾秒後，GRKU 就會顯示在螢幕上方。',
  firstSlow: '安裝後第一次啟動需要較長時間。',
  once: '只有第一次需要按住 MENU。此設定會對所有記憶卡持續生效，更新時也不需要重新設定。',
  useTitle: '使用 GRKU',
  useLead: '拍攝時，可透過 ADJ 撥桿操作 GRKU。',
  adj: '拍攝時，按下 ADJ 撥桿。',
  sixth: '選擇第六個項目 GRKU。',
  look: '反白選取底片風格，即可在螢幕上預覽。按下 OK 套用。',
  menu: '所有設定也都能在 MENU 中找到。開啟 Customize 分頁 (C)，GRKU 區段位於最下方。',
  updateTitle: '日後更新 GRKU',
  withBrowser: '使用 Chrome 或 Edge：在安裝的最後一個步驟連接記憶卡，然後按下此按鈕。',
  byHand: '使用 GRKU.zip 手動操作：',
  updateKeep: 'GRKU 會將設定保存在 GRKU 資料夾中，因此更新後會保留原有設定。',
  scriptsOffWhere: '安裝的最後一個步驟可以寫入停用 SD 腳本所需的檔案，也可以下載這些檔案。',
  helpTitle: '疑難排解',
  firmwareQ: '按住 MENU 時，相機開始執行韌體更新。',
  firmwareA: '記憶卡中有韌體檔案。關閉相機，刪除記憶卡根目錄中的所有 .bin 檔案，然後再試一次。',
  modeSetQ: '相機沒有顯示 Mode Set Command。',
  modeSetA: '先按住 MENU 按鈕，再開啟相機電源。請確認檔案位於記憶卡根目錄，而非 DCIM 或其他資料夾內。',
  stuckQ: '相機在啟動時停止回應。',
  stuckA: '關閉相機電源。若相機沒有回應，請取出電池。取出 SD 記憶卡後，請在未插入記憶卡的狀態下重新開啟相機電源。完整步驟請參閱復原指南。',
  onThisPage: '本頁內容',
};

const ja: GuideStrings = {
  title: 'RICOH GRへのGRKUのインストール方法 · GRKU',
  description: 'GRKUのインストール手順をご案内します。ChromeまたはEdgeからSDカードに書き込むか、GRKU.zipを手動でコピーして、カメラで一度起動します。更新とアンインストールの方法も説明します。',
  heading: 'GRKUのインストール方法',
  lead: 'SDカードにGRKUを保存し、カメラで一度起動します。カメラのファームウェアは変更されません。',
  needCamera: '対応するRICOH GR',
  needCard: 'SDカード',
  putTitle: 'SDカードにGRKUを保存する',
  putLead: '2つの方法から選びます。',
  cardSub: 'パソコンのChromeまたはEdgeを使用します。サイトから直接ファイルを書き込みます。',
  openSite: 'パソコンのChromeまたはEdgeでgrku.appを開きます。',
  reader: 'SDカードをカードリーダーに挿入します。',
  pick: 'インストールページを開き、フィルムルック、カメラ、追加機能を選びます。',
  connect: '最後の手順で、下のボタンを押します。次にSDカード自体を選択し、編集を許可します。',
  write: '変更内容を確認し、下のボタンを押します。',
  confirmNote: '確定するまで、カードの内容は変更されません。',
  download: '最後の手順で、下のボタンを押します。',
  unzipNote: 'ブラウザーによっては自動的に展開されます。',
  copyNote: 'コピー後、カードの最上位にSCRIPTフォルダーがあることを確認します。',
  start: 'インストールを開始',
  cameraTitle: 'カメラでGRKUを起動する',
  cameraLead: 'この操作は初回のみ行います。SDスクリプトを有効にすると、カードからGRKUを実行できるようになります。',
  modeSetNote: '画面に「Mode Set Command」と「Complete」と表示された後、カメラの電源が自動的に切れます。',
  powerOn: '通常どおりカメラの電源を入れます。数秒後、画面上部にGRKUが表示されます。',
  firstSlow: 'インストール後の初回起動には時間がかかります。',
  once: 'MENUを押すのは初回のみです。この設定はすべてのカードで有効になり、アップデート時に再度行う必要はありません。',
  useTitle: 'GRKUを使う',
  useLead: '撮影中はADJレバーからGRKUを操作できます。',
  adj: '撮影中にADJレバーを押します。',
  sixth: '6番目の項目「GRKU」を選択します。',
  look: 'フィルムルックを選択すると、画面で効果を確認できます。OKを押して決定します。',
  menu: 'すべての設定はMENUからも操作できます。「Customize」タブ（C）を開くと、最後にGRKUの項目があります。',
  updateTitle: 'GRKUをアップデートする',
  withBrowser: 'ChromeまたはEdgeを使用する場合：インストール手順の最後でカードを接続し、このボタンを押します。',
  byHand: 'GRKU.zipを使って手動で行う場合：',
  updateKeep: '設定はGRKUフォルダーに保存されるため、アップデート後もそのまま引き継がれます。',
  scriptsOffWhere: 'インストール手順の最後で、SDスクリプトを無効にするファイルを書き込むか、ダウンロードできます。',
  helpTitle: 'トラブルシューティング',
  firmwareQ: 'MENUを押しながら電源を入れると、ファームウェアのアップデートが始まる。',
  firmwareA: 'カードにファームウェアファイルが入っています。カメラの電源を切り、カードの最上位階層にある.binファイルをすべて削除してから、もう一度お試しください。',
  modeSetQ: '画面に「Mode Set Command」と表示されない。',
  modeSetA: 'MENUボタンを押したまま、カメラの電源を入れます。ファイルがカードのルートディレクトリにあり、DCIMなどのフォルダー内に入っていないことを確認してください。',
  stuckQ: 'カメラの起動中に動作が停止する。',
  stuckA: 'カメラの電源を切ります。反応しない場合は、バッテリーを取り外してください。SDカードを取り外してから、カードを入れずにカメラの電源を入れます。復旧ガイドに手順をすべて記載しています。',
  onThisPage: 'このページの内容',
};

const ko: GuideStrings = {
  title: 'RICOH GR에 GRKU 설치하기 · GRKU',
  description: 'GRKU를 단계별로 설치하는 방법을 안내합니다. Chrome 또는 Edge에서 SD 카드에 파일을 저장하거나 GRKU.zip을 직접 복사한 다음, 카메라에서 한 번 실행하세요. 업데이트 및 제거 방법도 확인할 수 있습니다.',
  heading: 'GRKU 설치 방법',
  lead: 'SD 카드에 GRKU를 저장한 다음, 카메라에서 한 번 실행하세요. 카메라 펌웨어는 변경되지 않습니다.',
  needCamera: '지원되는 RICOH GR 카메라',
  needCard: 'SD 카드',
  putTitle: 'SD 카드에 GRKU 저장',
  putLead: '두 가지 방법 중 하나를 선택하세요.',
  cardSub: '컴퓨터의 Chrome 또는 Edge에서 진행합니다. 사이트가 카드에 파일을 저장합니다.',
  openSite: '컴퓨터의 Chrome 또는 Edge에서 grku.app을 여세요.',
  reader: 'SD 카드를 카드 리더에 삽입하세요.',
  pick: '설치 페이지를 여세요. 필름 룩, 카메라, 추가 옵션을 선택하세요.',
  connect: '마지막 단계에서 아래 버튼을 누르세요. 그런 다음 카드 자체를 선택하고 편집을 허용하세요.',
  write: '변경 사항을 확인한 다음 아래 버튼을 누르세요.',
  confirmNote: '확인하기 전에는 카드의 내용이 변경되지 않습니다.',
  download: '마지막 단계에서 아래 버튼을 누르세요.',
  unzipNote: '일부 브라우저는 자동으로 압축을 풉니다.',
  copyNote: '복사 후 카드의 최상위 경로에 SCRIPT 폴더가 있어야 합니다.',
  start: '설치 시작',
  cameraTitle: '카메라에서 GRKU 실행',
  cameraLead: '이 작업은 처음 한 번만 수행하면 됩니다. 카메라에서 SD 스크립트를 실행할 수 있도록 설정하여 GRKU를 카드에서 사용할 수 있게 합니다.',
  modeSetNote: '화면에 Mode Set Command와 Complete가 표시됩니다. 이후 카메라가 자동으로 꺼집니다.',
  powerOn: '평소처럼 카메라 전원을 켭니다. 몇 초 후 화면 상단에 GRKU가 표시됩니다.',
  firstSlow: '설치 후 처음 실행할 때는 시간이 더 걸립니다.',
  once: 'MENU 버튼은 처음 한 번만 누르면 됩니다. 이 설정은 모든 카드에 유지되며, 업데이트할 때는 다시 설정할 필요가 없습니다.',
  useTitle: 'GRKU 사용하기',
  useLead: '촬영 중 ADJ 레버에서 GRKU를 사용할 수 있습니다.',
  adj: '촬영 중 ADJ 레버를 누릅니다.',
  sixth: '여섯 번째 항목인 GRKU를 선택합니다.',
  look: '필름 룩을 선택하면 화면에서 미리 볼 수 있습니다. OK 버튼을 눌러 적용합니다.',
  menu: '모든 설정은 MENU에서도 사용할 수 있습니다. Customize 탭(C)을 열면 GRKU 항목이 맨 아래에 있습니다.',
  updateTitle: '나중에 GRKU 업데이트하기',
  withBrowser: 'Chrome 또는 Edge 사용 시: 설치 마지막 단계에서 카드를 연결한 다음 이 버튼을 누릅니다.',
  byHand: '수동으로, GRKU.zip을 사용:',
  updateKeep: 'GRKU는 GRKU 폴더에 설정을 저장하므로 업데이트 후에도 설정이 유지됩니다.',
  scriptsOffWhere: '설치 마지막 단계에서 SD 스크립트를 끄는 파일을 카드에 기록하거나 다운로드할 수 있습니다.',
  helpTitle: '문제 해결',
  firmwareQ: 'MENU 버튼을 누른 상태에서 카메라를 켜면 펌웨어 업데이트가 시작됩니다.',
  firmwareA: '카드에 펌웨어 파일이 있습니다. 카메라 전원을 끄고 카드의 최상위 폴더에서 모든 .bin 파일을 삭제한 다음 다시 시도하세요.',
  modeSetQ: '카메라 화면에 Mode Set Command가 표시되지 않습니다.',
  modeSetA: '먼저 MENU 버튼을 누른 상태에서 카메라 전원을 켜세요. 파일이 DCIM이나 다른 폴더 안이 아닌 SD 카드의 최상위 경로에 있는지 확인하세요.',
  stuckQ: '카메라 전원을 켤 때 시작 화면에서 멈춥니다.',
  stuckA: '카메라 전원을 끄세요. 카메라가 반응하지 않으면 배터리를 분리하세요. SD 카드를 꺼낸 다음, 카드를 넣지 않은 상태로 카메라 전원을 켜세요. 복구 가이드에서 전체 절차를 확인할 수 있습니다.',
  onThisPage: '이 페이지의 목차',
};

export const GUIDE_STRINGS: Readonly<Record<Language, GuideStrings>> = { en, th, 'zh-Hans': zhHans, 'zh-Hant': zhHant, ja, ko };
