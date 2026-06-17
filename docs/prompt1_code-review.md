# 코드 리뷰 — 프롬프트 1 (보드 그리드와 테트로미노 정의)

> 리뷰 기준: 파일 구조, 함수 이름·역할, 중복 코드, 로직·렌더링 분리, 버그 가능성  
> 대상: `index.html`, `style.css`, `script.js`, `README.md`  
> 대상 시점: 프롬프트 1 완료 직후 (블록 렌더링, 낙하·키보드 미구현)

---

## 전체 평가

**프롬프트 1 단계(보드 + 블록 렌더링) 기준으로 양호합니다.** HTML/CSS/JS 3파일 분리가 명확하고, `createPiece()` → `drawPiece()` → `renderBoard()` 흐름이 입문자에게 이해하기 쉽습니다. 아직 자동 낙하·키보드·충돌 판정이 없는 것은 의도된 범위이며, 프롬프트 2를 추가하기 좋은 구조입니다.

| 리뷰 기준 | 평가 |
|---|---|
| 1. 파일 구조 | ✅ 적절함 |
| 2. 함수 이름·역할 | ✅ 명확함 |
| 3. 중복 코드 | ⚠️ 소량 존재 |
| 4. 로직·렌더링 혼재 | ⚠️ 부분 분리 (개선 여지) |
| 5. 버그 가능성 | ⚠️ 낮음 (문서·유효성 이슈) |

---

## 좋은 점

### 1. 파일 구조가 적절함

- `index.html` — 구조, `style.css` — 스타일, `script.js` — 로직으로 역할이 분리되어 있습니다.
- 빌드 도구·외부 라이브러리 없이 바로 실행 가능합니다.

### 2. 함수 이름과 역할이 명확함

| 함수 | 역할 |
|---|---|
| `createEmptyBoard()` | 빈 2D 보드 생성 |
| `createPiece()` | 테트로미노 객체 생성 |
| `drawPiece()` | 배열 위에 블록 합성 (DOM 없음) |
| `renderBoard()` | 화면 갱신 |
| `resetGame()` | 상태 초기화 |
| `getShapeWidth()` | 블록 가로 길이 계산 |

프롬프트 1에서 요구한 `createPiece()`, `drawPiece()`, `renderBoard()` 분리가 충족됩니다.

### 3. 데이터와 렌더링이 부분적으로 분리됨

- `drawPiece()`는 2차원 배열만 수정하고 DOM을 건드리지 않습니다.
- `renderBoard()`는 `board`를 복사한 뒤 `drawPiece()`를 호출하므로, 원본 `board`가 렌더링 과정에서 오염되지 않습니다.

```javascript
const displayBoard = board.map((row) => [...row]);
drawPiece(displayBoard, currentPiece);
```

### 4. DOM 구조가 잘 잡혀 있음

- `#board`, `#score`, `#start-btn`, `#restart-btn` 등 id가 명확합니다.
- `aria-label`, `visually-hidden` 등 접근성 요소가 포함되어 있습니다.
- 보드는 CSS grid `repeat(10, 24px)` × `repeat(20, 24px)`로 10×20을 정확히 표현합니다.

### 5. 테트로미노 정의가 교육용으로 적절함

- `PIECES` 객체에 I, O, T, S, Z, J, L 7종이 `shape` 2차원 배열로 정의되어 있습니다.
- `createPiece()`가 보드 상단 가운데(`row: 0`, `col` 중앙 정렬)에 블록을 배치합니다.
- CSS `.piece-I` ~ `.piece-L`로 블록별 색상이 구분됩니다.

### 6. 초보자 친화적 코드

- JSDoc 한글 주석, 짧은 함수 단위, 의미 있는 변수명으로 읽기 쉽습니다.

---

## 개선할 점

### 1. `renderBoard()`가 두 가지 일을 함께 수행

- (1) `displayBoard` 조합과 (2) `document.createElement` / `classList` / `appendChild`가 한 함수에 있습니다.
- 프롬프트 1 규모에서는 문제 없지만, 낙하·키보드가 추가되면 `buildDisplayBoard()` 분리를 권장합니다.

### 2. 색상 정보가 데이터와 스타일에 이중 정의됨

- `PIECES`와 `createPiece()` 반환값에 `color`가 있지만, 실제 화면 색상은 CSS 클래스(`.piece-I` 등)만 사용합니다.
- **`piece.color`는 현재 dead field**입니다.

### 3. 시작 / 재시작 버튼 동작이 동일

- 두 버튼 모두 `resetGame()`만 호출합니다.
- 프롬프트 2 이후 `startGame()` / `resetGame()` 분리가 필요합니다.

