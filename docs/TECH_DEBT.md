# Technical Debt

> 프로젝트 리팩토링 과정에서 발견된 기술 부채 목록입니다.
> 기능 개발에는 직접 영향을 주지 않지만, 유지보수성과 안정성을 위해 순차적으로 개선합니다.

| Priority | Category | Issue | Impact | Suggested Solution | Status |
|----------|----------|-------|--------|--------------------|--------|
| 🔴 High | Data Integrity | `assets/data/exam.json`에는 `exam-000`, `exam-015`가 존재하지만 `assets/data/questions/`에는 해당 JSON 파일이 없어 클릭 시 404가 발생함 | 시험 진입 불가 | 누락된 JSON 추가 또는 `exam.json`에서 제거하여 데이터 일치 | ⏳ Todo |
| 🔴 High | Event Binding | 위키 상세 즐겨찾기(`#wikiDetailFavorite`)에 `ui.js`와 `wiki.js`가 각각 이벤트를 등록하여 시각 상태와 실제 저장 상태가 달라질 수 있음 | 즐겨찾기 동기화 오류 | 즐겨찾기 이벤트를 하나의 모듈에서만 관리 | ⏳ Todo |
| 🟠 Medium | Responsibility | 단어 저장(`#wmodal`)을 `modal.js`와 `mypage.js`가 함께 처리하여 책임이 분산되어 있음 | 유지보수 어려움 | 저장 로직은 `mypage.js`, `modal.js`는 UI 제어만 담당하도록 분리 | ⏳ Todo |
| 🟠 Medium | Storage | `job_features` localStorage 키를 여러 파일에서 문자열로 직접 사용 | 키 변경 시 수정 범위 증가 | `storage.js` 또는 상수 모듈에서 키를 중앙 관리 | ⏳ Todo |
| 🟠 Medium | Ownership | `pages/handbook/resume.html`이 `job.css`가 아닌 `my.css`를 사용 | 담당 영역이 불명확 | CSS 소유권 재정리 또는 공용 스타일 분리 | ⏳ Todo |
| 🟡 Low | Naming | `wiki.json`과 `wiki-data.json`의 역할이 명확하지 않아 혼동 가능 | 신규 개발자 진입 장벽 | 파일명을 역할 중심으로 변경 (`wiki-summary.json`, `wiki-content.json` 등) | ⏳ Todo |
| 🟡 Low | Dead Code | `.rank-badge` 컴포넌트가 정의되어 있으나 실제 사용되지 않음 | 불필요한 코드 유지 | 삭제 또는 Deprecated 처리 | ⏳ Todo |
| 🟡 Low | Data Integration | `pages/my/index.html`, `pages/my/favorites.html`가 JSON/Supabase와 연결되지 않은 정적 화면 | 기능 미완성 | 실제 데이터 연동 구현 | ⏳ Todo |
| 🟡 Low | Duplication | `exam.js`와 `quiz.js`가 동일한 fetch 및 캐싱 로직을 각각 구현 | 코드 중복 | 공통 API 유틸로 분리 | ⏳ Todo |
| 🟢 Info | Documentation | `docs/9-COMPONENTS.md`, `docs/99-EXAM_PLAN.md`가 신규 문서와 함께 공존 | 문서 중복 | archive 이동 또는 삭제 여부 검토 | ⏳ Todo |
| 🟢 Info | Documentation | `CHANGELOG.md`를 유지 대상으로 정의했지만 실제 파일이 존재하지 않음 | 문서 불일치 | CHANGELOG 생성 또는 문서 수정 | ⏳ Todo |