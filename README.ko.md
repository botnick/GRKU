# GRKU · BOTNICK edition

ahonn의 [GRKit](https://github.com/ahonn/GRKit)을 포크한 **BOTNICK**의 GRKU입니다. 135 필름 라이브러리와 실제 필름 상자 아이콘, Positive GRII 룩, 컬러 메뉴 타일, Border, Light Leak, Diffusion 모듈, 피트 단위의 Snap 초점 거리, 더 빨리 불러와지는 원샷 시작, 그리고 빠른 시작 펌웨어 없음이 특징입니다. GRKU는 SD 카드의 스크립트로 유지됩니다. 카드를 포맷하면 카메라는 원래 상태로 돌아갑니다.

[English](README.md) | [简体中文](README.zh-Hans.md) | [繁體中文](README.zh-Hant.md) | [日本語](README.ja.md) | 한국어 | [ไทย](README.th.md)

[![Tests](https://github.com/botnick/GRKit/actions/workflows/tests.yml/badge.svg)](https://github.com/botnick/GRKit/actions/workflows/tests.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

GRKU은 RICOH GR III, GR IIIx, GR IV에 필름 느낌의 색감, XPan 등 다양한 화면 비율, 날짜 인쇄, 글로우, 빛 번짐, 디퓨전, 입자감, 테두리를 더해 주는 도구입니다. SD 카드에서 실행되며 펌웨어에는 아무것도 쓰지 않습니다. 카드를 빼면 카메라는 원래 상태로 돌아갑니다.

<p>
  <img src="resources/images/grkit-root.ko.jpg" alt="ADJ 메뉴의 GRKU 페이지" width="49%">
  <img src="resources/images/grkit-menu.ko.jpg" alt="MENU 사용자 설정 탭의 GRKU 항목" width="49%">
</p>

사진: [MIKI Yoshihito](https://www.flickr.com/photos/mujitra/53311001084/), [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/).

## 기능

촬영 중 ADJ 레버를 누르고 여섯 번째 항목인 GRKU를 선택합니다.

- **필름 룩**: 135가지 룩, 그중 40가지는 패키지에 포함되어 있고 나머지는 필름 라이브러리에 있습니다: Kodak, Fujifilm, Ilford, CineStill, Lomography, Polaroid, Agfa, Harman, GR II를 본뜬 Positive GRII 룩 등이 있으며, 각각 라이브 프리뷰와 고유한 필름 박스 아이콘을 갖추고 있습니다. [grku.app](https://grku.app)에서 직접 만든 `.cube` LUT나 Lightroom 프리셋을 가져올 수도 있습니다. 각 룩은 오픈 소스 필름 LUT에서 피팅되므로 원본에 가깝지만 동일하지는 않습니다([출처](effects/NOTICE.md)).
- **프레이밍**: XPan, 2.35:1, 16:9, 4:3, 5:4, 7:6, 1:1. JPEG 사진을 크롭하거나 마스크 또는 프레임 라인으로 구도만 표시합니다. 비율을 선택하면 어느 모드에서든 카메라가 3:2로 설정됩니다. Off는 카메라의 현재 화면 비율을 유지합니다.

  RAW 파일은 기본 3:2 크롭과 카메라의 디지털 크롭 설정을 유지합니다. 내장 프리뷰에는 선택한 구도가 계속 표시될 수 있습니다.

- **가이드**: 삼등분, 중앙, 황금비, 대각선, 황금 나선, 또는 다이내믹 시머트리.
- **날짜 인쇄**: 클래식, GR1s 도트 매트릭스, 또는 GR II 스타일로 사진에 날짜를 인쇄합니다.
- **글로우**: Bloom은 조명과 하이라이트 주변의 빛을 부드럽게 퍼뜨립니다. Halation은 밝은 조명 주변에 적주황색 후광을 추가하여 영화 필름을 시뮬레이션합니다. 각 효과에는 고유한 Enable 및 Strength 설정이 있어 둘을 함께 실행할 수 있습니다.
- **라이트 리크**: 사진에 필름 아티팩트를 추가합니다: 비네트, 먼지와 머리카락, 라이트 리크, 스크래치가 각각 Off, Light, Medium, Strong으로 설정되거나 Faded, Dusty, Leaky, Expired 프리셋을 사용합니다. 매 촬영마다 다르게 나타납니다.
- **디퓨전**: Black Pro-Mist 디퓨전 필터의 글로우를 1/8, 1/4, 1/2로 구현합니다. Black Mist는 섀도 위에 필터의 베일을 더하고, Streak는 점 광원에서 아나모픽 렌즈의 파란색 또는 호박색 수평 플레어를 추가합니다. JPEG 사진만 해당됩니다.
- **그레인**: 네 가지 강도와 네 가지 크기(Auto, Small, Medium, Large)의 필름 그레인.
- **테두리**: 사진 위에 흰색 또는 검은색 인화 테두리를 너비의 3% 또는 6%로 표시합니다.
- **피트**: 카드에 `GRKIT/FEET.TXT` 파일이 있으면 Snap Focus Distance 설정이 미터 대신 1', 3', 5', 7', 8', 16'로 표시됩니다.

GRKU는 전원을 켠 후 로드되는 데 약 9초가 걸리며, 설치 또는 업데이트 후 첫 시작 시에는 더 오래 걸립니다. 그 전까지 카메라는 자체 설정을 사용합니다. 모든 설정은 MENU의 Customize 탭 끝에 있는 GRKU 섹션에 있습니다. 직접 모듈을 작성하려면 [모듈 작성하기](docs/modules.md)를 참조하십시오.

GRKU에는 빠른 부팅 펌웨어가 없으며 앞으로도 없을 것입니다: 카메라의 자체 펌웨어는 Ricoh가 출하한 그대로 유지되고, GRKU는 카드의 스크립트일 뿐이며, 포맷하면 제거됩니다. 이 포크의 [원샷 시작](docs/one-shot-start.md)이 공식 펌웨어에서 GRKit보다 더 빨리 로드되게 해줍니다.

## 지원 카메라

| 카메라 | 실제 카메라에서 확인 | 지원 |
| --- | --- | --- |
| GR III, GR III HDF | 2.10, 2.20 | — |
| GR IIIx, GR IIIx HDF | 1.60, 1.70 | — |
| GR IV, GR IV HDF | 1.11, 1.20 | — |
| GR IV Monochrome | 1.00 | 1.10 |

이 표는 GRKit의 것입니다. 이 포크의 변경 사항은 펌웨어 1.11이 설치된 GR IV에서 실행되었습니다. GR III 및 GR IIIx 패키지는 동일한 코드에서 빌드되었지만 아직 해당 카메라에서 실행되지 않았으며, 최신 모듈(Light Leak, Diffusion, Border)과 피트(feet) 레이블은 첫 번째 실제 카메라 확인을 기다리고 있습니다. GR IV Monochrome에서는 필름 룩을 쓸 수 없습니다. 다른 기종이나 펌웨어 버전은 지원하지 않습니다. 지원 카메라에서 GRKU이 불러와지지 않으면 [펌웨어 덤프 가이드](resources/DUMP.ko.md)를 참고하세요.

> [!WARNING]
> GRKU은 실험적인 프로젝트입니다. 사용에 따른 책임은 본인에게 있습니다.
> 설치하면 카메라의 SD 스크립트 설정이 켜지고, 끌 때까지 그대로 유지됩니다. GRKU에 문제가 있으면 카메라가 시작 중에 멈출 수 있으니 먼저 [복구 가이드](resources/RECOVERY.ko.md)를 읽어 주세요.

## 설치

이 포크의 사이트인 [grku.app](https://grku.app)에서 카메라, 모듈, 효과를 고른 다음 아래 방법 중 하나로 설치합니다.

- **SD 카드에 기록**: 컴퓨터의 Chrome이나 Edge에서 합니다. 사이트에서 GRKU의 업데이트와 제거, 모듈과 효과의 추가·삭제도 할 수 있습니다.
- **ZIP 다운로드**: `GRKU-gr3.zip`, `GRKU-gr3x.zip`, `GRKU-gr4.zip` 중 하나를 받아 안에 든 PDF 가이드를 따릅니다([GR III·GR IIIx](resources/INSTALLATION.ko.md), [GR IV](resources/INSTALLATION-GR4.ko.md)).

또는 이 저장소에서 패키지를 빌드하고(아래 참고) 카드 리더기에 꽂아 `python3 -I scripts/card.py write dist/GRKU-gr4.zip`으로 카드에 기록할 수 있습니다. 같은 스크립트로 피트 라벨을 켜고 끄거나(`feet on`, `feet off`) 카드 상태를 확인할 수 있습니다(`status`).

MENU 버튼을 누른 채 전원을 켜는 것은 처음 한 번뿐입니다. ZIP으로 업데이트할 때는 카드의 `SCRIPT` 폴더를 바꿔 넣으세요. 설정은 `GRKIT`에 남습니다. 카드를 포맷하면 GRKU도 지워지므로 먼저 `GRKIT`을 컴퓨터에 복사해 두세요.

GRKU가 보이지 않으면 `GRKIT/REPORT.TXT`, `GRKIT/BOOT.TXT`, `SCRIPT/GRKIT/INSTALL.ERR`(있는 경우)을 첨부해 [이슈](https://github.com/botnick/GRKit/issues/new)를 보내 주세요. [각 파일의 각 줄이 의미하는 바](docs/diagnostics.md)를 참고하세요.

## 소스에서 빌드

Rust 1.92 이상, ARM을 지원하는 Clang과 LLD, 리코 공식 펌웨어 파일이 필요합니다(펌웨어는 저장소에 들어 있지 않습니다).

```sh
cargo install --path crates/grkit-cli --locked
grkit effects build --source effects --out build/effects
grkit build --target gr3-2.10 --firmware firmware/fwdc239b.bin --out build/runtime
for module in modules/*/; do grkit module build --dir "$module" --out "build/modules/$(basename "$module").GRM"; done
sh .github/scripts/install-guide-tools.sh build/guide-tools
sh .github/scripts/build-guides.sh grkit build/guide-tools build/guides
grkit package --build build/runtime --effects build/effects $(for m in build/modules/*.GRM; do printf -- '--module %s ' "$m"; done) \
  --guide build/guides/gr3/en.pdf --out dist/GRKU-gr3.zip
grkit verify dist/GRKU-gr3.zip
```

`build/effects`에는 135개의 룩이 모두 들어가지만, 패키지에는 최대 40개까지만 담을 수 있습니다. 따라서 `python3 -I scripts/defaults.py build/effects build/effects-default`로 `effects/defaults.txt`에 있는 40개를 골라 `--effects` 인자에 사용합니다. GR IV의 경우 `gr4-1.11`과 `gr4-1.20`을 빌드하고 `--camera gr4`로 둘 다 패키징합니다. 다른 카메라, 일부 모듈만 담은 패키지, 다른 언어의 가이드는 [Build packages](CONTRIBUTING.md#build-packages)(영어)와 [HANDOFF.md](HANDOFF.md)(영어)를 참고하세요.

## 기여하기

[CONTRIBUTING.md](CONTRIBUTING.md)를 참조하십시오. GRKU가 작동했든 하지 않았든 기기 보고는 환영하며, 특히 이 포크가 아직 실행되지 않은 GR III 및 GR IIIx의 보고를 환영합니다. 문제, 아이디어 및 질문은 [issues](https://github.com/botnick/GRKit/issues)로 보내 주십시오. GRKit 자체에 유용한 변경 사항은 풀 리퀘스트로 업스트림에 보내 주십시오.

## 문서(영어)

- [아키텍처](docs/architecture.md)
- [모듈 만들기](docs/modules.md)와 [모듈 레퍼런스](docs/module-reference.md)
- [기기 리포트의 세 파일](docs/diagnostics.md): `BOOT.TXT`, `REPORT.TXT`, `INSTALL.ERR`를 한 줄씩 설명
- [원샷 시작](docs/one-shot-start.md): GRKU가 공식 펌웨어에서 더 빨리 불러와지는 방법
- [효과](effects/README.md)와 기본 40개 뒤에 있는 [2026년 인기 필름](docs/popular-films-2026.md)
- [웹사이트](web/README.md)와 [브랜드 시트](docs/brand.md)
- 이 포크의 [로드맵](docs/roadmap.md)과 [핸드오프](HANDOFF.md)
- GRKit에서 온 문서: GRKU가 사용하지 않는 [빠른 시작 펌웨어](docs/fastboot.md)와 [릴리스 절차](docs/releasing.md)

## 라이선스

코드는 [MIT 라이선스](LICENSE)입니다. GRKU은 ahonn의 [GRKit](https://github.com/ahonn/GRKit)을 바탕으로 만들어졌으며, GRKit 역시 MIT 라이선스이고 그 고지 사항을 그대로 유지합니다. 각 패키지에는 포함된 파일의 라이선스를 정리한 `LICENSES.md`가 들어 있습니다.

- 효과의 라이선스는 CC BY-SA 4.0, MIT 또는 Apache-2.0입니다. 자세한 내용은 [effects/NOTICE.md](effects/NOTICE.md)를 참고하세요.
- 메뉴와 촬영 화면의 글자에는 [Roboto Condensed](https://github.com/googlefonts/roboto-classic)를 [SIL Open Font License 1.1](crates/grkit-core/assets/RobotoCondensed-LICENSE.txt)에 따라 사용합니다.
- 효과의 피팅 방법은 [gr3-film-mods](https://github.com/idontknownihil/gr3-film-mods)에서 [MIT 라이선스](crates/grkit-core/GR3_FILM_MODS_LICENSE.txt)에 따라 가져왔습니다.

RICOH와 GR은 Ricoh Company, Ltd.의 상표입니다. 필름 이름은 각 소유자의 상표입니다. GRKU은 독립 프로젝트이며 리코, GRKit의 개발자, 필름 제조사와 관련이 없습니다.