### 4. README가 코드 상태와 불일치

- README에는 “블록 이동 등 미구현”으로 되어 있으나, 실제로는 **블록 렌더링까지 구현**되어 있습니다.
- “빈 보드로 초기화” 문구도 현재는 **새 무작위 블록이 표시**되는 동작과 다릅니다.

### 5. `renderBoard()`가 매번 전체 DOM을 재생성

- `innerHTML = ""` 후 200개 셀을 새로 만듭니다.
- 교육용 규모에서는 괜찮지만, 낙하 추가 시 깜빡임·성능 이슈 가능성이 있습니다.

### 6. CSS와 JS의 보드 크기 이중 정의

- JS: `COLS = 10`, `ROWS = 20`
- CSS: `repeat(10, 24px)`, `repeat(20, 24px)`

한쪽만 수정하면 불일치가 생길 수 있습니다.

---

## 반드시 수정할 문제

현재 **프롬프트 1 범위에서 치명적 런타임 버그는 없습니다.** 다만 다음은 빠르게 손보는 것이 좋습니다.

| 문제 | 설명 | 심각도 |
|---|---|---|
| **README 불일치** | “블록 미구현”·“빈 보드” 문구가 실제 코드와 맞지 않아 수강생 혼란 | Medium |
| **`createPiece(type)` 유효성 없음** | 잘못된 `type` 전달 시 `pieceData`가 `undefined`가 되어 런타임 에러 | Medium |

`createPiece("X")` 같은 호출은 지금은 없지만, 이후 디버깅·확장 시 바로 터질 수 있는 지점입니다.

---

## 선택적 개선 사항

1. **`buildDisplayBoard()` 추출** — `renderBoard()`의 데이터 조합 로직 분리
2. **색상 단일 소스** — JS `color` 제거 후 CSS만 사용, 또는 인라인 `style.backgroundColor`로 JS만 사용
3. **`startGame()` / `resetGame()` 분리** — 프롬프트 2 낙하 시작 대비
4. **점수 상태 변수 추가** — `let score = 0` + `updateScore()`로 데이터·표시 분리
5. **DOM 셀 재사용** — 최초 200개 셀 생성 후 `classList`만 갱신
6. **CSS 변수로 보드 크기 공유** — `--cols`, `--rows`로 JS/CSS 일관성 유지
7. **`createPiece()`에 type 검증** — `if (!PIECES[type])` 방어 코드 추가

---

## 리뷰 기준별 상세

### 1. 파일 구조 — ✅ 적절함

```
tetris-cursor/
├── index.html    # UI 구조
├── style.css     # 스타일 (grid, 블록 색상)
├── script.js     # 게임 상태·렌더링
├── README.md     # 실행 안내
└── docs/         # 프롬프트별 리뷰 문서
```

교육용 단일 페이지 앱에 적합한 최소 구조입니다.

### 2. 함수 이름과 역할 — ✅ 명확함

- 데이터 생성: `createEmptyBoard`, `createPiece`
- 데이터 합성: `drawPiece`
- 화면 반영: `renderBoard`, `updateScore`
- 게임 흐름: `resetGame`

역할 경계가 입문자에게 설명하기 좋습니다.

### 3. 중복 코드 — ⚠️ 소량

| 위치 | 중복 내용 |
|---|---|
| 시작/재시작 버튼 핸들러 | 동일한 `resetGame()` 호출 |
| `PIECES.color` vs CSS `.piece-*` | 색상 정의 이중화 |
| `drawPiece` 내부 경계 검사 | 이후 `canMove`와 유사 로직 재사용 가능 |

### 4. 게임 로직과 화면 렌더링 혼재 — ⚠️ 부분 분리

- **잘 분리됨:** `drawPiece()` — 순수 배열 연산
- **혼재:** `renderBoard()` — display 조합 + DOM 생성
- **미분리:** 점수는 DOM만 갱신, 상태 변수 없음

프롬프트 1 요구사항(함수 3개 분리)은 충족합니다.

### 5. 버그 가능성 — ⚠️ 낮음

| 위치 | 위험 | 비고 |
|---|---|---|
| `createPiece()` invalid type | 런타임 에러 | 방어 코드 없음 |
| `piece.color` 미사용 | 유지보수 혼란 | 동작 버그는 아님 |
| README 불일치 | 문서·실제 동작 괴리 | 기능 버그는 아님 |
| `Math.random()` 블록 선택 | 테스트 재현 어려움 | 의도된 동작 |

충돌·낙하·회전 관련 버그는 아직 코드가 없어 해당 없음.

---

*코드는 수정하지 않았습니다. 본 문서는 리뷰 결과만 기록합니다.*
