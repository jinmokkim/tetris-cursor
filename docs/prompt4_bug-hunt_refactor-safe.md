# 버그 헌트 & 안전 리팩토링 — 프롬프트 4

> `/bug-hunt` 점검 후 `/refactor-safe` 적용 결과  
> 대상: `script.js` (프롬프트 4 완료 직후)

---

## 1. 버그 헌트 결과

### High

| # | 항목 | 설명 | 조치 |
|---|---|---|---|
| — | *(없음)* | 프롬프트 4 핵심 로직(낙하·충돌·라인 삭제·게임 오버)에서 즉시 재현 가능한 치명적 버그는 발견되지 않음 | — |

### Medium

| # | 항목 | 설명 | 조치 |
|---|---|---|---|
| M1 | **`createPiece(type)` 유효성 없음** | 잘못된 `type` 전달 시 `PIECES[type]`이 `undefined`가 되어 런타임 에러 | ✅ `!PIECES[type]`이면 무작위 타입으로 대체 |
| M2 | **`isGameOver` 미사용** | 플래그가 설정되지만 입력 가드에 반영되지 않아, 향후 `isPlaying`만 true인 중간 상태에서 입력이 허용될 여지 | ✅ `handleKeyDown`에 `isGameOver` 검사 추가 |
| M3 | **`canMove` / `drawPiece` 중복 루프** | shape 순회·경계 검사 로직이 분리되어 있어 한쪽만 수정 시 불일치 위험 | ✅ `forEachFilledCell`, `isInsideBoard`로 통합 |

### Low

| # | 항목 | 설명 | 조치 |
|---|---|---|---|
| L1 | **`piece.color` 미사용** | 생성만 되고 렌더링은 CSS 클래스 사용 | 유지 (동작 변경 없음, 교육용 데이터로 보존) |
| L2 | **`renderBoard` 매번 DOM 재생성** | 200셀 `innerHTML` 초기화 후 재생성 → 낙하 시 깜빡임 가능 | 문서화만 (성능 리팩토링은 범위 외) |
| L3 | **`bindKeyboard.isBound` 함수 속성** | 동작은 하지만 가독성 낮음 | ✅ `isKeyboardBound` 모듈 변수로 변경 |
| L4 | **`clearLines` 빈 행 생성 중복** | `Array.from({ length: COLS }, () => 0)` 반복 | ✅ `createEmptyRow()` 추출 |
| L5 | **시작/재시작 버튼 동일 동작** | 둘 다 `startGame()` — UX 혼란 가능 | 유지 (의도된 동작, 범위 외) |
| L6 | **`setInterval` 백그라운드 탭 지연** | 브라우저가 백그라운드 탭 타이머를 늦춤 | 문서화만 (표준 브라우저 동작) |

### 점검 항목별 상태 (bug-hunt 초점)

| 점검 항목 | 결과 |
|---|---|
| 충돌 판정 오류 | ✅ `canMove` 경계·matrix 검사 정상. 리팩토링으로 순회 로직 통합 |
| 회전 시 배열 인덱스 오류 | ✅ `rotateShape` 인덱스 정상. 충돌 시 `previousShape` 복원 |
| 라인 삭제 후 보드 상태 | ✅ `splice` + `unshift`로 `ROWS` 길이 유지 |
| 게임 오버 조건 누락 | ✅ `lockPiece` 후 `canMove(0,0)` 실패 시 `triggerGameOver` |
| `setInterval` 중복 실행 | ✅ `startDropTimer`가 `stopDropTimer` 선호출 |
| 키보드 이벤트 중복 등록 | ✅ `isKeyboardBound` 플래그로 1회만 등록 |
| 점수 계산 오류 | ✅ `LINE_SCORES` 테이블 + fallback 정상. `calculateLineScore`로 분리 |

---

## 2. 안전 리팩토링 변경 요약

### 추가된 함수

| 함수 | 역할 |
|---|---|
| `createEmptyRow()` | 빈 행 생성 (라인 삭제·보드 생성 공용) |
| `forEachFilledCell(piece, callback)` | 블록 shape의 채워진 칸 순회 |
| `isInsideBoard(row, col)` | 보드 경계 검사 |
| `buildDisplayBoard()` | 렌더링용 보드 합성 (데이터 레이어) |
| `calculateLineScore(linesCleared)` | 줄 삭제 점수 계산 |
| `isRowFull(row)` | 행이 가득 찼는지 확인 |

### 변경된 함수

| 함수 | 변경 내용 |
|---|---|
| `canMove` | `dx/dy` → `deltaCol/deltaRow`, `forEachFilledCell` 사용 |
| `drawPiece` | `forEachFilledCell` + `isInsideBoard` 사용 |
| `renderBoard` | `buildDisplayBoard()` 호출로 데이터·DOM 분리 |
| `clearLines` | `isRowFull`, `createEmptyRow`, `calculateLineScore` 사용 |
| `movePiece` | 파라미터명 `deltaCol`, `deltaRow` |
| `createPiece` | 잘못된 `type` 방어 |
| `handleKeyDown` | `isGameOver` 가드 추가 |
| `bindKeyboard` | `isKeyboardBound` 모듈 변수 사용 |
| 버튼 이벤트 | `() => startGame()` → `startGame` 직접 전달 |

### 제거·통합

- `bindKeyboard.isBound` 함수 속성 → `isKeyboardBound` 변수
- `canMove` / `drawPiece` 내부 중복 이중 루프 → `forEachFilledCell`

---

## 3. 유지되어야 하는 동작 (리팩토링 전후 동일)

| 동작 | 유지 여부 |
|---|---|
| 보드 크기 10×20 | ✅ |
| 7종 테트로미노 무작위 생성·상단 중앙 스폰 | ✅ |
| 800ms 자동 낙하 | ✅ |
| `canMove` 통과 시에만 이동·회전 | ✅ |
| 회전 충돌 시 이전 shape 복원 | ✅ |
| hard drop 후 즉시 고정 | ✅ |
| 가득 찬 줄 삭제 및 위 블록 하강 | ✅ |
| 줄 수별 점수 (100/300/500/800) | ✅ |
| 스폰 불가 시 게임 오버 + 오버레이 | ✅ |
| 게임 오버 후 키 입력 무시 | ✅ |
| 시작/재시작 시 보드·점수·타이머·상태 초기화 | ✅ |
| `setInterval` 중복 방지 | ✅ |
| 키보드 리스너 1회 등록 | ✅ |

---

## 4. 수정된 파일

| 파일 | 변경 |
|---|---|
| `script.js` | 버그 방어 + 함수 분리 리팩토링 |
| `docs/prompt4_bug-hunt_refactor-safe.md` | 본 문서 (신규) |

`index.html`, `style.css`는 변경하지 않았습니다.

---

## 5. 리팩토링 후 확인 체크리스트

- [ ] **시작** 후 자동 낙하 정상
- [ ] 좌우·회전·soft drop·hard drop 정상
- [ ] 벽·고정 블록 충돌 시 이동/회전 차단
- [ ] 1~4줄 삭제 시 점수 100/300/500/800
- [ ] 스택 꽉 참 시 게임 오버 UI 표시
- [ ] 게임 오버 후 키 입력 무시
- [ ] **재시작** 후 전체 초기화 및 재플레이
- [ ] 페이지 새로고침 후 키 입력이 2배로 적용되지 않음

---

*본 문서는 `/bug-hunt` 및 `/refactor-safe` 명령 수행 결과를 기록합니다.*
