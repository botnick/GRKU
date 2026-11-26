// The user manual in ko, translated from en.ts with the Gemini tools (grku-tools/i18n-th.mjs,
// checked with i18n-review.mjs), never by hand.
import type { DocsContent } from '../types';

export const ko: DocsContent = {
  "home": {
    "title": "GRKU 설명서",
    "seoTitle": "GRKU 설명서: RICOH GR III, IIIx, IV 설치, 필름 룩 및 모든 설정",
    "lead": "GRKU 설치 방법, GR에서 각 기능 사용하기, 문제 해결 안내. 짧은 단계와 쉬운 설명.",
    "trust": "GRKU는 SD 카드에서 실행되며 카메라 펌웨어를 변경하지 않습니다.",
    "need": "필요한 것",
    "tasks": [
      {
        "slug": "install",
        "label": "GRKU 설치",
        "hint": "처음 사용 시"
      },
      {
        "slug": "firmware",
        "label": "펌웨어 확인하기",
        "hint": "설치 전에 확인하세요"
      },
      {
        "slug": "controls",
        "label": "카메라에서 GRKU 사용하기",
        "hint": "ADJ와 MENU"
      },
      {
        "slug": "film-look",
        "label": "필름 룩 고르기",
        "hint": "필름 룩"
      },
      {
        "slug": "not-showing",
        "label": "GRKU가 보이지 않을 때",
        "hint": "원인 찾기"
      },
      {
        "slug": "update",
        "label": "업데이트 또는 제거",
        "hint": "설정 유지"
      }
    ],
    "rescue": "시작할 때 카메라가 멈추나요?",
    "all": "전체 페이지",
    "credit": "GRKU는 ahonn의 [GRKit](https://github.com/ahonn/GRKit) 코드(MIT)에서 시작되었습니다."
  },
  "ui": {
    "docs": "설명서",
    "searchLabel": "매뉴얼 검색",
    "searchHome": "검색 예: 날짜, XPan, 업데이트",
    "searchShort": "매뉴얼 검색",
    "noResults": "검색결과가 없습니다.",
    "askInstead": "AI 어시스턴트에 질문하기",
    "browse": "매뉴얼 페이지",
    "previous": "이전",
    "next": "다음",
    "onThisPage": "이 페이지 목차",
    "stuck": "해결되지 않나요?",
    "report": "지원팀에 메일 보내기",
    "askAi": "이 페이지에 대해 AI에게 질문",
    "askAiText": "GRKU 어시스턴트가 이 페이지에 관한 질문에 한국어로 답변합니다.",
    "askPrompt": "\"${title}\" 매뉴얼 페이지를 읽고 있습니다. 짧은 단계로 설명해 주세요.",
    "camera": "카메라",
    "firmware": "펌웨어",
    "modeset": "ModeSet 파일",
    "ratio": "화면 비율",
    "mask": "마스크",
    "masks": [
      "어두운",
      "검정",
      "프레임 선"
    ],
    "focal": "초점 거리",
    "style": "스타일",
    "guides": [
      "9분할",
      "화면 중앙",
      "황금비",
      "대각선"
    ],
    "updated": "업데이트됨"
  },
  "groups": {
    "start": "시작하기",
    "camera": "카메라에서",
    "site": "grku.app에서",
    "help": "도움말"
  },
  "pages": {
    "start": {
      "title": "GRKU 소개",
      "sources": [
        "web/src/plus.ts",
        "web/src/generated/modules.ts",
        "web/src/strings/en.ts (faq)",
        "resources/TERMS.md"
      ],
      "seo": "GRKU란 무엇인가요? RICOH GR III, IIIx, IV를 위한 무료 필름 룩",
      "lead": "GRKU는 SD 카드에서 RICOH GR에 필름 룩과 사진 효과를 추가합니다.",
      "keywords": "소개 입문 개요 시작 초보자 무료 안전 펌웨어 about introduction overview begin beginner free safe firmware",
      "blocks": [
        {
          "kind": "p",
          "text": "GRKU는 RICOH GR III, GR IIIx, GR IV용 무료 추가 기능입니다. 150가지가 넘는 필름 룩 중에서 골라 카드 하나에 최대 40개까지 넣을 수 있으며, 날짜 각인, 그레인, XPan 프레이밍 같은 레시피와 효과도 제공합니다."
        },
        {
          "kind": "p",
          "text": "카메라가 켜져 있는 동안 SD 카드에서 돌아갑니다. 카드가 없으면 GRKU가 켜지지 않고 RICOH 기본 상태로 작동합니다. 카메라 설정인 SD 스크립트만 **켜짐**으로 남습니다. GRKU는 카메라 펌웨어를 바꾸지 않습니다."
        },
        {
          "kind": "h2",
          "id": "need",
          "text": "필요한 것"
        },
        {
          "kind": "list",
          "items": [
            "지원되는 카메라와 펌웨어 버전. [지원 카메라](doc:cameras) 페이지를 확인하세요.",
            "SD 카드. 촬영에 사용하는 카드면 됩니다.",
            "Chrome이나 Edge가 설치된 컴퓨터와 카드 리더기. 없으면 `GRKU.zip`을 카드에 직접 복사할 수 있습니다."
          ]
        },
        {
          "kind": "h2",
          "id": "how",
          "text": "작동 방식"
        },
        {
          "kind": "steps",
          "items": [
            "grku.app에서 필름 룩과 카메라, 모듈을 고른 뒤 SD 카드에 기록하세요.",
            "처음 한 번만 {{MENU}}를 누른 채 카메라를 켜세요. SD 스크립트가 켜집니다.",
            "평소처럼 카메라를 켜세요. 몇 초 뒤 화면 상단에 **GRKU**가 표시됩니다.",
            "촬영 중에 {{ADJ}}를 누르고 여섯 번째 항목인 **GRKU**를 선택하세요."
          ]
        },
        {
          "kind": "h2",
          "id": "free",
          "text": "무료 기능과 GRKU Plus 추가 기능"
        },
        {
          "kind": "p",
          "text": "모든 룩은 사이트에서 무료로 미리 볼 수 있고, 라이브러리의 룩 10개를 카드에 무료로 넣을 수 있습니다. 직접 가져온 룩은 개수에 포함되지 않습니다. Develop 페이지의 모든 모듈, 레시피, 룩 체험도 무료입니다. 카드에 더 많은 룩을 담고 싶다면 [GRKU Plus](doc:plus)를 한 번만 결제해 이용할 수 있습니다."
        },
        {
          "kind": "h2",
          "id": "words",
          "text": "이 설명서에 나오는 용어"
        },
        {
          "kind": "list",
          "items": [
            "**SD card**: 카메라가 사진을 저장하는 작은 메모리 카드입니다.",
            "**Card reader**: 컴퓨터가 SD 카드를 열 수 있게 해 주는 작은 장치입니다.",
            "**ZIP file**: 여러 파일을 하나로 묶은 파일입니다. 열어서 안에 있는 파일을 꺼냅니다.",
            "**Firmware**: RICOH에서 만든 카메라 안의 소프트웨어입니다. GRKU는 이를 절대 바꾸지 않습니다.",
            "**SD scripts**: 카메라가 카드에서 GRKU를 실행하게 해 주는 설정입니다. 한 번만 켜면 됩니다.",
            "**ModeSet file**: SD scripts를 켜는 파일입니다. 이름은 `00078560.636` 같은 숫자입니다.",
            "**ADJ lever**: GR 뒷면 화면 옆에 있는 작은 레버입니다."
          ]
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "실험적 기능",
          "text": "GRKU는 보증이 없는 실험적 소프트웨어입니다. 오류가 나면 카메라가 시작 단계에서 멈출 수 있습니다. 설치하기 전에 [카메라가 시작 단계에서 멈춤](doc:stuck)을 읽어 두세요."
        }
      ]
    },
    "firmware": {
      "title": "펌웨어 버전 확인",
      "sources": [
        "crates/grku-core/src/camera.rs",
        "web/src/generated/cameras.ts",
        "web/src/package.ts (gr4-1.20-0528 not published)",
        "https://www.ricoh-imaging.co.jp/english/support/digital/gr3_s.html",
        "https://www.ricoh-imaging.co.jp/english/support/digital/gr3x_s.html",
        "https://www.ricoh-imaging.co.jp/english/support/digital/gr4_s.html",
        "https://www.ricoh-imaging.co.jp/english/support/digital/gr-4-mono_s.html",
        "web/src/chat/knowledge.ts (firmware update screen)"
      ],
      "seo": "RICOH GR III, GR IIIx 또는 GR IV의 펌웨어 버전을 확인하는 방법",
      "lead": "MENU를 누르고 설정 메뉴(스패너 아이콘)를 여세요. GRKU는 이 페이지의 표에 나온 펌웨어 버전에서만 작동합니다.",
      "keywords": "펌웨어 버전 확인 메뉴 설정 스패너 이 기기 정보 펌웨어 정보 카메라 정보 업데이트 ricoh 이전 버전 최신 버전 fwdc bin firmware version check menu setup wrench about this device firmware info camera information update ricoh older newer fwdc bin",
      "blocks": [
        {
          "kind": "p",
          "text": "펌웨어는 RICOH에서 만든 카메라 안의 소프트웨어입니다. 카메라마다 메뉴에 펌웨어 버전이 표시됩니다. GRKU를 설치하기 전에 확인하세요."
        },
        {
          "kind": "h2",
          "id": "gr3",
          "text": "GR III 및 GR IIIx"
        },
        {
          "kind": "steps",
          "items": [
            "카메라 전원을 켜세요.",
            "{{MENU}} 버튼을 누르세요.",
            "설정 메뉴(스패너 아이콘 탭)로 이동해 **About This Device**를 여세요.",
            "**Firmware Info / Options**을 선택하고 오른쪽을 누르세요.",
            "화면에 펌웨어 버전이 표시됩니다. 예: 2.21."
          ]
        },
        {
          "kind": "path",
          "items": [
            "MENU",
            "Setup",
            "About This Device",
            "Firmware Info / Options"
          ]
        },
        {
          "kind": "h2",
          "id": "gr4",
          "text": "GR IV 및 GR IV HDF"
        },
        {
          "kind": "steps",
          "items": [
            "카메라 전원을 켜세요.",
            "{{MENU}} 버튼을 누르세요.",
            "설정 메뉴(스패너 아이콘 탭)로 이동해 **Camera Information**을 선택하세요.",
            "오른쪽을 누르세요.",
            "화면에 펌웨어 버전이 표시됩니다. 예: 1.21."
          ]
        },
        {
          "kind": "path",
          "items": [
            "MENU",
            "Setup",
            "Camera Information"
          ]
        },
        {
          "kind": "p",
          "text": "GR IV Monochrome: [이 카메라의 RICOH 지원 페이지](https://www.ricoh-imaging.co.jp/english/support/digital/gr-4-mono_s.html)에 펌웨어 버전 목록이 있습니다."
        },
        {
          "kind": "h2",
          "id": "supported",
          "text": "GRKU는 어떤 버전을 지원하나요?"
        },
        {
          "kind": "cameras"
        },
        {
          "kind": "p",
          "text": "GR IV 30th Anniversary Edition 카메라는 1.20 전용 공장 빌드로 나오며, grku.app에서는 아직 제공하지 않습니다. 먼저 RICOH에서 1.21로 업데이트하세요."
        },
        {
          "kind": "h2",
          "id": "older",
          "text": "내 버전이 더 오래됨"
        },
        {
          "kind": "p",
          "text": "먼저 RICOH 공식 지원 페이지([GR III](https://www.ricoh-imaging.co.jp/english/support/digital/gr3_s.html), [GR IIIx](https://www.ricoh-imaging.co.jp/english/support/digital/gr3x_s.html), [GR IV](https://www.ricoh-imaging.co.jp/english/support/digital/gr4_s.html), [GR IV Monochrome](https://www.ricoh-imaging.co.jp/english/support/digital/gr-4-mono_s.html))에서만 카메라를 업데이트하세요. 해당 페이지의 안내를 따르세요. GRKU는 펌웨어를 업데이트하지 않습니다."
        },
        {
          "kind": "h2",
          "id": "newer",
          "text": "내 버전이 표에 있는 버전보다 최신인 경우"
        },
        {
          "kind": "p",
          "text": "아직 GRKU를 설치하지 마세요. 해당 버전을 지원하는 GRKU 업데이트가 나올 때까지 기다리세요. [grku.app 소식](site:home)에서 확인할 수 있습니다."
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "처음 켤 때 펌웨어 업데이트 화면이 뜨나요?",
          "text": "카드에 카메라 펌웨어 파일(`fwdc`로 시작하는 이름의 `.bin` 파일)이 있으면 전원을 켤 때 {{MENU}} 버튼을 길게 누르면 펌웨어 업데이트 화면이 나타납니다. **Cancel**을 고르고 {{OK}} 버튼을 누르세요. 카메라를 끄고 카드에서 그 파일을 지운 뒤 다시 해보세요."
        }
      ]
    },
    "install": {
      "title": "GRKU 설치",
      "sources": [
        "resources/INSTALLATION-GR4.md",
        "web/src/guide.ts",
        "web/src/strings/en.ts (cardConnect, cardApplyInstall, download)",
        "crates/grku-core/src/runtime/files.rs",
        "resources/images/modeset.png",
        "resources/images/camera-menu.png",
        "resources/images/grku-root.jpg"
      ],
      "seo": "RICOH GR III, GR IIIx 또는 GR IV에 GRKU를 설치하는 방법",
      "lead": "GRKU를 SD 카드에 기록한 다음 카메라에서 SD 스크립트를 한 번 켜세요.",
      "keywords": "설정 설치 sd 카드 chrome edge zip sd_root modeset mode set command menu first start",
      "blocks": [
        {
          "kind": "h2",
          "id": "write",
          "text": "사이트에서 카드 준비하기"
        },
        {
          "kind": "p",
          "text": "컴퓨터의 Chrome 또는 Edge를 사용하고, SD 카드를 카드 리더에 넣으세요. 카메라의 USB 케이블은 이 작업에 사용할 수 없습니다."
        },
        {
          "kind": "steps",
          "items": [
            "[설치 페이지](site:install)를 여세요.",
            "필름 룩, 카메라, 모듈 순으로 선택하세요.",
            "마지막 단계에서 **SD 카드에 바로 기록**을 고른 다음 **SD 카드 연결**을 누르세요. 카드 자체를 선택한 뒤 편집을 허용하세요.",
            "변경 목록을 확인한 뒤 **GRKU 설치**를 누르세요. 촬영한 사진은 카드에 그대로 남습니다.",
            "카드를 빼기 전에 컴퓨터에서 꺼내세요."
          ]
        },
        {
          "kind": "p",
          "text": "카메라 펌웨어 버전을 잘 모르겠다면 [펌웨어 버전 확인](doc:firmware)을 보세요."
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "이렇게 보이지 않는다면",
          "text": "**SD 카드 연결** 버튼이 없나요? 컴퓨터의 Chrome이나 Edge에서 페이지를 여세요. 휴대폰이나 Safari에서는 아래 GRKU.zip을 쓰세요."
        },
        {
          "kind": "h2",
          "id": "zip",
          "text": "또는 GRKU.zip을 직접 복사하기"
        },
        {
          "kind": "p",
          "text": "다른 브라우저에서도 쓸 수 있으며, 휴대폰이나 Safari를 쓰는 Mac에서도 됩니다. 앱 안의 브라우저에서 파일을 저장할 수 없다면 휴대폰 브라우저에서 페이지를 여세요."
        },
        {
          "kind": "steps",
          "items": [
            "설치 마지막 단계에서 **GRKU.zip 다운로드**를 누르세요.",
            "파일이 `GRKU-….zip`으로 저장됩니다. 압축을 푸세요. 일부 브라우저는 자동으로 압축을 풀어 줍니다.",
            "폴더 자체가 아니라 `SD_ROOT` 안의 내용물을 카드의 최상위 경로에 복사하세요.",
            "이제 카드 최상위 경로에 `SCRIPT` 폴더, `DEVELOP.MOD`, 카메라의 모드Set 파일이 있습니다."
          ]
        },
        {
          "kind": "card",
          "alt": "설치 후 SD 카드의 최상위 경로.",
          "items": [
            [
              "SCRIPT",
              "GRKU 본체입니다. 그대로 두세요."
            ],
            [
              "DEVELOP.MOD",
              "처음 시작할 때 ModeSet 파일과 함께 쓰입니다. 그 뒤에는 지워도 됩니다."
            ],
            [
              "00078560.636",
              "SD 스크립트를 켜는 카메라의 ModeSet 파일입니다. GR III는 00078350.588, GR IIIx는 00078490.609, GR IV는 00078560.636입니다. 처음 시작한 뒤에는 지워도 됩니다."
            ],
            [
              "GRKU",
              "설정과 필름 룩입니다. 사이트나 카메라가 만듭니다."
            ],
            [
              "DCIM",
              "찍어 둔 사진입니다. GRKU를 설치해도 그대로 남습니다."
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "first-start",
          "text": "첫 실행: SD 스크립트 켜기"
        },
        {
          "kind": "p",
          "text": "한 번만 하면 됩니다. 이 설정은 모든 카드에 유지되며 업데이트할 때는 다시 하지 않아도 됩니다."
        },
        {
          "kind": "steps",
          "items": [
            "카메라 전원을 끄고 카드를 넣으세요.",
            "{{MENU}} 버튼을 누른 상태에서 전원 버튼을 누르세요.",
            "화면에 **모드 Set Command**, 이어서 **Script - 사용**과 **Complete**가 나타납니다. 카메라가 스스로 꺼집니다.",
            "평소처럼 카메라를 켜세요. 화면 위에 **GRKU**가 뜰 때까지 기다리세요. 약 8~10초가 걸리며, GR IV나 설치 후 첫 실행에는 더 오래 걸립니다."
          ]
        },
        {
          "kind": "screen",
          "screen": "modeset-back",
          "alt": "MENU 버튼에 동그라미가 있는 GR 뒷면입니다. 화면에 **모드** Set Command, Script - **사용**, Complete가 보입니다."
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "이렇게 보이지 않는다면",
          "text": "**Mode Set Command** 화면이 없나요? 카메라를 끄세요. {{MENU}}를 먼저 길게 누른 다음 전원 버튼을 누르고, 화면이 뜰 때까지 {{MENU}}를 계속 누르세요. `DEVELOP.MOD`와 ModeSet 파일이 폴더 안이 아니라 카드 최상위에 있는지 확인하세요."
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "펌웨어 업데이트 화면이 뜨나요?",
          "text": "카드에 카메라 펌웨어 파일(`fwdc`로 시작하는 이름의 `.bin` 파일)이 있습니다. **Cancel**을 고르고 {{OK}}를 누르세요. Execute는 절대 누르지 마세요. 카메라를 끄고 카드 최상위에서 그 파일을 지운 뒤 다시 해보세요."
        },
        {
          "kind": "p",
          "text": "이 단계 후 카드에서 ModeSet 파일과 `DEVELOP.MOD`를 삭제해도 됩니다. `SCRIPT` 폴더는 그대로 두세요."
        },
        {
          "kind": "h2",
          "id": "use",
          "text": "GRKU 사용하기"
        },
        {
          "kind": "steps",
          "items": [
            "촬영 중에 {{ADJ}}를 누르세요.",
            "**GRKU**를 고르세요. 보통 여섯 번째 항목에 있습니다.",
            "**필름 룩** 같은 기능을 선택하고 항목을 강조 표시해 화면에서 확인하세요.",
            "적용하려면 {{OK}}를 누르세요. 추가 설정은 {{Fn}}을 누르세요."
          ]
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "이렇게 보이지 않는다면",
          "text": "ADJ에 **GRKU**가 없나요? 전원을 켠 뒤 10초 기다렸다가 다시 해보세요. 그래도 안 보이면 [GRKU가 보이지 않을 때](doc:not-showing)를 보세요."
        },
        {
          "kind": "screen",
          "screen": "adj",
          "alt": "GRKU에서 모듈 아이콘과 함께 ADJ가 열린 화면입니다. 화면 왼쪽 위에 GRKU와 필름 룩: 꺼짐이 보입니다."
        },
        {
          "kind": "p",
          "text": "GRKU가 로드되기 전에 찍은 사진에는 GRKU 효과가 적용되지 않습니다. 조작 방법 전체는 [ADJ와 MENU](doc:controls)를 참고하세요."
        }
      ]
    },
    "controls": {
      "title": "ADJ와 MENU",
      "sources": [
        "runtime/menu.c",
        "runtime/manage.h",
        "runtime/menu_listed.h",
        "crates/grku-core/src/menu_text.rs",
        "resources/images/grku-menu.jpg"
      ],
      "seo": "GR에서 GRKU 사용 방법: ADJ 레버와 MENU",
      "lead": "카메라에서 GRKU가 있는 위치와 각 버튼의 기능입니다.",
      "keywords": "adj lever menu customize fn ok button options order enable grku about version navigate adj 레버 메뉴 사용자 지정 fn ok 버튼 옵션 순서 활성화 grku 정보 버전 탐색",
      "blocks": [
        {
          "kind": "h2",
          "id": "adj",
          "text": "ADJ의 GRKU"
        },
        {
          "kind": "p",
          "text": "촬영할 때 {{ADJ}} 레버를 누르고 보통 여섯 번째 항목인 **GRKU**를 고르세요. **필름 룩**, **프레이밍**, **입자감**처럼 카드에 들어 있는 모듈 목록이 나옵니다."
        },
        {
          "kind": "table",
          "head": [
            "버튼",
            "GRKU에서의 동작"
          ],
          "rows": [
            [
              "{{ADJ}}",
              "ADJ를 엽니다. GRKU에서 닫았다면 전원을 껐다 켜도 그 화면이 다시 열립니다."
            ],
            [
              "위, 아래",
              "모듈로 이동하거나 항목을 강조 표시합니다. 지원하는 경우 라이브 뷰에 즉시 반영됩니다."
            ],
            [
              "{{OK}}",
              "선택한 모듈을 열거나, 선택한 값을 그대로 둡니다."
            ],
            [
              "{{Fn}}",
              "행의 추가 동작을 합니다. 모듈의 세부 설정, 황금나선의 다음 모서리, 또는 레시피의 이름 변경과 삭제입니다."
            ],
            [
              "{{MENU}}",
              "뒤로 갑니다."
            ]
          ]
        },
        {
          "kind": "p",
          "text": "모듈 뒤에 있는 **사용** 항목으로 GRKU를 켜거나 끕니다. 켜짐으로 하면 켜 둔 모듈들이 다시 시작합니다."
        },
        {
          "kind": "h2",
          "id": "menu",
          "text": "MENU의 GRKU"
        },
        {
          "kind": "path",
          "items": [
            "MENU",
            "사용자 설정 (C)",
            "GRKU"
          ]
        },
        {
          "kind": "p",
          "text": "모든 설정은 카메라 메뉴에도 있습니다. {{MENU}}를 열고 커스텀 탭(C)으로 이동해 끝까지 스크롤하면 GRKU 섹션에 이 행들이 있습니다."
        },
        {
          "kind": "table",
          "head": [
            "항목",
            "기능"
          ],
          "rows": [
            [
              "**GRKU 사용**",
              "GRKU를 켜거나 끕니다. 켜짐으로 하면 켜 둔 모듈들이 다시 시작합니다."
            ],
            [
              "**GRKU 설정**",
              "GRKU 자체의 설정입니다. [GRKU 설정](doc:settings)을 참고하세요."
            ],
            [
              "**레시피**, **필름 룩** 및 기타 모듈",
              "카드에 있는 모듈별 행과 해당 모듈의 모든 설정입니다."
            ],
            [
              "**GRKU 정보**",
              "카드와 웹사이트에 있는 GRKU 버전입니다."
            ]
          ]
        },
        {
          "kind": "screen",
          "screen": "menu",
          "alt": "GR IV의 MENU에 있는 GRKU 화면 사진입니다. **구도 가이드**가 선택되어 있고 아래로 **레시피** 줄까지 보입니다."
        },
        {
          "kind": "h2",
          "id": "module-rows",
          "text": "모듈 페이지"
        },
        {
          "kind": "list",
          "items": [
            "**사용**은 이 모듈만 켜거나 끕니다.",
            "**옵션** 기능이 있는 모듈에서는 ADJ에 표시할 항목을 고를 수 있어요. 안 쓰는 필름 룩은 체크를 해제하면 ADJ에서 건너뛰어요.",
            "**순서** 기능이 있는 모듈에서는 ADJ에서 그 항목들이 나오는 순서를 정해요.",
            "나머지 행은 모듈의 설정입니다. 이 설명서의 각 페이지에 목록이 나와 있습니다."
          ]
        },
        {
          "kind": "h2",
          "id": "jpeg",
          "text": "JPEG와 DNG"
        },
        {
          "kind": "p",
          "text": "GRKU는 JPEG를 바꿔요. DNG는 필름 룩 없이 센서의 원본 데이터를 그대로 남겨요. 나중에 GRKU로 DNG를 현상하려면 [RAW 현상](doc:raw)을 보세요."
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "설정 유지",
          "text": "GRKU는 전원을 끄고 업데이트를 해도 설정을 카드의 `GRKU` 폴더에 그대로 남겨요."
        }
      ]
    },
    "update": {
      "title": "업데이트 또는 제거",
      "sources": [
        "resources/INSTALLATION-GR4.md",
        "web/src/strings/en.ts (updateSteps, removeSteps, uninstall*, scriptsOff*)"
      ],
      "seo": "GRKU 업데이트 또는 제거 방법 및 SD 스크립트 끄기",
      "lead": "업데이트해도 설정과 필름 룩이 유지됩니다. MENU를 다시 길게 누를 필요가 없습니다.",
      "keywords": "업데이트 업그레이드 새 버전 제거 삭제 sd 스크립트 끄기 카드 포맷 백업 update upgrade new version uninstall remove delete sd scripts off format card backup",
      "blocks": [
        {
          "kind": "h2",
          "id": "update-site",
          "text": "사이트에서 업데이트"
        },
        {
          "kind": "steps",
          "items": [
            "카드를 카드 리더기에 넣고 Chrome이나 Edge에서 [설치 페이지](site:install)를 엽니다.",
            "마지막 단계에서 **SD 카드 연결**을 누릅니다. 페이지에 변경되는 항목이 표시됩니다.",
            "**GRKU 업데이트**를 누릅니다.",
            "카드를 카메라에 넣고 평소처럼 전원을 켭니다."
          ]
        },
        {
          "kind": "p",
          "text": "필름 룩을 추가하거나 지우려면 먼저 카드를 연결한 다음, 사이트에서 룩을 바꾸고 변경 목록을 확인한 뒤 기록 버튼을 누르세요."
        },
        {
          "kind": "h2",
          "id": "update-zip",
          "text": "GRKU.zip에서 업데이트"
        },
        {
          "kind": "steps",
          "items": [
            "카메라 전원을 끕니다. 카드에서 `SCRIPT` 폴더를 삭제합니다.",
            "새 GRKU.zip의 `SD_ROOT`에서 `SCRIPT` 폴더만 카드의 최상위 경로에 복사합니다.",
            "카드를 카메라에 넣고 전원을 켭니다. {{MENU}} 버튼을 길게 누르지 마세요."
          ]
        },
        {
          "kind": "h2",
          "id": "uninstall",
          "text": "GRKU 제거"
        },
        {
          "kind": "p",
          "text": "설치 마지막 단계에서 카드를 연결하고 **GRKU 제거**를 누르세요. 설정과 필름 룩까지 함께 지울지 고른 다음 **Uninstall**을 누르세요. 또는 카메라를 끄고 `SCRIPT`와 `GRKU` 폴더를 직접 지워도 돼요. 사진은 그대로 남아요."
        },
        {
          "kind": "h2",
          "id": "scripts-off",
          "text": "SD 스크립트 끄기"
        },
        {
          "kind": "p",
          "text": "GRKU를 제거한 후에도 SD 스크립트는 켜진 상태로 유지됩니다. GRKU를 더 이상 사용하지 않을 경우에만 끄세요."
        },
        {
          "kind": "steps",
          "items": [
            "설치 마지막 단계에서 **SD 스크립트 끄기**를 사용해 파일을 카드에 쓰세요. 또는 파일을 내려받아 `SD_ROOT` 안의 내용을 카드에 복사하세요.",
            "카드를 삽입합니다. {{MENU}} 버튼을 누른 상태에서 카메라 전원을 켭니다. 전원이 자동으로 꺼질 때까지 기다립니다.",
            "카드에서 ModeSet 파일과 `DEVELOP.MOD`를 삭제합니다."
          ]
        },
        {
          "kind": "h2",
          "id": "format",
          "text": "카드를 포맷하기 전에"
        },
        {
          "kind": "p",
          "text": "포맷하면 GRKU와 설정이 삭제됩니다. 먼저 사진과 `GRKU` 폴더를 컴퓨터에 복사하세요. 포맷 후 GRKU를 다시 설치한 다음, `GRKU` 폴더를 카드의 최상위 경로에 다시 복사합니다."
        }
      ]
    },
    "film-look": {
      "title": "필름 룩",
      "sources": [
        "modules/film-look/module.toml",
        "runtime/menu_listed.h",
        "crates/grku-core/src/menu_text.rs (film, adjustments)",
        "CHANGELOG.md"
      ],
      "seo": "RICOH GR의 필름 룩: 필름 룩 사용 방법",
      "lead": "Image Control 대신 실시간 미리 보기로 보는 실제 필름과 다른 카메라의 룩입니다.",
      "keywords": "필름 룩 효과 이미지 컨트롤 LUT 포트라 클래식 크롬 코닥 후지 후지필름 파인픽스 포지티브 미리보기 Fn 파라미터 필름 스톡 film look effect image control lut portra classic chrome kodak fuji fujifilm finepix positive preview fn parameters film stock",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "필름 룩"
          ]
        },
        {
          "kind": "steps",
          "items": [
            "{{ADJ}} 버튼을 누르고 **GRKU**를 선택한 다음 **필름 룩**을 선택합니다.",
            "룩을 맞춰 보세요. 룩 아이콘과 함께 라이브 뷰에 바로 보입니다.",
            "적용하려면 {{OK}} 버튼을 누릅니다. 룩 없이 촬영하려면 **꺼짐**을 선택합니다."
          ]
        },
        {
          "kind": "screen",
          "screen": "adj",
          "alt": "ADJ 메뉴의 GRKU 화면: 첫 번째 모듈이 필름 룩이고 화면에 Film Look: 꺼짐이 표시됩니다."
        },
        {
          "kind": "h2",
          "id": "adjust",
          "text": "룩 조절하기"
        },
        {
          "kind": "p",
          "text": "룩을 강조한 뒤 {{Fn}} 버튼을 누릅니다. 이미지 컨트롤처럼 채도, 대비, 주변광량 감소(Shading), 선명도(Clarity) 등 카메라의 룩 조절 항목이 열립니다. 각 룩은 자체 조절값을 유지합니다."
        },
        {
          "kind": "h2",
          "id": "image-control",
          "text": "필름 룩과 이미지 컨트롤"
        },
        {
          "kind": "p",
          "text": "룩이 켜져 있는 동안에는 이미지 컨트롤 대신 적용됩니다. 이미지 컨트롤 설정은 바뀌지 않으며 **꺼짐**을 선택하면 다시 돌아옵니다."
        },
        {
          "kind": "h2",
          "id": "menu-rows",
          "text": "MENU에서"
        },
        {
          "kind": "table",
          "head": [
            "항목",
            "기능"
          ],
          "rows": [
            [
              "**필름 종류**",
              "ADJ와 마찬가지로 룩을 선택합니다."
            ],
            [
              "**파라미터**",
              "룩이 켜져 있을 때 보여요. {{Fn}}처럼 그 룩의 세부 조절 화면을 열어요."
            ],
            [
              "**옵션**",
              "ADJ에 표시할 룩을 선택합니다."
            ],
            [
              "**순서**",
              "두 개 이상 선택했을 때 ADJ에서 나오는 순서를 정합니다."
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "which",
          "text": "카드에 들어 있는 룩"
        },
        {
          "kind": "p",
          "text": "카드에는 룩을 최대 40개까지 담을 수 있습니다. [설치 페이지](site:install)에서 선택할 수 있으며, [현상 페이지](site:develop)에서 내 사진에 먼저 적용해 볼 수 있습니다. [사이트에서 룩 선택하기](doc:looks)를 참고하세요."
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "알아두면 좋은 점",
          "text": "이 룩들은 GR III 센서에 맞춰 만들어졌기 때문에 GR IV에서는 색감이 조금 다를 수 있습니다. GR IV Monochrome은 센서에 색 정보가 없으므로 필름 룩이 없습니다."
        }
      ]
    },
    "recipes": {
      "title": "레시피",
      "sources": [
        "modules/recipes/module.toml",
        "runtime/recipe_page.h",
        "crates/grku-core/src/menu_text.rs (recipe_*)",
        "CHANGELOG.md 1.9.0"
      ],
      "seo": "GR 필름 레시피: 한 단계로 설정 저장 및 전환",
      "lead": "카메라 설정과 함께 룩 전체를 저장하고 한 번에 전환합니다.",
      "keywords": "레시피 สูตรสี 프리셋 저장 설정 실행 취소 이름 변경 삭제 적용 보기 화이트 밸런스 노출 recipe preset save settings undo rename delete apply view white balance exposure",
      "blocks": [
        {
          "kind": "p",
          "text": "레시피에는 필름 룩 또는 Image Control, 입자감, 글로우, 테두리, 화이트 밸런스와 카메라의 보정 및 노출 설정이 담깁니다."
        },
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "레시피"
          ]
        },
        {
          "kind": "h2",
          "id": "save",
          "text": "레시피 저장"
        },
        {
          "kind": "steps",
          "items": [
            "카메라와 GRKU를 원하는 대로 설정합니다.",
            "{{ADJ}}를 누르고 **GRKU**를 선택한 뒤 **레시피**를 선택합니다.",
            "**설정 저장**을 선택합니다. 카메라 키보드로 이름을 입력하고 {{OK}}를 누릅니다."
          ]
        },
        {
          "kind": "h2",
          "id": "apply",
          "text": "레시피 사용"
        },
        {
          "kind": "steps",
          "items": [
            "**레시피**에서 레시피를 선택해 하이라이트합니다. 라이브 뷰에 적용된 모습이 보이고, 화면 왼쪽에 설정이 표시됩니다.",
            "{{OK}}를 눌러 적용합니다.",
            "마음이 바뀌었나요? **실행 취소**를 선택하세요. 레시피로 바뀐 모든 카메라 설정을 원래대로 되돌립니다."
          ]
        },
        {
          "kind": "h2",
          "id": "edit",
          "text": "이름 변경 또는 삭제"
        },
        {
          "kind": "p",
          "text": "레시피를 선택해 강조 표시하고 {{Fn}}을 누른 뒤 **이름 변경** 또는 **삭제**를 고르세요. MENU의 각 레시피 페이지에는 **적용**과 **보기**가 있으며, **보기**에서는 설정을 아이콘으로 보여줍니다."
        },
        {
          "kind": "h2",
          "id": "site",
          "text": "사이트의 레시피"
        },
        {
          "kind": "p",
          "text": "[설치](site:install) 3단계에서 인기 커뮤니티 레시피를 추가하거나 직접 만든 뒤, 룩과 함께 카드에 기록할 수 있습니다."
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "레시피에 모듈이 없다고 나오나요?",
          "text": "입자감이 들어간 레시피는 카드에 **입자감** 모듈이 있어야 하며, **글로우**와 **테두리**도 마찬가지입니다. 카드에 없는 룩이 포함된 레시피는 **효과가 설치되지 않음**이라고 표시됩니다."
        }
      ]
    },
    "framing": {
      "title": "프레이밍",
      "sources": [
        "modules/framing/module.toml",
        "modules/framing/text/en.toml"
      ],
      "seo": "RICOH GR의 XPan 및 기타 화면 비율(프레이밍)",
      "lead": "XPan, 2.35:1, 16:9, 1:1 등 다른 화상비율로 촬영하세요.",
      "keywords": "프레이밍 화상비율 파노라마 프레임 라인 가이드 크롭 framing aspect ratio xpan panorama 65:24 16:9 4:3 2.35:1 1:1 5:4 7:6 3:4 mask frame lines guides only crop",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "프레이밍"
          ]
        },
        {
          "kind": "frame",
          "mode": "framing",
          "alt": "선택한 비율의 틀이 들어간, GRKU로 찍은 돌집 앞 정원 길 사진입니다."
        },
        {
          "kind": "p",
          "text": "비율을 강조 표시하면 라이브 뷰에 프레임이 나타납니다. {{OK}}를 눌러 적용하세요. JPEG는 해당 비율로 크롭되고 DNG는 3:2로 유지됩니다."
        },
        {
          "kind": "table",
          "head": [
            "설정",
            "선택 항목"
          ],
          "rows": [
            [
              "**화상비율**",
              "꺼짐, XPan 65:24, 16:9, 4:3, 2.35:1, 1:1, 5:4, 7:6, 3:4"
            ],
            [
              "**모드**",
              "**크롭**(기본값)은 JPEG을 자릅니다. **구도 가이드만**은 프레임을 띄우고 전체 사진을 그대로 둡니다."
            ],
            [
              "**마스크**",
              "프레임 바깥 영역을 화면에 표시하는 방식입니다: **어둡게**(기본값), **검정**, **프레임 선**."
            ],
            [
              "**아이콘 표시**",
              "촬영 화면에 비율을 표시합니다: 켜짐(기본값) 또는 꺼짐."
            ]
          ]
        },
        {
          "kind": "p",
          "text": "프레이밍에서 {{Fn}}을 눌러 **모드**와 **마스크**를 설정하세요. 3:4는 하프 프레임 카메라 같은 세로 프레임입니다."
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "크롭과 함께 사용",
          "text": "프레이밍은 [크롭](doc:crop)과 함께 동작합니다. XPan을 50 mm로 촬영할 수 있습니다."
        }
      ]
    },
    "crop": {
      "title": "크롭",
      "sources": [
        "modules/crop/module.toml",
        "modules/crop/text/en.toml",
        "runtime/modules.h (GR IIIx focal lengths)"
      ],
      "seo": "RICOH GR의 35, 50, 70mm 크롭(크롭)",
      "lead": "라이브 뷰에 프레임을 띄운 채 디지털 텔레컨버터처럼 더 긴 초점 거리로 촬영하세요.",
      "keywords": "크롭 초점 거리 35mm 40mm 50mm 70mm 57mm 71mm 100mm 줌 텔레 프레임 마스크 무크롭 RAW crop focal length 35mm 40mm 50mm 70mm 57mm 71mm 100mm zoom tele frame only mask uncropped raw",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "크롭"
          ]
        },
        {
          "kind": "frame",
          "mode": "crop",
          "alt": "선택한 초점 거리 프레임이 표시된, GRKU로 찍은 돌집으로 가는 정원 길입니다."
        },
        {
          "kind": "table",
          "head": [
            "설정",
            "선택 항목"
          ],
          "rows": [
            [
              "**초점 거리**",
              "**꺼짐**, 35, 40, 50, 또는 70 mm. GR IIIx에서는 **꺼짐**, 50, 57, 71, 또는 100 mm."
            ],
            [
              "**모드**",
              "**크롭**(기본값)은 사진을 자릅니다. **프레임만**은 프레임을 표시하고 전체 사진을 유지합니다."
            ],
            [
              "**마스크**",
              "**어둡게**(기본값), **검정** 또는 **프레임 선**."
            ]
          ]
        },
        {
          "kind": "p",
          "text": "크롭에서 {{Fn}}을 눌러 **모드**와 **마스크**를 설정하세요. 크롭은 모든 프레이밍 비율에서 작동합니다."
        },
        {
          "kind": "note",
          "tone": "tip",
          "title": "DNG에 전체 사진 유지",
          "text": "[GRKU 설정](doc:settings#shooting)에서 **RAW 크롭 없음**을 켜세요. 그러면 DNG에 전체 센서 사진이 남고, Lightroom에서 크롭이 적용된 상태로 열리며 나중에 되돌릴 수 있습니다."
        }
      ]
    },
    "guides": {
      "title": "구도 가이드",
      "sources": [
        "modules/guides/module.toml",
        "modules/guides/text/en.toml"
      ],
      "seo": "GR의 구도 가이드: 삼분할, 황금비, 나선",
      "lead": "화면의 구도 선입니다. 사진에는 나타나지 않습니다.",
      "keywords": "구도 가이드 격자 선 9분할 중앙 황금비 대각선 황금 나선 동적 대칭 구도 표시 불투명도 색상 guides grid lines thirds center golden ratio diagonals golden spiral dynamic symmetry composition disp opacity color",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "구도 가이드"
          ]
        },
        {
          "kind": "frame",
          "mode": "guides",
          "alt": "선택한 가이드 선이 표시된, GRKU로 찍은 돌집으로 가는 정원 길입니다."
        },
        {
          "kind": "table",
          "head": [
            "설정",
            "선택 항목"
          ],
          "rows": [
            [
              "**스타일**",
              "꺼짐, 9분할, 화면 중앙, 황금비, 대각선, 9분할+화면 중앙, 황금 나선, 동적 대칭"
            ],
            [
              "**색상**",
              "검정(기본값), 흰색, 노랑"
            ],
            [
              "**불투명도**",
              "50%(기본값) 또는 100%"
            ],
            [
              "**DISP로 숨기기**",
              "켜짐(기본값): {{DISP}}로 화면 정보를 숨길 때 선도 숨겨집니다. 꺼짐: 항상 표시됩니다."
            ],
            [
              "**나선 중심**",
              "황금 나선이 돌아가는 위치: 왼쪽 위, 오른쪽 위, 오른쪽 아래(기본값) 또는 왼쪽 아래."
            ]
          ]
        },
        {
          "kind": "p",
          "text": "ADJ에서 **황금 나선**이 선택된 상태로 {{Fn}}을 누르면 나선이 다음 모서리로 회전합니다. GRKU가 가이드를 표시하는 동안 카메라는 자체 격자선을 숨깁니다."
        }
      ]
    },
    "date": {
      "title": "날짜 각인",
      "sources": [
        "modules/date/module.toml",
        "modules/date/text/en.toml",
        "CHANGELOG.md 1.9.0, 1.10.0"
      ],
      "seo": "RICOH GR 사진의 날짜 스탬프(날짜 각인)",
      "lead": "필름 카메라처럼 사진에 날짜를 인쇄합니다. 세 가지 글꼴과 다섯 가지 색상을 지원하며 캡션을 넣을 수 있습니다.",
      "keywords": "날짜 각인 스탬프 시간 글꼴 클래식 gr1s gr ii 색상 주황 크기 위치 모서리 캡션 고마워요 생일 축하 grku 글로우 date imprint stamp time font classic gr1s gr ii color orange size position corner caption thank you happy birthday grku glow",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "날짜 각인"
          ]
        },
        {
          "kind": "photo",
          "photo": "portra-heart",
          "alt": "정원의 파라솔 아래 선베드 두 개: 흰색 **인스턴트** 테두리와 GRKU <3 문구가 담긴 날짜가 들어간 Kodak Portra 400 사진입니다."
        },
        {
          "kind": "p",
          "text": "날짜 스타일을 선택한 뒤 {{OK}}를 누르세요. 다른 설정은 {{Fn}}을 눌러 열 수 있습니다. 카메라 시계의 날짜와 시간이 인쇄되므로 먼저 시계를 맞추세요."
        },
        {
          "kind": "table",
          "head": [
            "설정",
            "선택 항목"
          ],
          "rows": [
            [
              "**날짜 서식**",
              "꺼짐, 'YY M D, 'YY M D H:MM, M D 'YY, D M 'YY, D M 'YY H:MM"
            ],
            [
              "**날짜 위치**",
              "**필름**(기본값)은 필름 카메라 위치에 찍습니다. **정방향**은 세로 사진에서 날짜를 똑바로 유지합니다."
            ],
            [
              "**날짜 모서리**",
              "오른쪽 아래(기본값), 왼쪽 아래, 오른쪽 위 또는 하단 분할: 왼쪽에 날짜, 오른쪽에 캡션이 표시됩니다."
            ],
            [
              "**날짜 크기**",
              "S, M(기본값), M-L, L"
            ],
            [
              "**날짜 글꼴**",
              "클래식(기본값), GR1s(도트 매트릭스), GR II"
            ],
            [
              "**날짜 색상**",
              "표준(기본값): 글꼴 색으로, 클래식과 GR II는 주황색, GR1s는 노란색이고 흑백 사진에서는 흰색입니다. 또는 주황색, 흰색, 세피아, LED 노랑입니다."
            ],
            [
              "**날짜 빛 번짐**",
              "꺼짐(기본값) 또는 켜짐: 숫자 주위로 부드러운 빛이 번집니다. GR II는 빛 번짐 없이 납작한 숫자로 찍힙니다."
            ],
            [
              "**캡션**",
              "꺼짐(기본값), THANK YOU, HAPPY BIRTHDAY, I <3 GR, I <3 YOU, GOOD TIMES, HOLIDAY, CHEERS, GRKU <3. 사진에서는 <3이 하트로 표시됩니다."
            ],
            [
              "**아이콘 표시**",
              "촬영 화면에 날짜 스타일을 보여줘요: **켜짐**(기본값) 또는 **꺼짐**."
            ]
          ]
        },
        {
          "kind": "photo",
          "photo": "neg-gr1s",
          "alt": "돌집과 정원 길: 얇은 검은색 테두리와 GR1s 글꼴 날짜가 들어간 **클래식** Neg 사진입니다."
        }
      ]
    },
    "glow": {
      "title": "글로우",
      "sources": [
        "modules/glow/module.toml",
        "modules/glow/text/en.toml"
      ],
      "seo": "RICOH GR의 블룸 및 할레이션(글로우)",
      "lead": "빛과 하이라이트 주변의 블룸과 영화 필름 특유의 붉은 주황빛 헐레이션 효과입니다.",
      "keywords": "글로우 블룸 헐레이션 시네스틸 레드 오렌지 골드 화이트 하이라이트 빛 야경 glow bloom halation cinestill red orange gold white highlights lights night",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "글로우"
          ]
        },
        {
          "kind": "photo",
          "photo": "portra-bloom",
          "alt": "데이지 꽃: Bloom Weak, **디퓨전** 1/4, **필름 부드러움** **약**, **입자감** Weak, 얇은 흰색 테두리, 날짜가 들어간 Kodak Portra 400 사진입니다."
        },
        {
          "kind": "p",
          "text": "글로우는 두 가지 요소로 나뉩니다. 각각 강도를 따로 조절할 수 있고 함께 사용할 수도 있습니다."
        },
        {
          "kind": "table",
          "head": [
            "설정",
            "선택 항목"
          ],
          "rows": [
            [
              "**블룸** › **강도**",
              "꺼짐, 약, 중, 강: 밝은 영역 주변에 부드러운 빛 번짐을 만듭니다."
            ],
            [
              "**헐레이션** › **강도**",
              "꺼짐, 약, 중, 강: CineStill 필름처럼 빛 주변에 색이 번지는 후광을 만듭니다."
            ],
            [
              "**헐레이션** › **색상**",
              "**빨강**, **주황색**(기본값), **금색**, **흰색**. GR IV Monochrome에서는 쓸 수 없습니다."
            ],
            [
              "**블룸** › **아이콘 표시**, **헐레이션** › **아이콘 표시**",
              "촬영 화면에 각 아이콘이 표시됩니다. 켜짐(기본값) 또는 꺼짐입니다."
            ]
          ]
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "재생 화면에서 확인",
          "text": "글로우는 JPEG에만 적용되며 라이브 뷰에는 표시되지 않습니다. 재생 화면에서 사진을 확인하세요."
        }
      ]
    },
    "light-leak": {
      "title": "라이트 리크",
      "sources": [
        "modules/lightleak/module.toml",
        "modules/lightleak/text/en.toml",
        "modules/lightleak/lightleak.c"
      ],
      "seo": "GR의 빛샘, 먼지, 비네트 효과",
      "lead": "오래된 필름의 흔적이에요: 비네트, 먼지와 머리카락, 빛샘, 스크래치.",
      "keywords": "라이트 리크 빛샘 비네팅 먼지 머리카락 스크래치 바랜 먼지 많은 빛샘 유통기한 지난 오래된 필름 로모 레트로 light leak vignette dust scratches faded dusty leaky expired old film lomo retro",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "라이트 리크"
          ]
        },
        {
          "kind": "photo",
          "photo": "kodachrome-leak",
          "alt": "세로로 찍은 돌집과 정원 길: Light Leak Faded, 입자감 약, 날짜가 들어간 Kodachrome 64 사진"
        },
        {
          "kind": "table",
          "head": [
            "설정",
            "선택 항목"
          ],
          "rows": [
            [
              "**룩**",
              "**꺼짐**, **커스텀**, **빛바램**, **먼지**, **빛샘**, **만료**. **커스텀**은 아래에서 내가 정한 강도를 써요. 나머지는 미리 만들어진 조합이에요."
            ],
            [
              "**비네팅**",
              "꺼짐, 약, 중, 강"
            ],
            [
              "**먼지**",
              "꺼짐, 약, 중, 강"
            ],
            [
              "**라이트 리크**",
              "꺼짐, 약, 중, 강"
            ],
            [
              "**스크래치**",
              "꺼짐, 약, 중, 강"
            ]
          ]
        },
        {
          "kind": "p",
          "text": "**커스텀**을 고르고 {{Fn}}을 눌러 각 요소의 강도를 정하세요. **먼지**, 빛샘, 스크래치는 찍는 사진마다 다르게 들어가요. **라이트 리크**는 JPEG만 바꾸고 라이브 뷰에는 보이지 않아요."
        }
      ]
    },
    "diffusion": {
      "title": "디퓨전",
      "sources": [
        "modules/diffusion/module.toml",
        "modules/diffusion/text/en.toml"
      ],
      "seo": "GR의 블랙 프로미스트 디퓨전과 필름 감성",
      "lead": "블랙 프로미스트 필터의 부드러운 빛 번짐과 필름 스캔의 은은한 부드러움을 더합니다.",
      "keywords": "디퓨전 필터 프로미스트 블랙미스트 스트릭 아나모픽 부드러움 필름 부드러움 소프트 몽환적 diffusion filter pro mist black mist streak anamorphic softness film softness soft dreamy",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "디퓨전"
          ]
        },
        {
          "kind": "photo",
          "photo": "pro400h",
          "alt": "데이지 꽃: 디퓨전 1/8, 필름 부드러움 약, 입자감 약, 날짜가 들어간 Fujifilm Pro 400H 사진"
        },
        {
          "kind": "p",
          "text": "디퓨전은 **필터**와 **부드러움** 두 가지로 나뉩니다. 각각 독립적으로 작동합니다."
        },
        {
          "kind": "table",
          "head": [
            "설정",
            "선택 항목"
          ],
          "rows": [
            [
              "**필터** › **강도**",
              "꺼짐, 1/8, 1/4, 1/2 — 디퓨전 필터 등급과 같은 단계입니다."
            ],
            [
              "**필터** › **블랙 미스트**",
              "**꺼짐**, **약**, **강**: 그림자 위에 얇은 막을 씌운 느낌이에요. **강도**가 **꺼짐**이 아닐 때 동작해요."
            ],
            [
              "**필터** › **스트릭**",
              "**꺼짐**, **블루**, **앰버**: 점광원에서 아나모픽 렌즈처럼 가로로 번지는 빛갈래예요. **강도**가 **꺼짐**이 아닐 때 동작해요."
            ],
            [
              "**부드러움** › **필름 부드러움**",
              "꺼짐, 약, 중, 강: 필름 스캔처럼 미세 디테일이 부드러워지고 하이라이트가 자연스럽게 감쇠합니다."
            ]
          ]
        },
        {
          "kind": "p",
          "text": "디퓨전은 JPEG에만 적용되며 라이브 뷰에는 표시되지 않습니다."
        }
      ]
    },
    "grain": {
      "title": "입자감",
      "sources": [
        "modules/grain/module.toml",
        "modules/grain/text/en.toml",
        "modules/grain/grain.c",
        "CHANGELOG.md 1.10.0"
      ],
      "seo": "RICOH GR의 필름 입자감: 강도, 크기, 필름 느낌",
      "lead": "카메라 방식 또는 필름 느낌의 필름 입자감을 4단계 강도와 4단계 크기로 조절합니다.",
      "keywords": "입자감 노이즈 필름 느낌 시스템 크기 강도 약 중 강 매우 강 grain noise film-like system size strength weak medium strong extra",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "입자감"
          ]
        },
        {
          "kind": "photo",
          "photo": "trix",
          "alt": "흑백 돌집과 정원 길: Grain Medium, GR1s 글꼴 날짜, 검은색 Wide 테두리가 들어간 Kodak Tri-X 400 사진"
        },
        {
          "kind": "table",
          "head": [
            "설정",
            "선택 항목"
          ],
          "rows": [
            [
              "**강도**",
              "꺼짐, 약, 중, 강, 매우 강"
            ],
            [
              "**크기**",
              "자동(기본값), 소, 중, 대"
            ],
            [
              "**스타일**",
              "**시스템**(기본값)은 카메라의 입자감입니다. **필름 느낌**은 컬러 네거티브 인화지의 입자감으로, 중간톤에서 가장 강하고 흰색이나 검은색에는 없으며 컬러 사진에서는 색이 들어갑니다."
            ],
            [
              "**아이콘 표시**",
              "켜짐(기본값) 또는 꺼짐"
            ]
          ]
        },
        {
          "kind": "p",
          "text": "입자감에서 {{Fn}} 버튼을 눌러 **크기**와 **스타일**을 설정하세요. 필름 느낌 입자감은 Andrea Volpato의 spektrafilm 입자 모델을 따릅니다."
        }
      ]
    },
    "border": {
      "title": "테두리",
      "sources": [
        "modules/border/module.toml",
        "modules/border/text/en.toml",
        "CHANGELOG.md 1.8.5",
        "web/src/generated/modules.ts (DEFAULT_MODULES)"
      ],
      "seo": "GR의 흰색, 검정, 인스턴트 사진 테두리",
      "lead": "사진 전체를 감싸는 흰색 또는 검정 테두리입니다. 사진의 픽셀은 그대로 유지됩니다.",
      "keywords": "border frame white black thin wide instant polaroid edge 테두리 프레임 흰색 검정 얇게 넓게 인스턴트 폴라로이드 가장자리",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "ADJ",
            "GRKU",
            "테두리"
          ]
        },
        {
          "kind": "photo",
          "photo": "velvia-wide",
          "alt": "돌집과 정원 길: 흰색 Wide 테두리와 날짜가 들어간 Fujifilm Velvia 사진"
        },
        {
          "kind": "photo",
          "photo": "acros-instant",
          "alt": "흑백 세로 구도의 돌집: 흰색 Instant 테두리와 GRKU <3 문구가 들어간 Fujifilm Acros 사진"
        },
        {
          "kind": "table",
          "head": [
            "설정",
            "선택 항목"
          ],
          "rows": [
            [
              "**스타일**",
              "꺼짐, **얇게**(짧은 변의 약 3%), **넓게**(약 6%), **인스턴트**(약 4%, 즉석사진처럼 아래쪽 여백이 3배 넓음). GR IV에서는 카메라 메모리가 부족할 때 큰 테두리가 조금 좁아질 수 있습니다."
            ],
            [
              "**색상**",
              "흰색(기본값) 또는 검정"
            ],
            [
              "**아이콘 표시**",
              "켜짐(기본값) 또는 꺼짐"
            ]
          ]
        },
        {
          "kind": "p",
          "text": "테두리만큼 JPEG 크기가 커져서 사진이 가려지지 않습니다. 카메라 내 RAW 현상으로도 테두리를 넣을 수 있습니다."
        },
        {
          "kind": "note",
          "tone": "plain",
          "title": "카드에 없나요?",
          "text": "초기 설치에는 테두리가 빠져 있어요. [설치](site:install) 3단계에서 테두리를 켜세요. 카드에는 모듈을 최대 10개까지 넣을 수 있어요. 10개가 모두 켜져 있다면 덜 쓰는 모듈 하나를 끄세요."
        }
      ]
    },
    "mode-dial": {
      "title": "모드 다이얼과 U1–U3",
      "sources": [
        "runtime/mode_dial.h",
        "runtime/menu_dial.h",
        "CHANGELOG.md 1.9.0"
      ],
      "seo": "모드 다이얼의 GRKU: U1, U2, U3 설정",
      "lead": "각 다이얼 위치에서 GRKU를 켜거나 끄고, 전체 룩을 U1, U2 또는 U3에 저장합니다.",
      "keywords": "모드 다이얼 u1 u2 u3 사용자 모드 현재 설정 저장 p av tv m sn 위치 mode dial u1 u2 u3 user mode save current settings p av tv m sn position",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "MENU",
            "사용자 설정 (C)",
            "GRKU",
            "GRKU 설정",
            "모드 다이얼"
          ]
        },
        {
          "kind": "p",
          "text": "P, Av, Tv, M, Sn(GR IV)은 GRKU 설정 세트를 하나 함께 씁니다. 각 위치에서 GRKU를 **켜짐** 또는 **꺼짐**으로 둘 수 있습니다. **GRKU 사용**이 켜져 있을 때만 이렇게 동작합니다."
        },
        {
          "kind": "h2",
          "id": "user",
          "text": "U1, U2, U3"
        },
        {
          "kind": "list",
          "items": [
            "**켜짐**: P, Av, Tv, M과 마찬가지로 해당 위치에서 공유 GRKU 설정을 사용합니다.",
            "**꺼짐**: GRKU 없이 촬영합니다.",
            "**현재 설정 저장**: 지금의 카메라 설정과 GRKU 설정을 이 위치에 저장해요. 다이얼을 그 위치로 돌리면 둘 다 다시 불러와져요. 그러면 그 위치에 저장된 이름이 보여요. ADJ 순서, 시작 시 사용, GRKU 사용, 모드 다이얼 설정은 저장되지 않아요."
          ]
        },
        {
          "kind": "note",
          "tone": "warning",
          "title": "카메라 메뉴에서 저장",
          "text": "RICOH 카메라 메뉴로 사용자 모드를 다시 저장하면 해당 위치의 GRKU 룩이 사라집니다. 대신 GRKU 설정의 **현재 설정 저장**을 사용하세요."
        }
      ]
    },
    "raw": {
      "title": "RAW 현상",
      "sources": [
        "runtime/develop_settings.h",
        "runtime/picture.c",
        "CHANGELOG.md 1.9.0"
      ],
      "seo": "필름 룩으로 GR DNG 파일 현상하기(RAW 현상)",
      "lead": "GRKU는 원본 데이터를 변경하지 않습니다. 카메라에서 GRKU로 DNG를 현상하거나 컴퓨터에서 현상하세요.",
      "keywords": "raw dng 현상 카메라 내 현상 재생 lightroom camera raw exiftool xmp 무크롭 raw dng development develop in camera playback lightroom camera raw exiftool xmp uncropped",
      "blocks": [
        {
          "kind": "h2",
          "id": "camera",
          "text": "카메라에서"
        },
        {
          "kind": "steps",
          "items": [
            "재생 화면에서 DNG를 열고 RAW 현상을 시작합니다.",
            "필름 룩을 바꾸려면 이미지 컨트롤 목록을 엽니다. 룩에서 {{Fn}}을 눌러 조정합니다.",
            "**입자감**, **글로우**, **테두리**, **날짜 각인**을 설정하려면 목록 끝의 **GRKU** 행을 엽니다.",
            "현상을 실행합니다."
          ]
        },
        {
          "kind": "p",
          "text": "DNG에 기록된 GRKU 설정이 있으면 그 설정에서 현상을 시작해요. GRKU 행은 이 현상만 바꿔요."
        },
        {
          "kind": "h2",
          "id": "computer",
          "text": "컴퓨터에서"
        },
        {
          "kind": "p",
          "text": "GRKU를 켜고 찍은 사진은 설정이 XMP에 기록되어 exiftool 같은 XMP 뷰어에서 볼 수 있어요. **RAW 크롭 없음**을 켜면 Lightroom과 Camera Raw에서 촬영한 크롭이 적용된 DNG를 열고, 그 크롭을 되돌릴 수도 있어요."
        },
        {
          "kind": "p",
          "text": "이미 가지고 있는 사진에는 [현상 페이지](doc:develop)에서 브라우저로 동일한 룩과 효과를 적용할 수 있습니다."
        }
      ]
    },
    "settings": {
      "title": "GRKU 설정",
      "sources": [
        "runtime/menu_settings.h",
        "runtime/manage.h",
        "runtime/playback_info.h",
        "crates/grku-core/src/menu_text.rs"
      ],
      "seo": "MENU의 GRKU 설정: 모든 옵션 설명",
      "lead": "MENU에 있는 GRKU 자체의 설정입니다.",
      "keywords": "grku 설정 시작 시 사용 이전 상태 raw 크롭 없음 거리 단위 미터 피트 배터리 재생 아이콘 종료 화면 커스텀 텍스트 표시 adj 메뉴 순서 숨김 상단 grku settings enable at start keep last uncropped raw distance unit meters feet battery playback icons shutdown screen custom picture show text adj order hidden top",
      "blocks": [
        {
          "kind": "path",
          "items": [
            "MENU",
            "사용자 설정 (C)",
            "GRKU",
            "GRKU 설정"
          ]
        },
        {
          "kind": "table",
          "head": [
            "항목",
            "기능"
          ],
          "rows": [
            [
              "**시작 시 사용**",
              "전원을 켤 때마다 GRKU를 **켜짐**, **꺼짐**, 또는 그대로 둔 **이전 상태**로 설정합니다."
            ],
            [
              "**모드 다이얼**",
              "각 다이얼 위치와 U1~U3에서 GRKU를 켜거나 끕니다. [모드 다이얼](doc:mode-dial)을 참고하세요."
            ],
            [
              "**ADJ 메뉴 순서**",
              "ADJ의 GRKU 목록에서 모듈 순서입니다."
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "adj-order",
          "text": "ADJ 순서"
        },
        {
          "kind": "p",
          "text": "GRKU 목록에서 모듈을 위나 아래로 이동합니다. **상단 1**~**상단 4**를 선택하면 GRKU 앞 ADJ 툴바에 모듈 전용 항목이 생겨 한 번 누르면 바로 열립니다. **숨김**은 작동은 유지한 채 ADJ에서 모듈을 숨깁니다."
        },
        {
          "kind": "h2",
          "id": "shooting",
          "text": "촬영 설정"
        },
        {
          "kind": "table",
          "head": [
            "항목",
            "기능"
          ],
          "rows": [
            [
              "**RAW 크롭 없음**",
              "켜짐: 각 DNG에 전체 센서 이미지가 유지되며, 촬영 크롭은 Lightroom과 Camera Raw에서 되돌릴 수 있는 설정으로 저장됩니다. 이 경우 Lightroom이 자체 RAW 기본값을 적용하지 않을 수 있습니다."
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "display",
          "text": "표시 설정"
        },
        {
          "kind": "table",
          "head": [
            "항목",
            "기능"
          ],
          "rows": [
            [
              "**거리 단위**",
              "스냅 포커스 거리와 수동 초점 눈금을 **미터** 또는 **피트**로 표시합니다."
            ],
            [
              "**간이 정보 배터리**",
              "라이브 뷰 간이 정보에도 배터리 아이콘을 표시합니다."
            ],
            [
              "**재생 효과 아이콘**",
              "상세 재생 정보 첫 페이지에 사진의 입자감, 블룸, 헐레이션, 테두리, 날짜 각인 아이콘과 사진 크롭을 보여줍니다. 기본값은 켜짐입니다."
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "shutdown",
          "text": "종료 화면"
        },
        {
          "kind": "table",
          "head": [
            "항목",
            "기능"
          ],
          "rows": [
            [
              "**사용자 지정 이미지**",
              "카메라를 끌 때 직접 넣은 사진(`GRKU/GOODBYE.JPG`)을 보여줍니다. 기본값은 켜짐입니다. [종료 화면 사진](doc:shutdown)을 참고하세요."
            ],
            [
              "**텍스트 표시**",
              "카메라가 종료 화면 위에 그리는 촬영 횟수와 펌웨어 버전을 보이게 하거나 숨겨요."
            ]
          ]
        }
      ]
    },
    "looks": {
      "title": "사이트에서 룩 고르기",
      "sources": [
        "web/src/plus.ts (FREE_SLOTS)",
        "web/src/lookSearch.ts",
        "web/src/strings/en.ts (importOpen, kindImported)",
        "CHANGELOG.md 1.9.0 (xmp)"
      ],
      "seo": "필름 룩 선택 방법과 LUT 또는 Lightroom 프리셋 가져오기",
      "lead": "카드에 넣을 필름 룩을 고르고 라이브러리를 검색하며 나만의 LUT을 가져오세요.",
      "keywords": "라이브러리 룩 고르기 검색 슬롯 무료 10 40 가져오기 lut cube xmp lightroom 프리셋 종류 네거티브 슬라이드 흑백 library choose looks search slots free 10 40 import lut cube xmp lightroom preset kinds negative slide black and white",
      "blocks": [
        {
          "kind": "p",
          "text": "[설치](site:install) 1단계에서 전체 라이브러리를 볼 수 있습니다: Kodak, Fujifilm, Ilford, CineStill, Polaroid, 시네마 및 슬라이드 필름, 흑백, FUJIFILM 카메라의 필름 시뮬레이션, 그리고 Positive GRII와 FinePix CCD 같은 GRKU 자체 룩이 있습니다."
        },
        {
          "kind": "h2",
          "id": "pick",
          "text": "룩 고르기"
        },
        {
          "kind": "steps",
          "items": [
            "샘플 사진에서 보려면 룩을 눌러 보세요.",
            "카드에 넣을 룩을 선택하세요. 10개는 무료이고, 카드 한 장에 최대 40개까지 들어갑니다.",
            "이름, 브랜드, 종류로 검색해 보세요. 예를 들어 \"portra\", \"fuji\", \"ขาวดำ\"처럼 입력할 수 있어요. 긴 단어에 오타가 조금 있어도 괜찮아요."
          ]
        },
        {
          "kind": "p",
          "text": "내 사진에 먼저 적용해 보고 싶나요? **내 사진에 적용해 보기**를 눌러 [현상 페이지](doc:develop)에서 여세요."
        },
        {
          "kind": "h2",
          "id": "import",
          "text": "나만의 룩 가져오기"
        },
        {
          "kind": "steps",
          "items": [
            "1단계에서 **LUT 가져오기**를 누르세요.",
            "`.cube` 파일이나 Lightroom `.xmp` 프리셋을 선택하세요.",
            "룩이 **가져온 필름** 아래에 표시됩니다. 다른 룩과 마찬가지로 선택하세요."
          ]
        },
        {
          "kind": "p",
          "text": "Lightroom 프리셋은 색상 설정을 바탕으로 한 룩이 됩니다. 사진마다 달라지는 설정은 대략적으로만 반영됩니다."
        },
        {
          "kind": "h2",
          "id": "modules",
          "text": "모듈"
        },
        {
          "kind": "p",
          "text": "3단계에서 모듈을 고릅니다. 카드에는 11개 모듈 중 최대 10개까지 담을 수 있으며, 처음 설치할 때는 테두리가 빠집니다. 3단계에서 레시피와 [종료 화면 사진](doc:shutdown)도 추가합니다."
        }
      ]
    },
    "plus": {
      "title": "GRKU Plus",
      "sources": [
        "web/src/plus.ts",
        "web/src/strings/en.ts (plus)",
        "web/src/components/PlusSheet.tsx"
      ],
      "seo": "GRKU Plus: 가격, 결제, 키 안내",
      "lead": "카드에 더 많은 룩을 담기 위한 선택적 일회성 결제입니다. 없어도 GRKU는 무료로 계속 쓸 수 있습니다.",
      "keywords": "플러스 가격 결제 구매 키 이메일 프롬프트페이 트루머니 슬롯 팩 전체 잠금해제 환불 바트 plus price pay buy key email promptpay truemoney slots pack everything unlock refund baht",
      "blocks": [
        {
          "kind": "p",
          "text": "GRKU의 모든 기능은 무료예요. 모든 룩 미리보기는 무료이고, 라이브러리의 룩 10개도 카드에 무료로 넣을 수 있으며, 모든 모듈과 레시피, Develop 페이지도 무료예요. GRKU Plus는 카드에 더 많은 룩을 넣고 프로젝트를 응원하고 싶은 분들을 위한 옵션이에요."
        },
        {
          "kind": "h2",
          "id": "tiers",
          "text": "잠금 해제할 수 있는 항목"
        },
        {
          "kind": "list",
          "items": [
            "**25 slots**: 10개 대신 원하는 룩 25개를 카드에 넣을 수 있습니다.",
            "**One pack**: 무료 슬롯에 더해 코닥 컬러나 흑백 같은 한 필름 계열의 모든 룩을 받습니다.",
            "**Everything**: 기존 및 신규 룩 전체를 한 번에 40개까지 카드에 넣고, GRKU Studio의 모든 기능을 이용합니다."
          ]
        },
        {
          "kind": "p",
          "text": "어떤 항목을 결제하든 GRKU Studio와 그 디자인 전체도 함께 열립니다. 가격은 [GRKU Plus](site:plus) 화면에 있습니다. 이전에 결제한 금액은 Everything과 25 slots에 반영됩니다."
        },
        {
          "kind": "h2",
          "id": "pay",
          "text": "결제"
        },
        {
          "kind": "steps",
          "items": [
            "[GRKU Plus](site:plus)를 열고 잠금 해제할 항목을 고릅니다.",
            "태국 은행 앱의 PromptPay QR로 결제한 뒤 영수증을 업로드하세요. 또는 시트에 안내가 있다면 TrueMoney 기프트 링크를 붙여넣으세요.",
            "룩이 바로 잠금 해제돼요.",
            "키가 이메일로 발송됩니다. 모든 기기에서 사용할 수 있습니다."
          ]
        },
        {
          "kind": "h2",
          "id": "key",
          "text": "다른 기기에서 키 사용하기"
        },
        {
          "kind": "p",
          "text": "[GRKU Plus](site:plus-key)를 열고 **키가 있습니다**를 선택한 뒤 키를 붙여넣고 **잠금 해제**를 누릅니다. 이메일이 오지 않았나요? **키가 있습니다**에서 다시 보낼 수 있습니다."
        }
      ]
    },
    "shutdown": {
      "title": "종료 화면과 GRKU Studio",
      "sources": [
        "web/src/strings/en.ts (shutdown)",
        "web/src/shutdownDesigns.ts",
        "CHANGELOG.md 1.9.0, 1.10.0",
        "runtime/manage.h (Custom Picture, Show Text)"
      ],
      "seo": "RICOH GR용 커스텀 종료 화면(GRKU Studio)",
      "lead": "카메라가 꺼질 때 원하는 사진을 띄우거나 GRKU Studio에서 직접 만드세요.",
      "keywords": "종료 화면 사진 작별 전원 끄기 스튜디오 디자인 스티커 템플릿 로고 사용자 지정 사진 shutdown screen picture goodbye power off studio design sticker template logo custom picture",
      "blocks": [
        {
          "kind": "p",
          "text": "카메라가 꺼질 때 GRKU가 원하는 사진을 보여줄 수 있습니다. 카메라는 카드의 `GRKU/GOODBYE.JPG`에서 사진을 읽습니다."
        },
        {
          "kind": "h2",
          "id": "choose",
          "text": "사진 선택"
        },
        {
          "kind": "steps",
          "items": [
            "[설치](site:install) 3단계에서 종료 화면 카드를 엽니다.",
            "미리 만든 디자인을 고르거나 직접 만들거나, 카메라 기본 화면을 쓰려면 꺼짐을 고르세요.",
            "평소처럼 카드를 쓰세요. 다음 전원 켜기부터 새 화면이 보여요. GRKU.zip을 쓸 때는 `GOODBYE.JPG`도 내려받아 카드의 `GRKU` 폴더에 넣으세요."
          ]
        },
        {
          "kind": "p",
          "text": "기본 디자인에는 노을, 잠자는 달, 낮잠 자는 고양이, 필름 롤, 영수증이 있고 원하는 문구를 넣을 수 있습니다. 내 사진은 3:2 비율로 잘립니다."
        },
        {
          "kind": "h2",
          "id": "studio",
          "text": "GRKU Studio"
        },
        {
          "kind": "p",
          "text": "GRKU Studio는 레이어 편집기입니다. 배경, 내 사진, 로고, 누끼 PNG 파일, 8가지 글꼴의 텍스트, 스티커, 프레임과 송크란, 러이끄라통, 새해, 밸런타인데이 템플릿을 쓸 수 있습니다. 툴바에서 추가하거나 파일을 끌어다 놓거나 붙여넣어 사진을 넣습니다."
        },
        {
          "kind": "p",
          "text": "GRKU Studio 일부 기능과 일부 디자인은 무료입니다. [GRKU Plus](doc:plus)를 구매하면 모두 열립니다."
        },
        {
          "kind": "h2",
          "id": "camera",
          "text": "카메라에서"
        },
        {
          "kind": "p",
          "text": "[GRKU 설정](doc:settings#shutdown)에서 **사용자 지정 이미지**로 이미지를 켜거나 끌 수 있고, **텍스트 표시**로 카메라가 그 위에 띄우는 촬영 매수를 숨깁니다."
        }
      ]
    },
    "develop": {
      "title": "현상 페이지",
      "sources": [
        "web/src/components/Develop.tsx",
        "web/src/develop/gating.ts",
        "web/src/develop/install.ts",
        "CHANGELOG.md 1.10.1"
      ],
      "seo": "사진용 무료 온라인 필름 필터(Develop 화면)",
      "lead": "이미 찍은 사진에 브라우저에서 GRKU의 필름 룩과 효과를 적용합니다.",
      "keywords": "현상 편집 사진 브라우저 온라인 필터 체험 미리보기 다운로드 카메라 없음 폰 develop edit photo browser online filter try preview download no camera phone",
      "blocks": [
        {
          "kind": "p",
          "text": "[Develop 페이지](site:develop)에서는 내 사진에 GRKU 필름 룩을 미리 볼 수 있고, 효과는 카메라 모듈 코드로 만들어져요. 카메라가 없어도 되고, 사진은 내 기기 밖으로 나가지 않아요."
        },
        {
          "kind": "steps",
          "items": [
            "[현상 페이지](site:develop)를 열고 사진을 추가합니다.",
            "룩을 고른 뒤 글로우, 라이트 리크, 디퓨전, 필름 부드러움, 입자감, 날짜 각인, 테두리 효과를 더합니다.",
            "사진을 저장하세요. 또는 **내 GR에 적용**을 누르면 선택한 룩과 모듈이 담긴 설치 페이지가 열려요. 각 효과의 강도는 카메라에서 설정해요."
          ]
        },
        {
          "kind": "p",
          "text": "무료 저장은 카메라 룩, 기본 룩, 또는 룩 없음 상태로 최대 2048 px까지 가능하며 작은 GRKU 표시가 들어가요. GRKU Plus를 한 번이라도 구매하면 이 표시 없이 모든 룩을 원본 크기로 저장할 수 있어요."
        }
      ]
    },
    "assistant": {
      "title": "AI 어시스턴트",
      "sources": [
        "web/src/chat/strings.ts",
        "web/src/components/ChatPanel.tsx",
        "services/plus/src/chat/index.ts"
      ],
      "seo": "GRKU AI 어시스턴트: GR과 필름 룩에 대해 질문하기",
      "lead": "설치 방법, 카메라, 사진에 어울리는 룩을 GRKU 어시스턴트에게 물어보세요.",
      "keywords": "ai 어시스턴트 채팅 질문 도움말 봇 마스코트 메모리 ai assistant chat ask question help bot mascot memory",
      "blocks": [
        {
          "kind": "p",
          "text": "페이지 오른쪽 아래의 둥근 버튼을 누르면 GRKU 어시스턴트가 열립니다. 이 사이트와 설명서 내용을 바탕으로 알맞은 페이지 링크와 함께 내 언어로 답해 줍니다."
        },
        {
          "kind": "h2",
          "id": "ask",
          "text": "물어보기 좋은 질문"
        },
        {
          "kind": "list",
          "items": [
            "\"GR IIIx에 GRKU를 어떻게 설치하나요?\"",
            "\"MENU를 길게 누를 때 카메라에 펌웨어 업데이트 화면이 뜹니다.\"",
            "\"인물 사진에 어울리는 따뜻한 룩을 추천해 주세요.\"",
            "\"헐레이션은 어떤 역할을 하나요?\""
          ]
        },
        {
          "kind": "p",
          "text": "이 매뉴얼의 각 페이지에서 **Ask AI about this page**를 누르면 해당 페이지를 기준으로 어시스턴트가 열립니다."
        },
        {
          "kind": "h2",
          "id": "limits",
          "text": "알아두면 좋은 점"
        },
        {
          "kind": "list",
          "items": [
            "하루 메시지 수 제한이 있습니다. GRKU Plus 사용자는 더 깊이 있는 대화와 자세한 답변을 받을 수 있습니다.",
            "기억 기능을 켜면 브라우저가 내 카메라, 펌웨어 버전, 좋아하는 룩을 저장해 질문할 때 함께 보냅니다.",
            "AI는 틀릴 수 있습니다. 카메라 펌웨어 관련 내용은 이 매뉴얼과 RICOH 안내를 따르세요."
          ]
        }
      ]
    },
    "not-showing": {
      "title": "GRKU가 보이지 않을 때",
      "sources": [
        "docs/diagnostics.md",
        "resources/INSTALLATION-GR4.md (Troubleshooting)",
        "web/src/strings/en.ts (faq adj)"
      ],
      "seo": "카메라에 GRKU가 표시되지 않을 때: 해결 방법",
      "lead": "아래 항목을 한 번에 하나씩 순서대로 확인해 보세요.",
      "keywords": "안 보임 작동 안 함 누락 adj no grku 오류 install.err report boot.txt 47 48 펌웨어 모드 설정 not showing not working missing adj no grku error install.err report boot.txt 47 48 firmware mode set",
      "blocks": [
        {
          "kind": "h2",
          "id": "checks",
          "text": "순서대로 확인"
        },
        {
          "kind": "steps",
          "items": [
            "**기다리기.** GRKU는 전원을 켠 뒤 약 8~10초 뒤에 켜지며, GR IV나 설치·업데이트 뒤에는 더 오래 걸려요. 그전에 찍은 사진에는 GRKU가 적용되지 않아요.",
            "**카메라와 펌웨어.** MENU를 열고 펌웨어 버전을 확인하세요. [지원 카메라](doc:cameras) 목록에 있어야 해요. [펌웨어 버전 확인하기](doc:firmware)를 참고하세요.",
            "**SD 스크립트.** 처음 전원을 켤 때 {{MENU}}를 길게 눌러 **모드 Set Command**와 **Complete**가 표시되었나요? 표시되지 않았다면 [첫 실행](doc:install#first-start)을 다시 하세요.",
            "**최상위 파일.** 카드의 최상위 경로에 `SCRIPT` 폴더가 있어야 하며 `DCIM`이나 다른 폴더 안에 있으면 안 됩니다.",
            "**Card reader.** 카메라의 USB 케이블이 아니라 카드 리더기로 카드에 쓰세요.",
            "**GRKU 사용.** MENU의 Customize (C), GRKU에서 **GRKU 사용**이 켜짐인지 확인하세요."
          ]
        },
        {
          "kind": "h2",
          "id": "errors",
          "text": "오류 번호"
        },
        {
          "kind": "p",
          "text": "GRKU가 멈췄다면 카드에 숫자가 적힌 `SCRIPT/GRKU/INSTALL.ERR` 파일이 있을 수 있어요."
        },
        {
          "kind": "table",
          "head": [
            "번호",
            "뜻",
            "해결 방법"
          ],
          "rows": [
            [
              "47, 48",
              "이 펌웨어 빌드에 GRKU가 맞지 않아요.",
              "지원되는 펌웨어인지 확인한 뒤 GRKU를 업데이트하세요. 계속되면 보고서를 보내세요."
            ],
            [
              "60, 61, 62",
              "시작이 완료되지 않았습니다.",
              "카드에 다시 쓰세요. 계속되면 보고서를 보내세요."
            ],
            [
              "36, 37",
              "GRKU가 카드에서 설정 계획을 읽거나 쓰지 못했어요.",
              "카드에 다시 쓰세요."
            ],
            [
              "30, 31",
              "GRKU가 필름 룩을 읽을 수 없습니다.",
              "카드에 다시 쓰세요. 계속되면 다른 카드를 사용해 보세요."
            ],
            [
              "50 ~ 55, 57",
              "모듈이 로드되지 않았습니다.",
              "GRKU 업데이트를 실행하세요. 계속되면 리포트를 보내세요."
            ],
            [
              "56",
              "GR IV 모노크롬에는 컬러 사진 모듈이 빠져 있습니다. 정상입니다.",
              "없음."
            ],
            [
              "기타",
              "다른 이유로 GRKU가 멈췄습니다.",
              "번호와 함께 리포트를 보내세요."
            ]
          ]
        },
        {
          "kind": "h2",
          "id": "report",
          "text": "리포트 보내기"
        },
        {
          "kind": "p",
          "text": "카메라 모델과 펌웨어 버전을 적어 [support@grku.app](support)로 이메일을 보내고, 카드에서 이 파일들을 첨부해 주세요. 사진은 들어 있지 않습니다. 레시피 이름과 가져온 룩 이름이 들어 있을 수 있으니 원하면 먼저 열어보세요."
        },
        {
          "kind": "files",
          "items": [
            [
              "SCRIPT/GRKU/INSTALL.ERR",
              "시작이 멈춘 이유"
            ],
            [
              "GRKU/REPORT.TXT",
              "카메라, 펌웨어, GRKU 버전"
            ],
            [
              "GRKU/BOOT.TXT",
              "시작 시 일어난 일"
            ]
          ]
        }
      ]
    },
    "stuck": {
      "title": "시작 시 카메라 멈춤",
      "sources": [
        "resources/RECOVERY.md"
      ],
      "seo": "시작 화면에서 멈춘 RICOH GR: 복구 방법",
      "lead": "GRKU는 카메라가 꺼질 때까지만 설정을 적용합니다. 카드를 빼고 켜세요.",
      "keywords": "멈춤 프리징 행 얼어붙음 시작 안 됨 블랙 스크린 벽돌 복구 복원 초기화 배터리 stuck freeze hang frozen not start black screen brick recover recovery reset battery",
      "blocks": [
        {
          "kind": "note",
          "tone": "warning",
          "title": "시작하기 전에",
          "text": "렌즈 배럴을 밀거나 당기지 마세요. 공식 펌웨어 업데이트 중에는 전원을 끄거나 배터리를 빼지 마세요."
        },
        {
          "kind": "h2",
          "id": "without-card",
          "text": "카드를 빼고 켜기"
        },
        {
          "kind": "steps",
          "items": [
            "카메라 전원을 끄세요.",
            "반응이 없으면 배터리를 빼세요. 뜨거울 수 있습니다.",
            "SD 카드를 빼세요.",
            "충전된 배터리를 넣고 카드 없이 카메라를 켜세요."
          ]
        },
        {
          "kind": "h2",
          "id": "still",
          "text": "그래도 켜지지 않으면"
        },
        {
          "kind": "steps",
          "items": [
            "카드를 넣지 않은 상태에서 재생 버튼을 길게 눌러 재생 모드로 카메라를 켜세요.",
            "메뉴가 열리면 카메라 설정을 초기화하세요. 초기화하면 직접 만든 설정이 지워집니다.",
            "카드 없이 카메라를 다시 켜세요."
          ]
        },
        {
          "kind": "p",
          "text": "그래도 켜지지 않으면 GRKU 사용을 멈추고 RICOH 서비스에 문의하세요. [복구 가이드](site:recovery)에 전체 절차가 있습니다."
        }
      ]
    },
    "faq": {
      "title": "자주 묻는 질문",
      "sources": [
        "web/src/strings/en.ts (faq)",
        "runtime/mode_dial.h",
        "resources/INSTALLATION-GR4.md"
      ],
      "seo": "GRKU 자주 묻는 질문과 답변",
      "lead": "가장 많이 묻는 질문에 대한 짧은 답변입니다.",
      "keywords": "faq 질문 왜 첫 사진 필름 룩 없음 박스 리콜 포맷 휴대폰 가져오기 gr 월드 안전 보증 question why first photos no look box recall format phone import gr world safe warranty",
      "blocks": [
        {
          "kind": "h2",
          "id": "first-photos",
          "text": "첫 사진에 필름 룩이 없는 이유는 무엇인가요?"
        },
        {
          "kind": "p",
          "text": "전원을 켠 뒤 약 8~10초 동안 GRKU가 불러와지기 전까지는 카메라 자체 설정을 씁니다. 화면 위에 **GRKU**가 뜰 때까지 기다리세요."
        },
        {
          "kind": "h2",
          "id": "dng",
          "text": "DNG가 3:2 비율이거나 필름 룩이 없는 이유는 무엇인가요?"
        },
        {
          "kind": "p",
          "text": "GRKU는 JPEG를 바꾸고, DNG는 원본 RAW 데이터를 그대로 둡니다. [RAW 현상](doc:raw)을 확인하세요."
        },
        {
          "kind": "h2",
          "id": "user-mode",
          "text": "사용자 모드를 불러와도 내 룩이 돌아오지 않는 이유는 무엇인가요?"
        },
        {
          "kind": "p",
          "text": "RICOH 카메라 메뉴로 저장한 사용자 모드에는 GRKU 설정이 담기지 않습니다. [현재 설정 저장](doc:mode-dial)이나 [레시피](doc:recipes)를 사용하세요."
        },
        {
          "kind": "h2",
          "id": "firmware",
          "text": "GRKU가 카메라 펌웨어를 바꾸나요?"
        },
        {
          "kind": "p",
          "text": "아니요. 카메라가 켜져 있는 동안 카드에서 GRKU를 불러옵니다. 카메라 설정인 SD 스크립트는 [끄기](doc:update#scripts-off) 전까지 켜진 채로 남습니다. **현재 설정 저장**도 카메라의 사용자 모드에 저장합니다."
        },
        {
          "kind": "h2",
          "id": "menu-again",
          "text": "업데이트 후나 다른 카드를 쓸 때 MENU를 다시 길게 눌러야 하나요?"
        },
        {
          "kind": "p",
          "text": "아니요. {{MENU}}는 처음 한 번만 길게 누릅니다."
        },
        {
          "kind": "h2",
          "id": "version",
          "text": "내 카드에 어떤 GRKU 버전이 들어 있나요?"
        },
        {
          "kind": "p",
          "text": "MENU를 엽니다. **GRKU 정보**는 커스터마이즈 탭의 GRKU 항목 끝에 있습니다."
        },
        {
          "kind": "h2",
          "id": "phone",
          "text": "폰으로 사진을 가져올 수 없는 이유는 무엇인가요?"
        },
        {
          "kind": "p",
          "text": "GRKU를 설치해도 `DCIM` 폴더의 사진은 바뀌지 않습니다. GR WORLD를 최신 버전으로 업데이트하세요. 그래도 안 되면 [지원 팀에 메일 보내기](support)로 연락하세요."
        },
        {
          "kind": "h2",
          "id": "lightroom",
          "text": "이 룩을 Lightroom에서 쓸 수 있나요?"
        },
        {
          "kind": "p",
          "text": "직접 쓸 수는 없습니다. GRKU는 Lightroom 프리셋을 만들지 않습니다. [현상 페이지](doc:develop)에서 사진에 룩을 적용해 보세요."
        }
      ]
    },
    "cameras": {
      "title": "지원 카메라",
      "sources": [
        "web/src/cameras.ts",
        "web/src/generated/cameras.ts",
        "web/src/package.ts"
      ],
      "seo": "GRKU는 어떤 RICOH GR 카메라와 펌웨어를 지원하나요?",
      "lead": "GRKU는 정식 RICOH 펌웨어가 설치된 아래 카메라와 펌웨어 버전에서 동작합니다.",
      "keywords": "카메라 지원 펌웨어 버전 gr iii iiix iv hdf 모노크롬 모드셋 덤프 cameras supported firmware version gr iii iiix iv hdf monochrome modeset dump",
      "blocks": [
        {
          "kind": "cameras"
        },
        {
          "kind": "p",
          "text": "카메라에서 MENU를 열어 펌웨어 버전을 확인하세요([펌웨어 버전 확인](doc:firmware) 참고). 이전 GR 모델이나 다른 카메라는 지원하지 않습니다. GR IV 모노크롬은 필름 룩을 빼고 모든 모듈이 있습니다."
        },
        {
          "kind": "p",
          "text": "GR IV 30th Anniversary Edition 카메라는 1.20 전용 공장 빌드로 나오며, grku.app에서는 아직 제공하지 않습니다. 먼저 RICOH에서 1.21로 업데이트하세요."
        },
        {
          "kind": "h2",
          "id": "firmware",
          "text": "카메라 펌웨어 업데이트"
        },
        {
          "kind": "p",
          "text": "카메라 펌웨어는 RICOH 공식 지원 사이트에서만 업데이트하고, 먼저 GRKU가 새 버전을 지원하는지 확인하세요. GRKU는 펌웨어를 업데이트하지 않습니다."
        },
        {
          "kind": "h2",
          "id": "dump",
          "text": "GRKU가 모르는 펌웨어"
        },
        {
          "kind": "p",
          "text": "[펌웨어 덤프 가이드](site:firmware-dump)에서 GRKU가 지원할 수 있도록 카메라 펌웨어를 읽어 개발자에게 전달하는 방법을 안내합니다."
        }
      ]
    }
  }
};
