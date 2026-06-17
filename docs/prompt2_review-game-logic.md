# 게임 로직 리뷰 — 프롬프트 2 (자동 낙하와 충돌 판정)

> 집중 검토: 보드 크기, 좌표·matrix, 이동 경계, 회전 충돌, 고정 시점, 게임 오버, 라인 삭제  
> 대상: `script.js` (프롬프트 2 완료 직후)  
> 코드는 수정하지 않았습니다.

---

## 종합 평가

프롬프트 2에서 요구한 **자동 낙하**, **`canMove` 충돌 판정**, **블록 고정**, **새 블록 생성**, **게임 오버 조건(기본)** 은 구현되어 있습니다. 키보드 이동·회전·라인 클리어는 아직 없으며, 이는 이후 프롬프트 범위로 보입니다.

핵심 로직 흐름:

```
startGame() → setInterval(dropPiece)
dropPiece() → canMove(0,1) ? row++ : lockPiece()
lockPiece() → drawPiece(board) → createPiece() → canMove(0,0) ? : stopGame()
```

---

## 집중 검토 결과

| 항목 | 현재 상태 | 위험도 | 개선 제안 |
|---|---|---|---|
| **보드 크기 10×20 유지** | `COLS = 10`, `ROWS = 20`으로 JS 상수 정의. `createEmptyBoard()`가 동일 크기 2D 배열 생성. CSS `.board`도 `repeat(10, 24px)` × `repeat(20, 24px)`로 일치. | **Low** | 보드 크기를 CSS 변수(`--cols`, `--rows`)와 공유하면 JS/CSS 불일치 방지. 한쪽만 수정하는 실수 예방. |
| **현재 블록 좌표와 matrix 처리** | `board`(matrix): 고정 블록만 저장 (`0` 또는 블록 타입 문자열). `currentPiece`: `{ type, shape, row, col }`로 활성 블록 분리. `renderBoard()`는 `board` 복사본에 `drawPiece()`로 현재 블록 합성 후 DOM 반영. `lockPiece()`는 `drawPiece(board, currentPiece)`로 matrix에 영구 합침. | **Low** | 구조가 명확함. 프롬프트 3 키보드 이동 시에도 `currentPiece.row/col` 변경 + `canMove` 패턴 재사용 가능. |
| **좌우/아래 이동 경계값** | `canMove(piece, dx, dy, matrix)`가 shape의 각 `1` 칸에 대해 `newCol < 0`, `newCol >= COLS`, `newRow < 0`, `newRow >= ROWS` 및 `matrix[newRow][newCol] !== 0` 검사. 자동 낙하는 `canMove(piece, 0, 1, board)`로 아래 이동만 사용. **키보드 좌우/아래 이동은 미구현.** | **Medium** | 좌우·soft drop 추가 시 동일 `canMove` 재사용하면 됨. `newRow < 0` 차단은 회전·스폰 시 I블록 등 상단 여유가 필요할 때 제약이 될 수 있음 — 회전 구현 시 spawn row 조정 또는 상단 경계 예외 검토. |
| **회전 후 충돌 처리** | **미구현.** `rotatePiece()` 또는 shape 회전 로직 없음. `canMove`는 회전 후 위치 검증에 재사용 가능한 형태로 준비됨. | **High** (기능 누락) | `rotate(shape)` 함수 추가 후, 회전한 shape로 임시 piece 객체를 만들어 `canMove(piece, 0, 0, board)` 호출. 벽 킥(wall kick)은 초급 단계에서는 생략 가능. |
| **블록 고정 시점** | `dropPiece()`에서 `canMove(currentPiece, 0, 1, board)`가 `false`일 때 `lockPiece()` 호출. 바닥(`newRow >= ROWS`) 또는 고정 블록 겹침 모두 `canMove`에서 처리되어 고정 시점이 일관됨. | **Low** | hard drop 추가 시 바닥까지 연속 `row++` 후 한 번만 `lockPiece()` 호출하도록 분리 권장. |
| **새 블록 생성 시 게임 오버 조건** | `lockPiece()` 내: 고정 → `createPiece()` → `canMove(currentPiece, 0, 0, board)` 실패 시 `stopGame()`. 스택이 꼉 차 spawn 위치가 유효하지 않으면 게임 종료. | **Medium** | 게임 오버 시 UI(메시지·오버레이) 없음. 겹친 `currentPiece`가 화면에 남아 혼란 가능. `currentPiece = null` 또는 `isGameOver` 플래그 + 화면 표시 추가 권장. |
| **라인 삭제 후 보드 상태** | **미구현.** `clearLines()` 없음. 고정 블록은 계속 `board`에 누적만 됨. | **High** (기능 누락) | `isLineFull(row)` → 완성 행 제거 → 위 행 `unshift` 패턴 추가. 라인 클리어 후 `board` 길이가 `ROWS` 유지되는지 단위 테스트 권장. |

---

## 로직별 상세 메모

### `canMove` — 충돌 판정

```javascript
// 검사 순서: 경계 → matrix 충돌
if (newCol < 0 || newCol >= COLS || newRow < 0 || newRow >= ROWS) return false;
if (matrix[newRow][newCol] !== 0) return false;
```

- 프롬프트 2 요구사항(보드 밖 이동 차단, 고정 블록 충돌) 충족.
- `dx`, `dy`를 파라미터로 받아 이후 키보드·회전에 확장 용이.

### `dropPiece` + 타이머

- `DROP_INTERVAL = 800`ms, `setInterval(dropPiece, ...)`.
- `startDropTimer()`에서 `stopDropTimer()` 선호출로 **interval 중복 방지** 처리됨.
- `isPlaying`이 `false`면 `dropPiece` 조기 반환 — 게임 오버 후 추가 낙하 방지.

### `lockPiece` — 고정 → 스폰

- 고정과 스폰이 한 함수에 묶여 있어 흐름이 단순함.
- 게임 오버 판정이 스폰 직후에만 수행 — 표준 테트리스 패턴과 일치.

### 미구현 (이후 프롬프트 예상)

| 기능 | 상태 |
|---|---|
| 키보드 좌우 이동 | 미구현 |
| soft drop / hard drop | 미구현 |
| 블록 회전 | 미구현 |
| 라인 클리어 | 미구현 |
| 점수 증가 | 미구현 |
| 게임 오버 UI | 미구현 |

---

## 위험도 요약

| 위험도 | 항목 수 | 대표 이슈 |
|---|---|---|
| **High** | 2 | 회전 미구현, 라인 클리어 미구현 (의도된 미완) |
| **Medium** | 2 | 키보드 이동 미구현, 게임 오버 UX 부재 |
| **Low** | 3 | 보드 크기 이중 정의, matrix 분리 양호, 고정 시점 양호 |

---

## 다음 단계 제안 (프롬프트 3+)

1. **키보드 조작** — `canMove` + `currentPiece.row/col` 갱신으로 좌우·soft drop·hard drop
2. **회전** — shape 회전 후 `canMove(piece, 0, 0, board)` 검증
3. **라인 클리어** — 완성 행 제거 및 `board` 재정렬
4. **게임 오버 UI** — `stopGame()` 시 메시지 표시, 겹침 블록 처리
5. **README 동기화** — 자동 낙하·충돌 구현 상태 반영

---

*본 문서는 `/review-game-logic` 명령에 따른 리뷰 결과만 기록합니다.*
