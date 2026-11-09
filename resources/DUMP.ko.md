# 펌웨어 덤프 도구

펌웨어 덤프 도구는 카메라가 실행 중인 펌웨어 이미지를 메모리에서 SD 카드로 복사합니다. 개발자는 이 이미지를 사용해 GRKU이 아직 지원하지 않는 펌웨어 버전을 지원합니다.

이 도구는 카메라의 펌웨어 버전을 GRKU이 지원하지 않거나, 개발자가 issue에서 덤프를 요청한 경우에만 필요합니다. GRKU이 이미 카메라에서 작동하고 있다면 이 도구는 필요하지 않습니다.

이 도구는 메모리를 읽기만 합니다. 카메라, 펌웨어, 카메라 설정은 바꾸지 않습니다. 파일에는 리코의 펌웨어만 들어 있습니다. 사진이나 개인 데이터는 들어 있지 않습니다.

대상은 RICOH GR III, GR IIIx, GR IV, GR IV Monochrome과 각각의 HDF 모델입니다. 이 모든 카메라에 같은 ZIP을 사용합니다.

## 시작하기 전에

- SD 스크립트가 켜져 있어야 합니다. GRKU을 설치하면 켜집니다. GRKU을 설치하지 않았다면 먼저 카메라 설치 가이드([GR III 및 GR IIIx](https://grku.app/guides/gr3/en.pdf), [GR IV](https://grku.app/guides/gr4/en.pdf))의 1단계부터 3단계까지 진행하여 GRKU을 한 번 설치합니다.
- 이 도구가 카드에 있는 동안에는 GRKU을 불러오지 않습니다.
- 충전된 배터리를 사용합니다.
- 카메라 메뉴에서 카메라의 펌웨어 버전을 확인해 둡니다. 보고서 작성에 필요합니다.

## 도구 받기

[GRKU-dump.zip](https://github.com/botnick/GRKU/releases/latest/download/GRKU-dump.zip)을 다운로드합니다. [최신 릴리스](https://github.com/botnick/GRKU/releases/latest)의 `GRKU-<버전>-dump.zip`과 같은 파일입니다.

ZIP에는 `SD_ROOT/SCRIPT/STARTUP.TTL`, `SD_ROOT/SCRIPT/GRDUMP/DUMP.SH`, `SD_ROOT/SCRIPT/GRDUMP/DUMP.BIN`, 그리고 `README.txt`가 들어 있습니다.

## 펌웨어 덤프하기

1. 카메라의 전원을 끕니다. 카드를 꺼내 컴퓨터에 넣습니다.
2. 카드에 `SCRIPT` 폴더가 있다면 백업으로 컴퓨터에 복사합니다. 없다면 이 단계를 건너뜁니다.
3. 도구의 압축을 풉니다. `SD_ROOT` 안의 `SCRIPT` 폴더를 카드 최상위에 복사합니다. 컴퓨터가 물어보면 `SCRIPT/STARTUP.TTL`을 덮어씁니다.
4. 카드를 안전하게 꺼냅니다. 카메라에 넣습니다. 평소처럼 전원을 켭니다. MENU 버튼은 누르고 있지 마십시오.
5. 카메라가 켜진 상태로 2분 기다립니다. 그런 다음 카메라의 전원을 끕니다.
6. 카드를 컴퓨터에 넣고 카드의 `SCRIPT/GRDUMP`를 엽니다.

폴더에 `DUMP.OK`가 있으면 덤프가 완료된 것입니다. 폴더에는 약 20 MB의 `RTOS.BIN`과 `INFO.TXT`도 있습니다.

폴더에 `DUMP.ERR`이 있으면 덤프가 실패한 것입니다. `DUMP.ERR`에는 오류 코드가 들어 있습니다. 이 경우에도 폴더를 보내 주십시오.

폴더에 두 파일이 모두 없으면 카메라가 도구를 실행하지 않은 것입니다. SD 스크립트가 켜져 있는지 확인합니다. 그런 다음 4단계부터 6단계까지 다시 합니다.

## 파일 보내기

1. `SCRIPT/GRDUMP` 폴더를 ZIP으로 압축합니다.
2. ZIP을 [GitHub issue](https://github.com/botnick/GRKU/issues/new)에 첨부합니다. 카메라 모델과 펌웨어 버전을 적습니다.

개발자가 issue에서 덤프를 요청했다면 그 issue에 ZIP을 첨부합니다. ZIP 파일의 크기는 약 20 MB이며, GitHub에서는 최대 25 MB까지 파일을 첨부할 수 있습니다.

## 카드를 원래대로 되돌리기

1. 카드에서 `SCRIPT` 폴더를 삭제합니다.
2. 2단계에서 백업을 만들었다면, 백업한 `SCRIPT` 폴더를 카드에 복사합니다.

백업을 되돌려 놓으면 다음에 전원을 켤 때 GRKU을 다시 불러옵니다. 백업이 없으면 카드는 이전 상태로 돌아갑니다. 사용 중인 펌웨어가 지원되면 https://grku.app 에서 GRKU을 설치하십시오.
