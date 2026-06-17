# 테트리스 (교육용)

HTML, CSS, JavaScript만 사용하는 브라우저 테트리스 게임입니다.  
빌드 도구와 외부 라이브러리 없이 `index.html` 하나로 실행할 수 있으며, 프론트엔드 입문자를 위한 교육용 프로젝트로 제작되었습니다.

## 프로젝트 소개

- **기술 스택:** HTML, CSS, Vanilla JavaScript
- **보드 크기:** 10열 × 20행
- **블록 종류:** I, O, T, S, Z, J, L (7종 테트로미노)
- **특징:** 자동 낙하, 키보드 조작, 줄 삭제, 점수, 게임 오버, 재시작

## 실행 방법

### 로컬에서 실행

1. 이 저장소를 클론하거나 폴더를 연다.
2. `index.html`을 더블클릭하거나 브라우저로 드래그한다.
3. **시작** 버튼을 누르면 게임이 시작된다.

### Live Server (선택)

VS Code의 [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) 확장을 사용하면 파일 저장 시 자동 새로고침할 수 있다.

## 조작법

게임이 진행 중일 때(**시작** 버튼을 누른 후) 아래 키를 사용한다.

| 키 | 동작 |
|---|---|
| ← (ArrowLeft) | 왼쪽 이동 |
| → (ArrowRight) | 오른쪽 이동 |
| ↓ (ArrowDown) | 한 칸 빠르게 내리기 (soft drop) |
| ↑ (ArrowUp) | 블록 회전 |
| Space | 즉시 낙하 (hard drop) |

충돌이 발생하는 이동·회전은 적용되지 않는다. 게임 오버 후에는 **재시작** 버튼을 눌러 다시 시작한다.

## 구현 기능

| 기능 | 설명 |
|---|---|
| 보드 렌더링 | CSS Grid 기반 10×20 격자 |
| 테트로미노 | 7종 블록 정의 및 색상 표시 |
| 자동 낙하 | 800ms 간격으로 한 칸씩 하강 |
| 충돌 판정 | `canMove()` — 벽·고정 블록·보드 밖 이동 차단 |
| 키보드 조작 | 좌우 이동, 회전, soft/hard drop |
| 줄 삭제 | 가로 한 줄이 가득 차면 제거 후 위 블록 하강 |
| 점수 | 줄 삭제 수에 따라 점수 증가 |
| 게임 오버 | 새 블록 스폰 불가 시 종료 및 오버레이 표시 |
| 재시작 | 보드·점수·타이머·상태 초기화 |

### 점수 규칙

| 한 번에 삭제한 줄 수 | 점수 |
|---|---|
| 1줄 | 100 |
| 2줄 | 300 |
| 3줄 | 500 |
| 4줄 | 800 |

## 품질 점검 방법

프로젝트에는 Cursor 슬래시 명령(`.cursor/commands/`)과 프롬프트별 리뷰 문서(`docs/`)가 포함되어 있다.

### 수동 플레이 테스트

1. **시작** 클릭 → 자동 낙하 확인
2. 좌우·회전·soft drop·hard drop 동작 확인
3. 한 줄을 가득 채워 줄 삭제 및 점수 증가 확인
4. 블록을 맨 위까지 쌓아 게임 오버 확인
5. **재시작** 클릭 → 초기화 및 재플레이 확인

### 브라우저 개발자 도구

1. `F12`로 개발자 도구를 연다.
2. **Console** 탭에서 빨간 에러 메시지가 없는지 확인한다.
3. **Network** 탭에서 `style.css`, `script.js`가 200으로 로드되는지 확인한다.

### 문서 기반 점검 (개발자용)

| 문서 | 내용 |
|---|---|
| `docs/prompt0_review-structure.md` | 프로젝트 구조 리뷰 |
| `docs/prompt1_code-review.md` | 코드 리뷰 (프롬프트 1) |
| `docs/prompt2_review-game-logic.md` | 게임 로직 리뷰 |
| `docs/prompt3_qa-playtest.md` | QA 플레이테스트 |
| `docs/prompt4_bug-hunt_refactor-safe.md` | 버그 헌트·리팩토링 |

## GitHub Pages 배포 방법

### 1. 저장소 준비

```bash
git init
git add index.html style.css script.js README.md docs/
git commit -m "Add tetris game for GitHub Pages"
git branch -M main
git remote add origin https://github.com/<사용자명>/<저장소명>.git
git push -u origin main
```

### 2. GitHub Pages 설정

1. GitHub 저장소 → **Settings** → **Pages**
2. **Source:** Deploy from a branch
3. **Branch:** `main` / `/ (root)` 선택 후 **Save**
4. 1~2분 후 배포 URL이 표시된다.

### 3. 배포 URL 형식

```
https://<사용자명>.github.io/<저장소명>/
```

예: 저장소가 `tetris-cursor`이면

```
https://username.github.io/tetris-cursor/
```

### 4. 배포 후 확인

- [ ] 위 URL에서 게임 화면이 로드되는가?
- [ ] CSS·JS가 적용되어 보드와 블록이 보이는가?
- [ ] **시작** 후 플레이가 정상 동작하는가?
- [ ] 콘솔에 에러가 없는가?

> 이 프로젝트는 루트에 `index.html`이 있어 **별도 빌드 없이** GitHub Pages 정적 배포에 적합하다.  
> `style.css`와 `script.js`는 상대 경로로 연결되어 있어 서브경로 배포(`/저장소명/`)에서도 정상 동작한다.

## 파일 구조

```
tetris-cursor/
├── index.html          # 게임 진입점
├── style.css           # 스타일
├── script.js           # 게임 로직
├── README.md           # 프로젝트 설명 (본 문서)
├── docs/               # 프롬프트별 리뷰·QA 문서
└── .cursor/commands/   # Cursor 개발용 명령 (배포 불필요)
```

## 라이선스

교육용 프로젝트입니다. 자유롭게 학습·수정·배포할 수 있습니다.
