# 배포 점검 결과 — 프롬프트 5

> 점검 일시: 프롬프트 5 (README & GitHub Pages 배포 준비)  
> 코드 수정 전 점검 결과를 먼저 기록한 뒤, README 보완 및 `.gitignore` 추가를 수행함.

---

## 1. index.html 리소스 연결

| 항목 | 경로 | 상태 |
|---|---|---|
| CSS | `<link rel="stylesheet" href="style.css">` | ✅ 정상 — 같은 디렉터리 상대 경로 |
| JS | `<script src="script.js"></script>` | ✅ 정상 — `</body>` 직전 로드 |
| 외부 CDN | 없음 | ✅ 오프라인·정적 배포에 적합 |

**GitHub Pages:** 루트(`/`) 배포 시 `https://user.github.io/repo/` 에서 상대 경로가 올바르게 해석됨.

---

## 2. 브라우저 콘솔 에러 가능성

| 위험 | 심각도 | 설명 |
|---|---|---|
| DOM id 불일치 | Low | `script.js`가 참조하는 `#board`, `#score`, `#start-btn`, `#restart-btn`, `#game-over` 모두 `index.html`에 존재 |
| `createPiece` 잘못된 type | Low | 프롬프트 4 리팩토링에서 무작위 타입 fallback 처리됨 |
| 외부 fetch/module | 없음 | ES module·fetch 미사용 |
| CORS | 없음 | 동일 출처 정적 파일만 사용 |
| `file://` 프로토콜 | Low | 로컬 더블클릭 실행 시 일부 브라우저 제한 가능 — Live Server 또는 GitHub Pages 권장 |

**결론:** 정적 파일이 함께 배포되면 콘솔 에러 가능성은 **낮음**.

---

## 3. 커밋 대상 vs 제외 대상

### 커밋 권장 (배포·문서)

| 파일/폴더 | 이유 |
|---|---|
| `index.html` | 게임 진입점 |
| `style.css` | 스타일 |
| `script.js` | 게임 로직 |
| `README.md` | 프로젝트·배포 안내 |
| `docs/` | 교육용 리뷰·QA 문서 (선택이지만 권장) |
| `.gitignore` | 불필요 파일 제외 |

### 커밋 제외 권장

| 파일/폴더 | 이유 |
|---|---|
| `.cursor/` | Cursor IDE 로컬 명령 — 배포·게임 실행과 무관 |
| `.vscode/`, `.idea/` | 에디터 설정 |
| OS 임시 파일 | `.DS_Store`, `Thumbs.db` |

---

## 4. README 보완 전 갭 분석

| README 섹션 | 보완 전 | 조치 |
|---|---|---|
| 프로젝트 소개 | 간략 | ✅ 기술 스택·특징 추가 |
| 실행 방법 | 있음 | ✅ Live Server 안내 유지 |
| 조작법 | 있음 | ✅ soft/hard drop 명시 |
| 구현 기능 | "현재 상태" 목록 | ✅ 기능 표로 정리 |
| 품질 점검 방법 | 없음 | ✅ 수동 테스트·DevTools·docs 참조 추가 |
| GitHub Pages 배포 | 없음 | ✅ 설정 단계·URL 형식·체크리스트 추가 |

---

## 5. 배포 준비 체크리스트

- [x] `index.html` / `style.css` / `script.js` 연결 확인
- [x] 상대 경로 (서브경로 Pages 호환)
- [x] README 배포 방법·URL 형식 문서화
- [x] `.gitignore` 추가 (`.cursor/` 제외)
- [ ] GitHub 저장소 생성 및 push (사용자 작업)
- [ ] Settings → Pages → main / root 설정 (사용자 작업)
- [ ] 배포 URL에서 플레이 테스트 (사용자 작업)

---

*프롬프트 5 산출물: `README.md` 보완, `.gitignore` 추가, 본 점검 문서*
