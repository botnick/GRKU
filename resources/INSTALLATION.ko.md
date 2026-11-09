# GRKU

[English](https://github.com/botnick/GRKit/blob/main/README.md) | [日本語](https://github.com/botnick/GRKit/blob/main/README.ja.md) | 한국어

RICOH GR III 및 GR III HDF 펌웨어 2.10 전용입니다.

GRKU는 실험적이며 보증이 없습니다. GRKU가 실패하면 카메라가 시작 중에 멈출 수 있습니다. 설치하기 전에 [복구 가이드](https://github.com/botnick/GRKit/blob/main/resources/RECOVERY.md)를 읽어 주십시오. GRKU를 설치하면 [이용 약관](https://github.com/botnick/GRKit/blob/main/resources/TERMS.md)에 동의하는 것입니다.

## 설치

컴퓨터의 Chrome이나 Edge에서 [grku.app](https://grku.app/)을 열면 카드 리더에 넣은 카드에 GRKU을 바로 쓸 수 있습니다. 2단계 대신 사용할 수 있습니다.

1. 카메라의 전원을 끕니다.
2. `SD_ROOT`의 내용(폴더 자체가 아님)을 SD 카드 최상위에 복사합니다. 복사하면 카드 최상위에 `SCRIPT` 폴더가 있어야 합니다.
3. 카드를 넣습니다. MENU 버튼을 누른 채 전원을 켜고, 카메라의 전원이 저절로 꺼질 때까지 기다립니다.
4. 평소처럼 전원을 켭니다.

3단계에서 카메라의 SD 스크립트가 켜집니다. 카메라에 Mode Set Command와 Complete가 표시된 다음, 전원이 저절로 꺼집니다. SD 스크립트가 이미 켜져 있으면 3단계를 건너뜁니다.

![Mode Set Command 화면에 Script - Enable과 Complete가 표시되어 있습니다.](images/modeset.png)

설치 후에는 카드 최상위에서 `00078350.588`과 `DEVELOP.MOD`를 삭제해도 됩니다.

## 사용 방법

전원을 켜고 몇 초 뒤 촬영 화면 위쪽에 **GRKU**이 표시되면 불러오기가 끝난 것입니다. 설치나 업데이트 후 처음 켤 때는 조금 더 걸립니다. 불러오기가 끝나기 전에 찍은 사진에는 GRKU 효과가 적용되지 않습니다. 촬영 모드에서 ADJ 레버를 누르고 여섯 번째 항목인 GRKU을 선택합니다.

![GRKU 페이지에 모듈 목록과 현재 효과가 표시되어 있습니다.](images/grkit-root.jpg)

사진: [MIKI Yoshihito](https://www.flickr.com/photos/mujitra/53311001084/), [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/).

- **필름 룩:** 효과에 커서를 맞추면 촬영 화면에서 미리 볼 수 있고, OK를 누르면 확정됩니다. Fn을 누르면 그 효과를 조정합니다. 카메라의 화상 컨트롤 설정은 바뀌지 않습니다.
- **프레이밍:** XPan, 2.35:1, 16:9 등의 비율입니다. JPEG 사진을 자르고, DNG는 3:2로 유지됩니다. Fn을 누르면 구도 가이드만 사용하거나 마스크를 설정할 수 있습니다.
- **구도 가이드:** 선은 촬영 화면에만 표시되고 사진에는 들어가지 않습니다.
- **날짜 각인:** 사진의 오른쪽 아래에 날짜를 넣습니다. Fn을 누르면 날짜 서식과 글꼴을 선택합니다.
- **글로우:** 블룸과 헐레이션입니다. JPEG 사진에만 적용되며 촬영 화면에는 미리 보이지 않습니다.
- **라이트 리크:** 비네트, 먼지, 라이트 리크, 스크래치입니다. JPEG 사진에만 적용되며 촬영 화면에는 미리 보이지 않습니다. Fn을 누르면 각각의 강도를 설정합니다.
- **디퓨전:** Black Pro-Mist 디퓨전 필터의 번짐입니다. JPEG 사진에만 적용되며 촬영 화면에는 미리 보이지 않습니다. Fn을 누르면 Black Mist, 그림자 위의 베일, 또는 아나모픽 렌즈의 가로 플레어인 Streak를 추가합니다.
- **입자감:** 사진에 필름 그레인을 더합니다. Fn을 누르면 입자 크기를 선택합니다.
- **테두리:** 사진 위에 흰색 또는 검은색 가장자리를 넣습니다. 폭은 사진 너비의 3% 또는 6%이며, JPEG 사진에만 적용됩니다.

모든 설정은 MENU의 사용자 설정 탭(C) 마지막에 있는 **GRKU** 항목에도 있습니다. 모듈마다 행이 있으며, 모듈을 켜거나 끄고, **옵션**에서 ADJ에 표시할 효과·비율·종류를 고르고, **ADJ 메뉴 순서**에서 순서를 바꿀 수 있습니다. 설정은 전원을 꺼도 유지됩니다.

## 업데이트

컴퓨터의 Chrome이나 Edge에서 [grku.app](https://grku.app/)을 열면 카드 리더에 넣은 카드를 바로 업데이트할 수 있습니다. 2단계와 3단계 대신 사용할 수 있습니다.

1. 카메라의 전원을 끕니다.
2. 카드에서 `SCRIPT` 폴더를 삭제합니다.
3. 새 패키지의 `SD_ROOT`에 있는 `SCRIPT` 폴더를 SD 카드 최상위에 복사합니다.
4. 평소처럼 전원을 켭니다. MENU 버튼을 누를 필요는 없습니다.

설정과 효과는 `GRKU` 폴더에 저장되므로 업데이트 후에도 남습니다. GRKit에서 GRKU으로 옮기려면 grku.app을 사용하세요. 설정과 효과가 유지됩니다. 둘 다 같은 `GRKU` 폴더에 저장하기 때문입니다.

## 문제 해결

### MENU 버튼을 누른 채 전원을 켜면 펌웨어 업데이트가 시작됩니다

카드 최상위에 펌웨어 파일이 있습니다. 카메라의 전원을 끄고 카드 최상위의 `.bin` 파일을 모두 삭제한 다음, 설치 3단계를 다시 합니다.

### Mode Set Command가 표시되지 않습니다

- MENU 버튼을 누른 채 전원을 켭니다.
- `SD_ROOT`의 내용은 `DCIM` 같은 폴더가 아니라 카드 최상위에 복사합니다.

### ADJ 모드에 GRKU이 표시되지 않습니다

1. 전원을 켜고 촬영 화면 위쪽에 **GRKU**이 표시될 때까지 몇 초 기다립니다.
2. 카드 최상위에 `SCRIPT` 폴더가 있는지 확인합니다.
3. 카드에 `SCRIPT/GRKU/INSTALL.ERR`가 있으면 카메라 메뉴에서 패키지가 카메라의 펌웨어 버전에 맞는지 확인합니다. 맞다면 `INSTALL.ERR`, `GRKU/REPORT.TXT`, `GRKU/BOOT.TXT`(있는 경우)를 첨부해 [기기 보고서](https://github.com/botnick/GRKit/issues/new?template=device-report.yml)를 보내 주세요.
4. GRKU은 Ricoh 공식 펌웨어에서만 작동합니다.

### 카드를 포맷한 뒤 GRKU이 작동하지 않습니다

포맷하면 GRKU과 그 설정이 삭제됩니다. 포맷하기 전에 `GRKU` 폴더를 컴퓨터에 복사합니다. 포맷한 뒤 `SD_ROOT`의 내용을 다시 복사하고, `GRKU` 폴더를 카드 최상위에 다시 복사합니다.

## GRKU 제거

컴퓨터의 Chrome 또는 Edge에서 [grku.app](https://grku.app/)을 사용하면 카드 리더기에 있는 카드에서 GRKU를 제거할 수 있으며, SD 스크립트를 끌 수도 있습니다.

카메라 전원을 끄고 카드에서 `SCRIPT` 및 `GRKU` 폴더를 삭제합니다.

SD 스크립트 설정은 켜진 상태로 유지됩니다. 이를 끄려면 다음을 수행합니다:

1. https://grku.app에서 사용 중인 카메라의 SD 스크립트를 끄는 파일을 다운로드합니다.
2. `SD_ROOT`의 내용을 SD 카드의 루트에 복사합니다.
3. 카드를 삽입합니다. 카메라 전원을 켤 때 MENU 버튼을 누르고 있습니다. 카메라가 스스로 전원이 꺼질 때까지 기다립니다.
4. 카드 루트에서 `00078350.588` 및 `DEVELOP.MOD`를 제거합니다.

시작 중 카메라가 멈추면 [복구 가이드](https://github.com/botnick/GRKit/blob/main/resources/RECOVERY.md)를 참조하십시오.

GRKU는 Ricoh와 제휴하지 않았습니다. 소스 코드 및 라이선스: https://github.com/botnick/GRKit
