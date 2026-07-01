# Salesforce ADX 학습 자료 통합본

hj, DJ 두 분의 velog TIL을 원문 그대로 모아놓은 자료입니다. 위키 콘텐츠 제작 시 원문 출처(하단 링크)를 참고하세요.

## 출처

**[hj's TIL]**
- [Salesforce(1~2)](https://velog.io/@ouuou/Salesforce12)
- [Salesforce(3~4)](https://velog.io/@ouuou/Salesforce34)
- [Salesforce(5~6)](https://velog.io/@ouuou/Salesforce56)
- [Salesforce(7~8)](https://velog.io/@ouuou/Salesforce78)
- [Salesforce(9~10)](https://velog.io/@ouuou/Salesforce910)
- [Salesforce(11~12)](https://velog.io/@ouuou/Salesforce1112)
- [Salesforce 단어장](https://velog.io/@ouuou/Salesforce-단어장-sc5df7dt)

**[DJ's TIL]**
- [DAY2. Salesforce ADX201](https://velog.io/@katieeze0/DAY2.-Salesforce-ADX201)
- [DAY3. ADX201](https://velog.io/@katieeze0/DAY3.-ADX201)
- [DAY4. ADX201](https://velog.io/@katieeze0/DAY4.-ADX201)
- [DAY5. 1주차 마지막날](https://velog.io/@katieeze0/DAY5.-1주차-마지막날)
- [DAY6](https://velog.io/@katieeze0/DAY6-dgkkauj0)

## 목차

### hj's TIL
1. [Salesforce(1~2) — 개요, 데이터 구조, 오브젝트 관계, UI, 보안](#1-salesforce12)
2. [Salesforce(3~4) — 보안 4계층, Profile, Permission Set, 레코드 접근](#2-salesforce34)
3. [Salesforce(5~6) — Object/Field 상세, Relationship, Page Layout, Record Type](#3-salesforce56)
4. [Salesforce(7~8) — 데이터 백업/이관, 자동화 기초, Workflow, Approval](#4-salesforce78)
5. [Salesforce(9~10) — Flow, Custom Object 생성, 배포](#5-salesforce910)
6. [Salesforce(11~12) — Reports, Dashboards, Agentforce](#6-salesforce1112)
7. [Salesforce 단어장 — 전체 용어 정리 (266개)](#7-salesforce-단어장)

### DJ's TIL
8. [DAY2. Salesforce ADX201 — Fundamentals, All Users](#8-day2-salesforce-adx201)
9. [DAY3. ADX201 — Security Layers, Object/Record 접근](#9-day3-adx201)
10. [DAY4. ADX201 — Custom Object, Field, Relationship](#10-day4-adx201)
11. [DAY5. 1주차 마지막날 — Record Type, Data Management](#11-day5-1주차-마지막날)
12. [DAY6 — Case 자동화, Workflow, Process Builder, Approval](#12-day6)

---

# hj's TIL

## 1. Salesforce(1~2)

> 원문: https://velog.io/@ouuou/Salesforce12

### 1. 세일즈포스가 뭔가요?

세일즈포스는 **클라우드 기반의 비즈니스 플랫폼**으로, 고객 관리, 영업 추적, 마케팅 운영을 한곳에서 해결합니다.

**플랫폼 제품군:**
- Sales Cloud (영업 관리)
- Service Cloud (고객 서비스)
- Marketing Cloud (마케팅 캠페인)
- Experience Cloud (커뮤니티 포털)
- Tableau (데이터 분석)
- Commerce Cloud (이커머스)

**핵심 특징:** Integrated, Intelligent, Automated, Low code & no code, Open

**Multi-tenancy:** 같은 서버에서 여러 회사가 완전히 분리된 데이터로 공유

### 2. 세일즈포스의 데이터 구조

| 세일즈포스 | 엑셀 비유 | 예시 |
|---|---|---|
| Object | 시트 전체 | 거래처 시트 |
| Field | 열 | 회사명, 전화번호 |
| Record | 행 | 삼성전자 데이터 |

**Standard vs Custom Object:**
- Standard: 세일즈포스 기본 제공 (Account, Contact, Opportunity)
- Custom: 관리자가 직접 생성

### 3. 주요 오브젝트와 관계

**7가지 주요 Standard Object:** Account(거래 회사), Contact(회사의 담당자), Opportunity(영업 건), Lead(잠재 고객), Campaign(마케팅 활동), Case(고객 문의), User(내부 직원)

**관계 유형:**
- Lookup 관계 (1:N): Account-Contact, Account-Case
- Campaign Member (M:N): Campaign과 Lead/Contact 중간 연결

**영업 프로세스 흐름:** Campaign → Lead → Account/Contact → Opportunity → Contract → Case

### 4. UI 핵심 용어

- **App Launcher:** 모든 앱 접근 (점 9개 아이콘)
- **Tabs:** 상단 메뉴로 오브젝트 목록 접근
- **Page Layout:** 레코드 상세 페이지 화면 구성
- **Related List:** 연결된 다른 레코드 목록

### 5. 관리자가 주로 쓰는 화면들

- **Salesforce Setup:** 모든 설정의 본부 (톱니바퀴 아이콘 → Setup)
- **Object Manager:** Standard/Custom Object 관리
- **Schema Builder:** 오브젝트 관계 시각화

### 6. 샌드박스

프로덕션의 복제본으로 테스트용입니다.

**4가지 종류:**
- Developer (200MB, 메타데이터만)
- Developer Pro (1GB, 메타데이터만)
- Partial Copy (5GB, 메타데이터+일부 실제 데이터)
- Full (프로덕션과 동일 용량)

### 7. 회사 설정 (Company Settings)

계약 시작 시 캡처되는 조직 전체 정보: Company Information, Financial Information, Support Information

**로케일 계층:** Company Settings → User Record (개인 설정 가능)

### 8. 회계연도 (Fiscal Year)

보고서와 기회 예측의 날짜 범위를 결정합니다.

- **Standard:** 매월 1일 시작
- **Custom:** 1일이 아닌 날부터 시작 (⚠️ 한 번 설정하면 되돌릴 수 없음)

### 9. 다중 통화 (Multiple Currencies)

글로벌 비즈니스를 위해 여러 통화 지원합니다.

**계층 구조:** Corporate Currency → User Currency → Record Currency

**Advanced Currency Management:** 마감일 기준 환율 고정 가능

### 10. 활동 관리 (Tasks & Events)

**Tasks:** 할 일 목록 (To Do, Call Log, Email) - 마감일 하나만 있음
**Events:** 캘린더 일정 - 시작/종료 날짜 둘 다 있음

**캘린더:** Personal Calendar (개인), Public Calendars (관리자가 전체와 공유)

### 11. 협업 도구

**Chatter:** 세일즈포스 내 SNS 플랫폼 — 팔로우, 게시물, 댓글, 파일 공유 / Groups: Private, Public, Unlisted

**Slack:** 실시간 협업 플랫폼 (세일즈포스가 인수) — Channels, Huddles, Canvas, 2,600+ 파트너 앱

### 12. Salesforce Mobile

모바일 앱 (Android 9.0+, iOS 15.0+)으로 어디서나 같은 기능 사용 가능. Custom Fields, Objects, Page Layouts이 자동 반영됩니다.

### 13. 사용자(User) 관리

User Record의 3가지 정보: Personal (이름, 이메일, 직함), Access & Security (사용자명, 라이선스, 프로필), Locale (시간대, 언어, 통화)

**신규 사용자:** Setup → Users → New User

### 14. 로그인 보안 설정

**IP 범위:**
- **Trusted IP Ranges:** 범위 밖이면 2단계 인증 후 로그인
- **Login IP Ranges:** 범위 밖이면 로그인 자체 불가

**기기 인증:** 처음 쓰는 브라우저 → 이메일/SMS 인증코드 필요

**비밀번호 정책:** 주기적 변경, 고유성, 길이, 복잡도, 공유 금지

**MFA (다중 요소 인증):** 아이디+비밀번호+추가 인증 (앱 승인 또는 SMS)

**My Domain:** org URL에 회사명 추가 (SSO의 전제 조건)

**Single Sign-On (SSO):** 한 번 로그인으로 여러 앱 접근

**Health Check:** 보안 설정 점수화 및 취약점 안내

### 15. 핵심 요약

설정의 영향 범위:
1. Company Settings → 전 사용자 영향
2. User Profile & Permission Sets → 동일 그룹 영향
3. User Record → 개인 영향

---

## 2. Salesforce(3~4)

> 원문: https://velog.io/@ouuou/Salesforce34

### 들어가기 전에 — 비유 한 눈에 보기

Salesforce를 회사 건물으로 비유하여 설명합니다.

- Organization = 회사 건물 전체
- Object = 건물의 각 층
- Record = 층 안의 각 방
- Field = 방 안의 서랍
- Profile = 사원증 종류
- Permission Set = 임시 출입 배지
- OWD = 건물 기본 출입 규칙
- Role Hierarchy = 직급 체계
- Sharing Rules = 특별 열쇠
- Queue = 공용 업무 수거함
- Admin = 마스터키 보유자

### 1. 데이터 구조 — Object · Record · Field

Salesforce 데이터는 엑셀 표와 동일한 구조입니다.

- **Object**: 표 전체, 건물의 한 층 (예: Contacts, Opportunities)
- **Record**: 가로 줄, 층 안의 각 방 (고객 한 명의 정보)
- **Field**: 세로 칸, 방 안의 서랍 (이름, 이메일 등 각 항목)

**핵심**: Record와 Field는 종속 관계가 아닙니다. 방에 들어갈 수 있어도 서랍은 잠겨 있을 수 있고, 서랍을 열 권한이 있어도 방에 못 들어갈 수 있습니다.

### 2. 보안의 4계층 — 전체 그림

Salesforce 보안은 건물 입구 → 층 → 방 → 서랍으로 이어지는 4개 관문입니다.

| 관문 | 건물 비유 | 질문 | 제어 도구 |
|------|---------|------|---------|
| Organization | 건물 입구 | 이 건물에 들어올 수 있나? | Login Hours, IP Ranges, Password Policy, MFA |
| Object | 각 층 | 이 층에 올라갈 수 있나? | Profile, Permission Set |
| Record | 각 방 | 이 방에 들어갈 수 있나? | OWD, Role Hierarchy, Sharing Rules |
| Field | 서랍 | 이 서랍을 열 수 있나? | Field-Level Security |

**핵심 원리**: 앞 관문에서 막히면 뒤는 자동으로 보이지 않지만, 앞을 통과한다고 뒷문이 자동으로 열리지는 않습니다. 각 관문은 독립적입니다.

### 3. Object 권한과 CRED

| 권한 | 의미 | 건물 비유 |
|------|------|---------|
| **C** — Create | 새 Record 생성 | 층에 새 방 만들기 |
| **R** — Read | Record 보기 | 방 안 들여다보기 |
| **E** — Edit | Record 수정 | 방 안의 가구 바꾸기 |
| **D** — Delete | Record 삭제 | 방 없애기 |

추가 권한: "View All Records"(이 층의 모든 방 볼 수 있음, OWD 무시), "Modify All Records"(이 층의 모든 방 수정·삭제 가능)

### 4. Profile — 사원증의 종류

모든 Salesforce 사용자는 반드시 하나의 Profile을 가져야 합니다.

**Profile이 결정하는 것**:
- 볼 수 있는 것 (Settings): Assigned Apps, Tab Settings, Record Type Assignments, Page Layout Assignments, Field Permissions
- 할 수 있는 것 (Permissions): App Permissions, System Permissions, Standard/Custom Object CRED

**Standard Profile 6종류**: System Administrator (마스터키), Standard User (일반 영업 직원), Solution Manager, Marketing User, Contract Manager, Minimum Access - Salesforce (빈 사원증)

**Minimum Access**: 아무 권한도 없는 빈 사원증. 처음부터 권한이 가득한 사원증에서 지우는 것보다 안전합니다.

**Login Hours & Login IP Ranges**: Profile에 "언제, 어디서만 로그인 가능"을 설정할 수 있습니다.

### 5. Permission Sets — 임시 출입 배지

Profile은 바꾸지 않으면서 특정 직원에게만 추가 권한을 주고 싶을 때 사용합니다.

| 구분 | Profile | Permission Set |
|------|---------|----------------|
| 적용 대상 | 같은 Profile 모든 직원 | 특정 직원 몇 명 |
| 개수 | 라이선스당 최대 1,500개 | 조직 전체 최대 1,000개 |

**Total User Access**: Profile 권한 + 모든 Permission Set 권한의 합산. Permission Set은 권한을 더해주기만 할 수 있습니다. 빼려면 Muting을 사용해야 합니다.

### 6. Permission Set Groups & Muting

**Permission Set Groups**: 여러 Permission Set을 하나의 묶음으로 패키지화하여 한 번에 부여합니다.

**Muting Permissions**: Permission Set Group 안에서 특정 권한만 금지 도장을 찍어 끕니다.

### 7. 레코드 접근 수준

1. **Full Access** — View + Edit + Transfer Ownership + Change Record Type + Delete + Share (내가 만든 방)
2. **Read/Write** — View + Edit (빌린 방)
3. **Read Only** — View만 (들여다보는 방)
4. **No Access** — 아무것도 못 함, 검색에도 안 나옴

### 8. Admin — 마스터키를 가진 사람

**Admin 종류**: System Admin (가장 강력), Delegated Admin (범위 제한), Custom Admin (특정 업무용)

**핵심**: "Modify All Data" 권한을 가진 Admin은 다른 직원 동의 없이 그 직원 계정으로 대신 로그인할 수 있습니다.

### 9. 레코드 소유권 & Queue

**Record Owner**: 내가 직접 만든 Record는 내가 주인이며 Full Access를 가집니다.

**Queue**: 팀 전체가 공동 주인이 되는 공용 수거함. 팀원 중 누구든 꺼내서 처리할 수 있습니다.

Queue 구성원: Public Groups, Roles, Roles + Subordinates, Users
Queue 사용 가능 Object: Leads, Cases, Tasks, Custom Objects

### 10. 레코드 접근 확인 플로우

1. Admin인가? → YES: 모든 방 접근 가능
2. Record Owner인가? → YES: Full Access
3. Queue 멤버인가? → YES: 방 주인 수준 접근
4. OWD가 Public인가? → YES: OWD 수준 접근
5. Role Hierarchy로 접근 가능한가? → YES: 직급별 접근
6. Sharing Rules·Teams·Manual Sharing으로 공유받았나? → YES: 공유받은 수준
7. 모두 NO → No Access

### 11. OWD — 건물 기본 출입 규칙

**OWD 3가지**:
- **Public (모두 공개)** — 누구나 모든 방 들어가고 수정 가능
- **Hybrid (일부 공개)** — 다른 사람 방은 보기만 가능
- **Private (완전 잠금)** — 자기 방만 들어갈 수 있음

**추천 방법**: Private으로 시작해서 필요한 만큼만 Role Hierarchy나 Sharing Rules로 열어주세요.

### 12. Role Hierarchy — 직급이 높을수록 더 많은 방에 들어갈 수 있다

**특징**: 위에서 아래로만 열림, 상위 직급은 하위 직원 Record에서 Full Access, 같은 레벨끼리는 접근 불가 (Sharing Rules 필요)

**Associated Record Access**: Account Owner가 자신의 부하가 아닌 사람 소유의 연관 Record에 얼마나 접근할 수 있는지 설정

**Implicit Account Access**: Account의 하위 Record를 소유하면 Account도 자동으로 Read 접근 가능

### 13. Sharing Rules & Public Groups — 특별 열쇠 발급

**Sharing Rules 특징**: OWD의 예외를 만드는 것, 이미 열린 상태에선 의미 없음, 한 방향(단방향)으로만 작동

**Public Groups**: 여러 팀을 하나로 묶어 Sharing Rule 개수를 대폭 줄입니다. (16개→1개). 구성원: 개별 사용자, Roles, Roles + Subordinates, 다른 Public Group

### 14. Teams & Manual Sharing

**Teams**: Opportunity Teams(하나의 영업기회 함께 진행), Account Teams(고객사 전체 + 연결된 모든 Record), Case Teams(고객 문의 함께 처리)

**Manual Sharing**: 일회용 방문 패스. Record Owner, 상위 직급, Admin만 발급 가능. Owner 변경 시 자동 소멸.

### 15. Field-Level Security — 서랍에 자물쇠 달기

**설정 방법**: Field 페이지에서 직접 (Profile별 설정), Profile 페이지에서 (Field별 일괄 설정)

**핵심**: FLS와 Page Layout 중 더 잠긴 쪽이 항상 이깁니다.

### 16. Restriction Rules — 볼 수 있는 방을 더 줄이기

유일하게 "더 잠그는" 방향입니다. **지원 Object**: Custom Objects, Contracts, Tasks, Events

**작동 원리**: User Criteria(누구에게)와 Record Criteria(어떤 방을)를 설정하여 조건 안 맞는 방을 필터링합니다.

### 17. The Big Picture — 전체 공식 정리

**내 Record에 접근할 때**: Object 권한 - Field-Level Security + Full Access = 볼 수 있는 것

**다른 사람 Record에 접근할 때**: Object 권한 - Field-Level Security + OWD + Sharing(Role Hierarchy + Sharing Rules + Teams + Manual Sharing) = 볼 수 있는 것

**User Access Policies**: 권한을 자동으로 배정하여 수동 관리의 번거로움을 줄입니다.

### 18. Data Privacy

개인정보를 수집하고 다루는 방식에 대한 규칙입니다. 유럽 연합, 미국 등 여러 나라의 개인정보 보호 법률을 따라야 합니다.

### 19. 핵심 요약

건물 비유 전체 정리와 꼭 기억할 숫자들, 핵심 개념들이 표로 정리되어 있습니다.

---

## 3. Salesforce(5~6)

> 원문: https://velog.io/@ouuou/Salesforce56

### 들어가기 전에 — 이 글의 주인공 소개

지은 씨는 캠핑 용품을 파는 온라인 쇼핑몰 "캠핑박스"를 운영하고 있습니다. 직원 20명, 고객 수천 명이 있지만 고객 정보는 엑셀, 주문은 구글 시트, AS 문의는 카카오톡으로 따로 관리하고 있었습니다. Salesforce를 도입하여 Admin 역할을 맡은 민준 씨가 이를 꾸려나가는 이야기입니다.

### 글의 비유 한 눈에 보기

- **Organization** = 캠핑박스 건물 전체
- **Object** = 건물의 각 층 (고객 층, 주문 층, CS 층)
- **Record** = 층 안의 각 방
- **Field** = 방 안의 서랍
- **Tab** = 엘리베이터 버튼
- **App** = 엘리베이터 패널 (버튼들의 묶음)
- **Profile** = 사원증 종류
- **Permission Set** = 임시 출입 배지
- **OWD** = 건물 기본 출입 규칙
- **Role Hierarchy** = 직급 체계
- **Sharing Rules** = 특별 열쇠
- **Queue** = 공용 업무 수거함
- **Admin** = 마스터키 보유자

### 1. Salesforce를 활용하는 4단계

1. **Standard Functionality** → 이미 지어진 건물 그대로 쓰기
2. **Declarative** → 클릭으로 인테리어 공사 (코드 없음!)
3. **AppExchange** → 외부에서 가구·장비 구매해 들여놓기
4. **Programmatic** → 건축가 불러서 처음부터 새로 설계

민준 씨의 역할은 주로 2번 Declarative 방식입니다.

### 2. Object — 건물의 각 층

**Standard Object (표준 객체)**

| Standard Object | 캠핑박스에서의 역할 |
|---|---|
| Account | 도매 거래처 관리 |
| Contact | 각 거래처의 담당자 |
| Opportunity | 영업 진행 중인 거래 건 |
| Lead | 잠재 고객 |
| Case | 고객 문의·AS 접수 |
| Campaign | 마케팅 활동 |

**Custom Object (커스텀 객체)**: 직접 만드는 층. API 이름 끝에 `__c`가 붙으면 Custom이라는 뜻입니다.

**Custom Objects are (CRRSS)**: Configurable(설정 가능), Relational(관계 설정 가능), Reportable(보고 가능), Searchable(검색 가능), Securable(보안 설정 가능)

**Object를 만들면 생기는 것들**: Standard Fields, Custom Fields, Custom Relationships, Validation Rules, Page Layouts, Automation

### 3. Standard Fields — 기본으로 달려있는 서랍

**중요: Standard Field는 삭제할 수 없습니다!**

변경할 수 있는 것들: Field Label, Help Text, Picklists, Lookup Filters, Field History Tracking, Auto-Number Fields

**Data Classification Fields**: 각 서랍에 민감한 정보 태그를 붙이는 기능입니다.

### 4. Custom Fields — 직접 만든 서랍

API 이름 끝에 `__c`가 붙으면 Custom이라는 뜻입니다.

**⚠️ 데이터 손실 주의**: 서랍 유형을 바꾸면 현존하는 데이터가 손실될 수 있습니다.

**필드 삭제 시**: 삭제된 필드와 데이터는 **최대 15일** 동안 임시 보관, 이 기간 안에 Undelete 가능, 15일 지나면 영구 삭제

### 5. 4단계로 Custom Field 만들기

1. **Select Data Type** → 데이터 유형 선택 (예: Checkbox)
2. **Define Attributes** → 속성 정의 (이름, 기본값 등)
3. **Set FLS** → 필드 수준 보안 설정
4. **Add to Page Layout** → 페이지 레이아웃에 추가

**Step 2 속성**: Description, Help Text, Required, Unique, External ID, Default Value

**Step 3 FLS 설정**: Visible(볼 수 있음), Read-Only(볼 수는 있지만 수정 불가), 아무것도 체크 안 함(안 보임)

### 6. Field Type 전체 정리

**숫자형**: Number(임의의 숫자), Currency(통화 금액), Percent(소수점 자동 % 변환)

**제한 옵션형**: Checkbox(참/거짓), Picklist(1개 선택), Picklist Multi-Select(여러 개 선택)

**텍스트형**: Text(최대 255자), Text Area(255자, 줄바꿈), Text Area Long(최대 131,072자), Text Area Rich(서식+이미지+링크), Text Encrypted(마스킹 처리)

**형식 텍스트형**: Email(최대 80자), Phone(최대 40자), URL(클릭하면 새 창)

**날짜/시간형**: Date, Date/Time, Time

**계산형**: Auto Number(자동 증가 번호), Formula(자동 계산, 읽기 전용), Roll-Up Summary(자식 값 집계, 읽기 전용)

**기타**: Geolocation(위도·경도)

### 7. Picklist — 서랍 안의 칸막이

**Global Picklist Value Sets**: 여러 Object에서 같은 선택지 세트를 공유. 값은 글로벌 설정에서만 편집 가능

**Dependent Picklists**: 첫 번째 선택에 따라 두 번째 선택지가 자동으로 달라지게 만드는 기능

| Field Type | Controlling | Dependent |
|---|---|---|
| Standard Picklist | Yes | No |
| Custom Picklist | Yes | Yes |
| Custom Multi-Select Picklist | No | Yes |
| Standard Checkbox | Yes | No |
| Custom Checkbox | Yes | No |

### 8. Relationship Fields — 층과 층을 잇는 복도

| 종류 | 비유 | 특징 |
|---|---|---|
| Lookup | 느슨한 복도 | 연결이 끊겨도 각자 살아남음 |
| Master-Detail | 단단한 복도 | 부모가 사라지면 자식도 사라짐 |
| Hierarchy | 직급 체계 복도 | User Object에서만 사용 |
| Self Relationship | 같은 층 안 통로 | 같은 층 방끼리 연결 |

**Lookup Relationship** 부모 삭제 시 선택 가능한 4가지 동작: Required(값 필수), Clear the value(조회 필드만 비움), Don't allow deletion(자식 있으면 삭제 불가), Delete this record also(부모 삭제 시 자식도 삭제)

Lookup 특징: 자식의 조회 필드는 선택/필수 모두 가능, Roll-Up Summary 필드 지원 안 됨 ❌

**Relationship Field Filters ⭐ 시험 포인트**: Required Lookup Filter는 Object당 최대 5개, Optional Lookup Filter는 무제한

**Master-Detail Relationship**: Detail Record의 접근 권한은 Master Record에서 상속, 부모 삭제 → 자식도 자동 삭제, 부모 참조는 자식에서 항상 필수, Roll-Up Summary 가능 ✅

**Junction Object**: 다대다(M:N) 관계를 만들 때 사용하는 특수한 Custom Object입니다.

### 9. Lookup vs Master-Detail 비교

| 항목 | Lookup | Master-Detail |
|---|---|---|
| 부모 필드 필수 여부 | 선택사항 | 필수 |
| 부모 삭제 시 | 자식 유지, 조회 필드만 변화 | 자식도 자동 삭제 |
| 보안 상속 | 독립적 (상속 없음) | 부모에서 상속 |
| Roll-Up Summary | ❌ 불가 | ✅ 가능 |
| 최대 부모 수 | 자녀당 최대 40개 | 자식당 최대 2개 |
| 최대 깊이 | 제한 없음 | 최대 3층 |
| Standard Object가 자식 | ✅ 가능 | ❌ 불가 |

### 10. Formula Fields — 자동 계산 서랍

| 특성 | 내용 |
|---|---|
| 읽기 전용 | 사용자가 직접 값 입력 불가. 수식이 자동으로 채움 |
| 참조 가능 ✅ | 같은 Object 또는 부모 Object의 필드 |
| 참조 불가 ❌ | 암호화, 설명, Long Text Area 필드 |
| 사용 불가 ❌ | 검색, 리드 전환, 주간 내보내기 서비스 |

| 탭 | 언제 사용? |
|---|---|
| Simple Formula | 같은 Object의 숫자 필드 계산 |
| Advanced Formula | 함수, 숫자가 아닌 필드, 부모 Object 필드 포함 |

**Cross-Object Formula**: Advanced Formula 탭의 Insert Field Browser 사용, 최대 10개의 상위 수준 필드에 접근 가능, 방향은 부모 → 자식

### 11. App & Home Page

**App**: 업무 종류에 따른 작업 공간, 탭들의 묶음

**Home Page**: Profile별로 다른 홈 화면 할당 가능, Lightning App Builder로 드래그&드롭 구성, 완료 후 반드시 Activate 클릭

### 12. List Views — 층 안의 방 목록판

**만들기 3단계**: 1) 이름과 가시성 입력 2) 최대 10개의 필터 지정 3) 최대 15개의 열 선택

**표시 옵션 3가지**: Table View(일반 표), Split View(목록+상세 동시), Kanban View(카드 형태 그룹별)

### 13. Page Layouts — 방 안의 인테리어 설계도

**제어하는 것들**: Fields(추가/제거/이동/읽기전용·필수 설정), Related Lists(추가/제거/이동/열 변경/정렬), Sections(생성 및 이동), Buttons(추가 및 제거), Quick Actions(Activity 탭 표시)

**중요 규칙**: Object당·Profile당 하나의 Page Layout만 할당 가능, 최대 2개의 리포트 차트 포함 가능, 올바른 레이아웃을 보게 하려면 User Profile에 할당 필요

**레코드 페이지 편집 두 가지 방법**: Lightning App Builder/Edit Page(Related Lists, Paths, Chatter 등), Page Layout Editor via Object Manager(Fields, Related Lists, Quick Actions, Buttons)

| 항목 | Enhanced Related Lists | Basic Lists |
|---|---|---|
| 최대 열 수 | 10개 | 4개 |
| 열 크기 조절 | ✅ | ❌ |
| 대량 작업 | ✅ | ❌ |
| 텍스트 래핑 | ✅ | ❌ |

**Highlight Panel에 최대 7개 필드 표시 가능**

### 14. Dynamic Forms — 조건부 서랍 배치

Lightning App Builder 왼쪽 패널에 Fields 탭 표시, 각 필드에 조건(Condition) 설정 가능, 재배치·구성·탭 배치 가능. **최대 장점 = 유연성(Flexibility)**

⚠️ Custom Object에서만 Page Layout 편집기 대신 Lightning App Builder 사용 가능

### 15. Buttons, Links, Actions

| 항목 | Custom Buttons | Custom Links | Custom Actions |
|---|---|---|---|
| 역할 | 외부 앱과 통합 | 외부 URL로 이동 | 기능 추가, Quick Action 팝업 |
| 원래 화면 | 유지하거나 이동 | 이동 | 유지한 채 팝업 |

**Quick Actions**가 나타나는 세 곳: Global Actions Menu(입력 form), Record Pages(Activity 탭), Mobile Action Bar

### 16. Record Types — 방의 종류

레코드 유형은 **레코드(데이터)**에 할당된 화면이지, **프로필(유저)**에 할당된 화면이 아닙니다.

**⭐ Record Type FAQ**
| 질문 | 답변 |
|---|---|
| 웹 문의 폼 Case의 Record Type은? | 기본 Case 소유자의 기본 Record Type 사용 (Lead도 동일) |
| Picklist에 새 값 추가하면? | 어느 Record Type에 포함할지 관리자가 직접 선택 |
| 도매/소매 구분은 어떻게? | Page Layout에 Record Type 필드 추가 |
| 매번 Record Type 선택해야 하나? | Profile에 설정된 기본 Record Type 자동 사용 가능 |

**레코드 유형 만들기**: 1) Preparation(레이아웃 미리 준비) 2) Create Record Type Step1(Name/Description/Profile) 3) Step2(Profile별 페이지 레이아웃 선택) 4) Edit Picklists

### 17. Business Process & Path

**Business Process**: 레코드의 Life Cycle 단계를 추적하는 특수한 Picklist 필드

| Object | Process 이름 |
|---|---|
| Opportunities ✅ | Sales Process |
| Cases ✅ | Support Process |
| Leads ✅ | Lead Process |
| Solutions ✅ | — |
| Account ❌ | 없음 |

**생성 순서**: 1) Update Picklist 2) Create Business Process 3) Create Record Type
⚠️ 레코드 유형을 만들기 전에 비즈니스 프로세스를 먼저 정의해야 함!

**Path**: 화면 상단 단계별 안내 표지판. 각 단계마다 Tips 제공, 완료 시 색종이(Confetti) 🎉 효과

### 18. 핵심 요약

**Chapter 5**: Standard Fields는 삭제 불가 / FLS로 숨기거나 Page Layout에서 제거 / Custom Fields는 편집·삭제 가능하나 데이터 손실 위험 / 삭제된 필드는 최대 15일 보관 / Lookup은 느슨한 연결(Roll-Up 불가), Master-Detail은 강한 연결(Roll-Up 가능)

**Chapter 6**: Page Layout은 Fields·Sections·Related Lists·Buttons 제어 / Profile당 Object당 하나의 Page Layout만 할당 / Record Types는 여러 레이아웃과 Picklist 값 활용 / Business Process는 Opportunities·Cases·Leads·Solutions만 해당 / Path는 단계별 안내+색종이 효과

**꼭 기억할 숫자들**: List View 최대 필터 10개, 최대 열 15개 / Required Lookup Filter Object당 최대 5개, Optional 무제한 / Highlight Panel 최대 7개 필드 / Page Layout 최대 리포트 차트 2개 / Cross-Object Formula 최대 상위 필드 10개 / Master-Detail 최대 깊이 3층 / Lookup 자녀당 최대 부모 40개 / Master-Detail 자식당 최대 부모 2개 / 삭제된 필드 보관기간 15일

---

## 4. Salesforce(7~8)

> 원문: https://velog.io/@ouuou/Salesforce78

### 들어가기 전에 — 이 글의 주인공 소개

민준 씨는 캠핑 용품 회사 "캠핑박스"의 Salesforce Admin입니다. "Record가 수만 개가 됐는데 다 날아가면?", "고객 정보 5만 건을 어떻게 한꺼번에 넣지?", "Lead가 들어올 때마다 직접 배정해야 해?" 같은 고민이 생겼습니다.

### 1. Back Up Data — 건물 사진 찍어두기

**Backup 도구 비교표**

| Tool | Import | Export | Backup |
|------|--------|--------|--------|
| Data Loader | O | O | O |
| Dataloader.io | O | O | O |
| Reports | | O | O |
| Data Import Wizard | O | | |

**시험 포인트**: Data Import Wizard는 Import(가져오기)만 가능. Export, Backup은 절대 불가.

**Reports**: 원하는 Record 목록을 `.csv`, `.xl`, `.xlsx` 형식으로 뽑는 수동 도구.

**Data Loader / Dataloader.io**: CSV, Excel, 다른 DB로 내보낼 수 있음. 수동 또는 자동화 가능.

**Data Export**: 조직 전체를 통째로 백업. 이미지·문서·첨부파일 포함, 예약 가능(zip 파일 이메일 자동 발송), 자동화 가능.

**Managing Metadata**: 메타데이터는 실제 데이터가 아니라 설계도. 복원하려면 사본이 반드시 필요.

메타데이터 관리 도구 3가지: Change Sets(프로덕션↔샌드박스 복사), Sandbox Refresh(자동 복사), Force.com Migration Tool(Java/Ant 기반 CLI)

### 2. Import, Export, Update Data — 짐 옮기기

**Data Import Wizard — 이삿짐센터**: 계정, 연락처, 리드, 솔루션, 캠페인 구성원, 커스텀 오브젝트 지원. **Standard Object는 최대 50,000개**, Custom Object는 제한 없음.

선택 이유: Workflow Rules 트리거 여부 선택 가능, 중복 레코드 자동 방지. Products, Opportunities는 Import Wizard로 못 가져옴(Data Loader 필요).

**Import Wizard Matching Types**

| Object | Matching Type |
|--------|---------------|
| Contact / Lead | Salesforce.com ID / Name / Email / External ID |
| Account | Salesforce.com ID / Name and Site / External ID |
| Solutions | Solution Title / Salesforce.com ID / External ID |
| Campaign Members | Salesforce.com ID |
| Custom Objects | Record Name / Salesforce.com ID / External ID |

**Data Loader — 컨테이너 트럭**: 최대 **5,000,000개** 레코드에 대해 Insert, Update, Delete, Export, Upsert 가능. **Undelete는 불가**. Windows/Mac 지원. 설치·인증 필요.

Record ID 확인 위치: Record URL, Reports, Data Loader export file

**Dataloader.io — 클라우드 트럭**: 100% 클라우드, 가입/보안 토큰 불필요(OAuth 로그인), 시간별/주별/월별 예약 가능, 매핑하면서 관련 ID 자동 검색

**Data Import Best Practices**: 1) Field 먼저 만들기 2) 데이터 정리 3) Record ID Field 먼저 내보내기 4) 테스트 배치 준비

시험 포인트: 일반 업무 시간에는 기존 Record 업데이트 지양(동시 수정 위험), 가져오기 전 Workflow/Process Builder/Flow 비활성화

**Import 실패 원인**: Owner Field 비워두면 가져오기 수행자가 기본 소유자. 실패 원인 4가지: 필수 필드 공백, Unique Field 중복, Validation Rule 미통과, Picklist 값 불일치

**Giving Reps The Power To Import**: 데이터 가져오기 권한 있는 사용자는 연락처/리드 직접 가져오기 가능. Setup → 기본 데이터 가져오기에서 활성화

**Data Management Tool Comparison**

| 기능 | Import Wizard | Data Loader |
|------|---------------|-------------|
| 5만개 미만 레코드 가져오기 | O | O |
| 중복 방지 | O | |
| 워크플로 규칙 트리거 선택 | O | |
| 최대 500만개 로드 | | O |
| Product·Opportunity 로드 | | O |
| 가져오기 예약 | | O |
| 매핑 저장 재사용 | | O |
| 내보내기/삭제 | | O |

### 3. Mass Delete and Mass Transfer — 대량 정리·이사

**Mass Delete Records**: 조건 걸어서 한꺼번에 삭제. 삭제 전 목록 확인 가능, 삭제될 자식 레코드도 미리 안내, 대량 삭제 전 백업이 Best Practice, 삭제된 Record는 15일 동안 Recycle Bin 보관

**Recycle Bin**: My Recycle Bin은 모든 사용자 사용 가능. Restore 클릭→복원, Delete 클릭→영구 삭제

**Mass Transfer Tool**: 한 사람의 Record들을 다른 사람에게 한꺼번에 이전. Account, Lead, Service Contract, Custom Object 전송 가능. Object에 따라 관련 Record도 함께 전송 가능

### 4. Data Quality and Cleansing Tools — 건물 청소하기

**Field History Tracking**: Field 변경 이력 기록(누가, 언제, 무엇을). 각 Object당 최대 20개 Field 추적 가능. History related list 또는 History reports에서 확인. 기록 내용: 변경 일시/사용자/이전값·새값(Multi-select Picklist·Large Text Field 제외)

**Data Validation**: 저장 전 엉터리 정보 차단.
1. System Data Validation (먼저): Field data type / Required field / Unique field
2. Custom Validation Rules (나중): 비즈니스 프로세스에 따른 복잡한 조건

**Required & Unique Fields — Hard vs Soft**: 시험 포인트 — Required/Unique는 UI+API 모두 막는 Hard, Page Layout 필수는 UI에서만 막는 Soft

| 속성 | Required | Unique |
|------|-----------------|---------------|
| 동작 | 저장 시 반드시 값 입력 | 저장 시 중복 값 차단 |
| 적용 범위 | UI + API (Hard) | UI + API (Hard) |
| 특징 | 모든 Page Layout 자동 추가, 숨기기 불가 | Email·Number·Text Field만 가능 |

**Custom Validation Rules 동작 방식**: 1) 잘못된 값 입력 후 저장 시도 2) Rule이 조건 평가 3) True면 저장 중단+오류 메시지

활용 예시: Opportunity 후반 단계 추가 정보 조건부 필수화, Close Date 과거 소급 차단, 16자리 신용카드 번호 강제, 타임시트 60시간 초과 차단

**Duplicate Leads 발생 원인**: Web-to-Lead 중복 제출, Importing from lists 중복, 검색 없이 재생성, Private sharing model로 안 보여서 중복

**Merge Duplicate Leads**: 1) Lead Record 선택 → View Duplicates 2) Master 선택 → 유지할 Field 값 선택 3) 확인

**Duplicate Management**: 대상 — Business accounts / Contacts / Leads / Person accounts / Custom objects records

| 항목 | 내용 |
|-----------|--------------|
| Matching Rule | 중복 식별 기준. 표준 3가지(비즈니스 계정/연락처·리드/개인 계정) |
| Duplicate Rule | 중복 발생 시 경고 표시 또는 생성 완전 차단 |

### 5. Automation Fundamentals — 건물에 자동화 심기

**핵심 원칙**: 자동화를 직접 실행하는 게 아니라, 규칙을 심어두는 것 (Declarative Automation)

**Declarative Automation Tools**: Web-to-Lead/Web-to-Case/Email-to-Case, Assignment Rules, Auto-Response Rules, Escalation Rules(Case 전용), Big Deal Alerts/Update Reminders, Workflow, Process Builder, Approval Processes, Validation Rules, Flow

**도구별 기능 비교**

| 기능 | Workflow | Approval Process | Process Builder | Flow |
|------|----------|------------------|-----------------|------|
| Field Update | O | O | O | O |
| Email Alert | O | O | O | O |
| Task | O | O | O | O |
| Outbound Message | O | O | | |
| Create a Record | | | O | O |
| Update Records (복수) | | | O | O |
| Post to Chatter | | | O | O |
| Submit for Approval | | | O | O |
| Launch a Flow | | | O | O |
| Call Apex | | | O | O |
| Delete Records | | | | O |
| Log a Call | | | | O |
| Session-based Permission Sets | | | | O |

시험 포인트: Workflow는 Task만 생성 가능(Record 생성 불가). Record를 만들려면 Process Builder 또는 Flow.

**Order of Execution (저장 순서)**
1. Save 클릭
2. System Validation
3. Custom Validation Rules
4. ID Created / Data Saved (아직 저장 안 됨)
5. Assignment Rules
6. Auto-Response Rules
7. Workflow Rules
8. Escalation Rules (Case 전용)
9. Processes (Process Builder)
10. 데이터베이스 최종 저장 (Commit)

시험 포인트: Custom Validation Rules는 System Validation 다음 실행. System이 먼저, Custom이 나중.

**Email Templates**: 자동화 발송 이메일 양식. 자동화보다 먼저 만들어야 함. Communication Template은 Folder를 통해 접근, Access levels(Read/Read-Write), 접근 범위(전체/Role/Role+Subordinates/Public Group)

사용되는 곳: Web-to-Lead/Web-to-Case/Email-to-Case/Assignment Rules/Escalation Rules/Auto-Response Rules/Workflow/Process Builder/Approval Processes/Flow

**Lightning Email Templates**: Merge Fields로 Record Field 데이터 자동 삽입. 예: `"안녕하세요 {!Contact.FirstName}님"`. 생성 방법: Record 페이지 Email Action 또는 Email Templates Tab

**Enhanced Letterheads**: 이메일 템플릿 머리글/바닥글 표준화. 로고, 연락처, 법적 고지, 구독 취소 링크 포함 가능. Rich Text Editor 또는 커스텀 HTML.

### 6. Validation Rules — 서랍 잠금 장치 만들기

두 가지 유형, 실행 순서: 1) System Data Validation(먼저) 2) Custom Validation Rules(나중)

**Custom Validation Rules 동작**: 잘못된 값 입력 후 저장 시도 → Rule 평가 → True면 저장 중단+오류 메시지

활용 예시 4가지: Opportunity 후반 단계 정보 조건부 필수, Close Date 과거 소급 차단, 16자리 신용카드 강제, 타임시트 60시간 초과 차단

### 7. Lead and Case Management — 방문객·민원 자동 처리

**Web-to-Lead 준비 사항 (순서 중요)**: 1) Custom Fields 2) Queues 3) Assignment Rules 4) Email Templates 5) Org-wide Email Addr 6) Auto-Response Rules

시험 포인트: **Web-to-Lead 한도는 24시간당 500건**

**리드 자동화 흐름**: 1) 웹 폼 제출 2) 새 Lead Record 자동 생성 3) Assignment Rules 실행(예: Sales Territory별 Queue 배정) 4) Auto-Response Rules 실행

**Queues**: 여러 사람이 공유하는 공용 업무 수거함. 멤버: Public Groups/Role/Role+Subordinates/User 자유 조합. Queue 생성 시 List View 자동 추가. Queue 멤버 전원 FULL 접근 권한.

**Assignment Rules**: 조건에 따라 자동 배정. 한 번에 하나의 Rule만 활성화. 하나의 Rule에 여러 Rule Entry 추가 가능.

**Auto-Response Rules**: 웹 폼 제출에 자동 이메일 발송. 한 번에 하나의 Rule만 활성화. 하나의 Rule에 여러 Rule Entry(조건별 다른 템플릿). User는 Auto-Response를 받지 않음.

**Lead Conversion**: Lead → Account·Contact·Opportunity 변환. 표준 Lead Field는 자동 매핑. Opportunity Record 매핑은 선택사항. **Custom Lead Field는 반드시 수동 매핑** 필요.

**Mapping Custom Lead Fields**

| Lead Custom Field | Account·Contact·Opportunity Custom Field |
|-------------------|------------------------------------------|
| Picklist | Text (Text Field 너무 작으면 데이터 잘림 주의) |
| Text / Text Area | Long Text |
| Auto-Number | Text / Text Area |

**Web-to-Case and Email-to-Case 준비 사항**: 1) Custom Fields 2) Queues 3) Assignment Rules 4) Email Templates 5) Org-wide Email Addr 6) Auto-Response Rules

**Email-to-Case**: 발신자 이메일로 Contact 연결, 이메일 내용으로 Case Field 자동 채움, 답장(첨부 포함) 자동 연결, Assignment/Auto-Response/Escalation/Workflow 자동 트리거

시험 포인트: **Web-to-Case, Email-to-Case 한도는 24시간당 5,000건**

**Escalation Rules**: Case가 일정 시간 안에 해결 안 되면 자동 재배정/알림. **Case에만 적용**(Lead 없음). 시간 기준 mins/hours. Support Settings에서 Early Triggers 고려.

**Additional Tools**: Knowledge(아티클 작성/편집/게시/아카이브, Topic Tags·Data Categories로 정리), Support Settings(Notify Default Case Owner/Automated Case User/Early Triggers), Customer Support Sites(Experience Cloud Sites 브랜딩, Chatter 지원 티켓, Knowledge 셀프서비스, P2P 문제 해결)

### 8. Workflow and Process Builder — 자동 경보 시스템

**Workflow Rules**: 1) Evaluation Criteria(언제 평가) 2) Rule Criteria(조건) 3) 즉시 실행 Actions(Task/Email Alert/Field Update/Outbound Message) 4) Time Triggers 5) 나중 실행 Actions

Evaluation Criteria 옵션: Created(생성될 때만) / Created, and every time it's edited / Created, and any time it's edited to subsequently meet criteria

**Workflow Actions 주의사항**:
- Tasks: Workflow가 생성할 수 있는 유일한 Record 유형, Role 배정 시 발동 Record 소유자에게 배정
- Field Updates: **Target 또는 Parent Object의 Field만** 업데이트 가능, Email Alert/Task/Outbound Message보다 먼저 실행
- Outbound Messages: 외부 Endpoint로 정보 전송(외부 서비스 연동)

**Process Builder**: 여러 Criteria Node로 비즈니스 프로세스 자동화. Workflow는 하나의 조건에 하나의 액션만, Process Builder는 여러 분기 처리 가능.

지원 Actions: Create a Record / Update Records(복수) / Send Email / Post to Chatter / Send Custom Notifications / Use an Action / Submit for Approval / Launch a Flow / Launch a Process / Call Apex / Manage Quip Documents

주의사항: **Outbound Messages 미지원**(Call Apex로 대체), Actions는 입력 순서대로 실행, Criteria Node/Action은 한 Process 내 재사용 불가, Process 시작 사용자 비활성화 시 Process Admin에게 오류 이메일, 단일 Process Builder 최대 50개 버전(1개만 활성화), **Best Practice: Object당 하나의 Process Builder**

### 9. Approval Processes — 결재 라인 자동화

**Approval Process 구성 방법**: 1) "Submit for Approval" 버튼 2) Entry Criteria 3) Initial Submission Actions 4) Approval Step(s) 5) Final Approval Actions 6) Final Rejection Actions 7) Recall Actions

**Approval Process Actions** (발동 시점: Initial Submission/Final Approval/Final Rejection/Recall)

| Action | 설명 |
|--------|------|
| Lock/Unlock Record | 승인 중 Record 잠금 |
| Field Updates | 승인/거절 결과에 따라 Field 값 자동 수정 |
| Email Alerts | 승인자·신청자에게 자동 발송 |
| Tasks | 후속 할 일 자동 생성 |
| Outbound Messages | 외부 서비스로 데이터 전송 |
| Flow | Flow 실행하여 복잡한 액션 수행 |

시험 포인트: Field Update를 Final Approval Action으로 쓰면 Salesforce Flow를 트리거해 더 복잡한 작업 가능

**실제 활용 예시**: Time-off Approval(휴가 신청, 관리자 승인), Expense Report Approval(경비 보고서, 관리자+재무팀 승인), Discount Approval(20% 이상 할인, 영업 관리자 승인)

### 10. 핵심 요약

| Salesforce 용어 | 건물 비유 | 핵심 역할 |
|-----------------|---------|----------|
| Data Loader | 컨테이너 트럭 | 500만 건 대량 Import/Export. Undelete 불가 |
| Dataloader.io | 클라우드 트럭 | 100% 클라우드. 보안 토큰 불필요 |
| Import Wizard | 이삿짐센터 | 5만 건 한도. 중복 방지. Workflow 트리거 선택 가능 |
| Data Export | 건물 전체 사진 | 이미지·문서·첨부파일 포함 전체 백업 |
| Recycle Bin | 임시 보관함 | 15일 보관. Restore 가능 |
| Mass Transfer | 방 이전 서비스 | Account·Lead·Service Contract·Custom Object 일괄 이전 |
| Workflow Rule | 자동 경보 시스템 | Task만 생성 가능. Record 생성 불가 |
| Process Builder | 고급 자동 경보 패널 | Record 생성 가능. Outbound Message 불가 |
| Assignment Rule | 자동 우편함 분류기 | 한 번에 1개만 활성화 |
| Auto-Response Rule | 자동 답장 로봇 | 한 번에 1개만 활성화. User는 안 받음 |
| Escalation Rule | 긴급 알람 시스템 | Case 전용 |
| Approval Process | 결재 라인 | Lock·Field Update·Email·Task·Outbound·Flow |

**⭐ 꼭 기억할 숫자들**: Import Wizard Standard Object 최대 50,000건 / Data Loader 최대 5,000,000건 / Field History Tracking Object당 최대 20개 / Recycle Bin 15일 보관 / 표준 Matching Rule 3가지 / Web-to-Lead 24시간당 500건 / Web-to-Case·Email-to-Case 24시간당 5,000건 / Assignment Rule 활성화 1개 / Auto-Response Rule 활성화 1개 / Process Builder 최대 50버전, 활성화 1개

**⭐ 시험 포인트 총정리**
- Data Import Wizard → Import만 가능(Export·Backup 불가)
- Data Export → 이미지·문서·첨부파일 포함 백업 가능
- Data Loader → Undelete 불가 / Dataloader.io → 100% 클라우드, 보안 토큰 불필요
- Import 실패 원인 → Required Field, Unique Field, Validation Rule, Picklist 값 불일치
- Owner Field 비워두면 → 가져오기 수행 사용자가 기본 소유자
- Import 중 업데이트 → 업무 시간 외 작업 권장, 자동화 비활성화 확인
- Required/Unique Field → Hard(UI+API) / Page Layout 필수 → Soft(UI만)
- Merge Duplicate Leads → Master Record 하나 선택 후 유지할 값 결정
- Metadata 복원 → 반드시 사본을 미리 보관
- Order of Execution → System Validation → Custom Validation Rules → Assignment Rules → Auto-Response Rules → Workflow Rules → Escalation Rules(Case 전용) → Processes → Commit
- Workflow → Task만 생성 가능 / Record 생성은 Process Builder 또는 Flow
- Workflow Field Update → Target 또는 Parent Object Field만 업데이트 가능, Email Alert·Task·Outbound Message보다 먼저 실행
- Process Builder → Outbound Messages 미지원(Call Apex로 대체), Object당 하나의 Process 사용이 Best Practice, 최대 50버전·활성화 1개
- Assignment/Auto-Response Rule → 한 번에 1개만 활성화, Auto-Response는 User가 안 받음
- Escalation Rules → Case 전용(Lead 없음)
- Web-to-Lead 24시간당 500건 / Web-to-Case·Email-to-Case 24시간당 5,000건
- Custom Lead Field 전환 → 수동으로 매핑 필수
- Approval Process → Final Field Update로 Salesforce Flow 트리거 가능
- Email Template → 자동화 사용 전에 먼저 생성

---

## 5. Salesforce(9~10)

> 원문: https://velog.io/@ouuou/Salesforce910

### Lesson 9: Flow Overview

**Flow의 정의**: "어떤 일이 일어나면, 자동으로 실행되는 할 일 목록". Workflow, Process Builder, Approval Process의 모든 기능을 포함하며 더 강력함.

**장점**: 코딩 없이 클릭 구성, 제한이 거의 없음, 다른 자동화 도구보다 빠른 실행 속도

**선택 시 고려사항**: What does it do?(목적), How is it started?(시작 방식), When does it run?(실행 시점)

**두 가지 작동 방식**: Behind-the-scenes(백그라운드), Guided visual experiences(사용자가 화면 따라 진행)

**Core Flow Types (6가지)**:
- **Screen Flow**: 사용자가 직접 화면을 보고 진행하는 유일한 유형
- **Record-Triggered Flow**: 레코드 저장 시 자동 실행
- **Schedule-Triggered Flow**: 정해진 시간에 자동 실행
- **Autolaunched Flow**: 외부 코드 신호에 의해 실행
- **Platform Event-Triggered Flow**: 외부 메시지 도착 시 실행
- **Record-Triggered Orchestration**: 여러 사람이 순서대로 개입하는 복잡한 프로세스 관리

**Flow Builder 구조**: Toolbox(왼쪽, 사용 가능 항목과 메모), Canvas(중앙, 배치 영역), Button Bar(상단, Flow 상태 표시)

**Components of a Flow (4가지)**:
1. Resource: Variable(var), Constant(con), Formula(frm), Global Variables(`{!$Record.Id}`, `{!$User}`)
2. Element: Interaction(화면/이메일), Logic(조건/반복), Data(레코드 생성/수정/삭제)
3. Flow Versions: 최대 50개 저장, 1개만 active
4. Testing & Debugging: Governor Limits 확인

### Topic 2: Field 업데이트 Flow

**Before-Trigger Flow (Fast Field Updates)**: 저장 전 실행, 트리거 레코드의 서랍만 수정 가능

**Configure Start**: Object 선택, Trigger 설정(생성/수정/삭제), Optimize For: Fast Field Updates 선택, Entry Conditions 지정

**Assignment Element**: 서랍에 값을 설정하는 항목

### Topic 3: Flow 조합하기

**After-Save Flow**: 저장 후 실행, 다른 레코드 수정 가능, 이메일 전송 가능

**Action Element**: 이메일 발송, Task 생성 등 구체적 작업 실행

**Decision Element**: 조건에 따라 다른 경로로 건너뛰기

### Topic 4: Flow 띄우기

**Surface a Flow**: 사용자가 볼 수 있는 곳에 배치. 필수 권한: "Run Flows" permission

**Displaying Faults**: 오류 발생 시 사용자에게 보여줄 화면 설정

**Automation App**: 모든 Flow를 한 곳에서 관리

### Topic 5: Order of Execution

저장 버튼 클릭 시 실행 순서:
1. System Validation
2. **Flow (Before Save)**
3. Custom Validation Rules
4. Duplicate Rules
5. 데이터베이스 저장
6. Assignment Rules
7. Auto-response Rules
8. Workflow Rules
9. Escalation Rules
10. Processes (Process Builder)
11. **Flow (After Save)**
12. Commit

### Lesson 10: Create New with Clicks

**새 층 만드는 4가지 방법**: 1) Standard Functionality 사용 2) Declarative(클릭) - Admin 담당 3) AppExchange에서 구매 4) Programmatic(코드) - 개발자 담당

**Custom Object 만들기 — 4단계**: 1) Create Object(층 만들기) 2) Set Up Fields(서랍 달기) 3) Create Custom Tab(버튼 추가) 4) Set Access & Security(출입 규칙)

기본 설정: OWD는 Public Read/Write(기본값), Object Permissions는 Off(수동 활성화)

**Lightning Object Creator**: 스프레드시트에서 Custom Object 자동 생성

**Custom Tab 만들기 — 5가지 유형**: Custom Object Tabs, Web Tabs, Visualforce Tabs, Lightning Page Tabs, Lightning Component Tabs

### Change Sets & Deployment

**Metadata**: 건물 설계 도면 - 실제 데이터 아님
**Sandbox**: 실수 가능한 연습용 가짜 건물

**Deployment Tools**: Change Sets/DevOps Center(Related orgs only), SFDX CLI/ANT Migration Tool(제한 없음)

**Change Sets 8단계 배포**: 1) 연습 건물에서 변경 2) 실제 건물 허가 설정 3) Outbound Change Set 생성 4) Upload 5) Validate 6) Deploy 7) 수동 추가 항목 입력 8) 테스트

**Change Set 주의사항**: 지원하지 않는 항목은 직접 수동 추가, 삭제 명령 불가(수동 삭제), 이름 변경 시 새 설정으로 인식, 기존 설정 완전 덮어쓰기(병합 X), Upload 후 내용 수정 불가

**Setup Audit Trail**: 설정 변경 내역 추적, 최대 6개월 기록 다운로드

**DevOps Center**: Change Sets 대안, GitHub 연동, 자동화된 배포

### Mobile Layouts

**Salesforce Mobile App**: Android 9.0 이상, iOS 15.0 이상, 별도 설정 없이 대부분 자동 지원

**모바일 전용 커스터마이즈 4가지**: 1) Mobile Only Navigation(메뉴 순서) 2) Compact Layout(핵심 정보 먼저) 3) Publisher Actions(빠른 버튼) 4) Home Screen 구성

**모바일 레코드 페이지 구조**: Related Lists(왼쪽 탭), Compact Layout + Action Bar(상단), Record Detail(오른쪽 탭)

### 핵심 숫자들

Flow 최대 버전 50개, 동시 Active 버전 1개, Custom Tab 유형 5가지, Change Sets 배포 단계 8단계, Setup Audit Trail 기간 6개월

---

## 6. Salesforce(11~12)

> 원문: https://velog.io/@ouuou/Salesforce1112

### 📊 Lesson 11 — Analytics: Reports & Dashboards

**1. Report**: 현황 보고서로, 건물 안의 방(Record)들을 원하는 기준으로 모아 보여줌. Custom Report는 직접 만든 맞춤형 보고서이며 반드시 Folder에 저장해야 함.

**2. Report Folder**: 보고서를 보관하는 잠금 보관함. Admin이 누구에게 어떤 열쇠를 줄지 정함. 접근 권한은 상위 폴더 기준으로 상속되며, Subfolder에는 별도 제한 불가.

**3. Report Component Overview (7가지)**: Report Type, Scope, Columns, Grouping, Summaries, Filters, Highlights/Charts 순서로 확인.

**4. Report Types**: 어느 층(Object)과 관련 층을 연결할지 미리 정하는 양식 틀. Standard Report Types는 "with" 관계(Inner Join), Custom Report Types는 "with or without" 관계(Outer Join).

**5. Report Formats (4가지)**:
- **Tabular**: 가장 단순한 표, 그룹·차트 불가
- **Summary**: 그룹별 소계 있는 표, 차트 가능, 최대 3단계 그룹화
- **Matrix**: 가로·세로 양방향 그룹화, 최대 4단계(행2+열2)
- **Joined**: 여러 표 합친 보고서, 최대 5개 Block

**6. Groupings & Summaries**: Grouping은 같은 값끼리 묶어 Subtotal과 Grand Total을 보여줌. Summaries는 Sum, Average, Count, Min, Max, Median 등 계산 방식 선택.

**7. Filters & Filter Logic**: 최대 20개 추가 Filter 가능. AND/OR/NOT + 괄호로 복잡한 조건 설정 가능.

**8. Formulas**: Row-level Formulas는 각 줄마다 자동 계산. Summary Formulas는 그룹 줄에만 나타나며, Summary/Matrix 형식만 지원하고 최대 5개.

**9. Conditional Formatting**: Summary Field 또는 Summary Formula 필요. 최대 5개 Rule 설정, Summary·Matrix 형식만 사용 가능.

**10. Report Charts**: 숫자 데이터를 그래프로 시각화. Horizontal/Vertical Bar, Stacked Bar, Donut, Funnel, Line 등 다양한 유형.

**11. Exporting Reports**: .csv/.xlsx/.xls 파일로 저장. Chart는 Export 불가. Formatted Report 옵션으로 서식 보존 가능.

**12. Subscribe, Schedule & Send — Reports**: 자동 이메일 발송 기능. 모든 수신자는 Report 저장 Folder에 접근 가능해야 함. 조건부 발송 가능—조건 미충족 시 이메일 미발송.

**13. Running User: Run Report As**: 이메일 발송 시 "누구의 눈으로" 데이터를 볼지 결정하는 사람. Me 또는 Another Person 옵션.

**14. Dashboards**: 여러 Custom Report의 데이터를 한 화면에 시각화. Custom Report 기반이며, 최대 20개 Component 가능. 실시간이 아님.

**15. Dashboard Components**: Source Report에서 데이터 가져오는 개별 위젯. Horizontal Bar, Vertical Bar, Line, Stacked Bar, Gauge, Donut, Tables, Funnel, Metric, Scatter Chart 등.

**16. Dashboard Properties & Running User**: 세 가지 옵션 — Me(내 데이터 모두에게 표시), Another Person-Fixed(지정자 데이터로 고정), Dashboard Viewer-Dynamic(각자 권한에 맞는 데이터, 예약 새로고침 불가).

**17. Subscribe, Schedule & Send — Dashboards**: User, Group, Role 추가 가능. 모든 수신자는 Dashboard 저장 Folder 접근 권한 필수.

**18. Analytics Home**: Report와 Dashboard를 한 곳에서 관리하는 통합 허브. 검색·접근·생성·Collection 정리 가능.

### 🤖 Lesson 12 — The Agentic Enterprise

**19. AI 시대의 도래 — Agentic AI란?**: 반복 업무를 처리해서 사람이 창의성·관계·임팩트 필요 일에 집중할 수 있도록 함. 혁명적 도약.

**20. Agentic Enterprise란?**: AI Agent와 사람, App, Data가 협력해 운영되는 조직. Salesforce 실제 결과: 1.2M 지원 요청, Zero 놓친 Lead, 15% 마케팅 파이프라인 증가, 68K Slack 직원 보완, 106개 24/7 지원 시설.

**21. Agentforce 360**: 사람, Agent, App, Data를 하나로 묶은 플랫폼. Trusted, Deeply unified, Easy to use, No code & Vibe code, Open.

**22. What is Agentforce?**: 두 가지 성격 — A Set of Tools(Agentforce Builder, Atlas Reasoning Engine) + A Suite of Agents(Service Agent, Employee Agent, Lead Qualifying 등).

**23. How Agentforce Works — Agentic Loop**: Plan → Evaluate → Refine 반복 사이클로 작동. 모든 과정은 Trust Layer 위에서 실행.

**24. Attributes of an Agent (5가지)**: Role(업무), Data(정보), Actions(능력·목표), Guardrails(금지 규칙), Channel(작동 위치).

**25. Example Agent and Actions**: Employee Agent가 General CRM Topic 담당. Get Record Details, Query Records, Update Record, Draft Email 등 실제 행동 수행.

**26. Agentforce Use Cases (팀별 활용 사례)**: Sales(Lead 자격 심사), Service(케이스 분류), Marketing(양방향 대화), ITSM(장애 감지), HR(온보딩), Engineering(버그 분석) 등.

**27. Salesforce Architecture**: Apps & Embedded AI → Agentforce → AI Tools & Builders → Einstein Trust Layer → Model Ecosystem → Data 360 → Hyperforce 계층 구조. 모든 AI는 Trust Layer로 보안 보장.

**28. What is a Prompt?**: AI Model에 내리는 지시서. 질문 + 지시 + 맥락 세 가지 포함.

**29. Prompt Templates & Testing**: 자주 쓰는 Prompt 패턴을 미리 만든 틀. Template Settings, Prompt, Preview, Expected Response 구성.

**30. Popular Prompt Template Types (4가지)**: Sales Email, Field Generation, Flex, Record Summary.

**31. Troubleshooting Agents**: 잘못된 Topic 선택, 잘못된 Action 사용, 출력 오류, Input 전달 오류, Rule 미준수, Template 미표시 등 문제 상황.

### 📋 자격증 시험 정보

**32. Administrator Certification Quick Facts**: 65문제(비채점 5문제), 68% 합격, 105분 소요. Data and Analytics Management 17%(가장 높음), Configuration & Setup 15%, Object Manager 15%, Automation 15%, Agentforce AI 8%.

**33. 핵심 요약 & 꼭 기억할 숫자들**

꼭 기억할 숫자: Report Filter 20개, Summary Formula 5개, Conditional Formatting Rule 5개, Summary Format Grouping 3단계, Matrix Format Grouping 4단계(행2+열2), Joined Format Block 5개, Dashboard Component 20개

**Lesson 11 핵심**: Folder 접근으로 통제, Report Type이 사용 가능한 Object·Field·Column 결정, 4가지 형식 제한사항 외우기, Running User가 데이터 표시 결정, Dynamic Dashboard는 예약 새로고침 불가

**Lesson 12 핵심**: Agentic AI는 혁명적 도약, Agentforce는 도구+에이전트 모음, Agentic Loop 반복 작동, 5가지 속성(Role/Data/Actions/Guardrails/Channel), Einstein Trust Layer로 보안 보장, 좋은 Prompt=질문+지시+맥락

---

## 7. Salesforce 단어장

> 원문: https://velog.io/@ouuou/Salesforce-단어장-sc5df7dt

### 1. Salesforce 기본 개념

1. **Salesforce**: 인터넷으로 접속하는 기업용 고객 관리 플랫폼
2. **Cloud**: 컴퓨터에 설치하지 않고 인터넷으로 접속해 사용하는 서비스
3. **CRM**: 고객 정보를 모아 영업·마케팅·서비스를 체계적으로 관리하는 시스템
4. **Org**: 한 회사가 사용하는 Salesforce 환경 전체
5. **Multi-tenancy**: 여러 회사가 같은 서버를 공유하되 데이터는 완전히 분리된 방식
6. **Production**: 실제로 운영 중인 Salesforce 환경
7. **Sandbox**: 테스트용 공간으로 실제 환경과 동일하게 구성됨
8. **Metadata**: Salesforce 구조 설정 정보 (실제 데이터가 아님)
9. **Setup**: Admin이 모든 설정을 하는 관리자 화면
10. **Quick Find**: Setup 내에서 원하는 메뉴를 빠르게 검색하는 검색창
11. **AppExchange**: Salesforce용 앱 마켓
12. **Trailhead**: Salesforce 공식 무료 학습 플랫폼
13. **Admin**: Salesforce의 모든 설정을 관리하는 사람
14. **Declarative**: 코드 없이 클릭만으로 Salesforce 설정·자동화하는 방식
15. **Programmatic**: 코드(Apex)를 작성해서 Salesforce를 개발하는 방식

### 2. 데이터 구조 — 건물 비유

16. **Object**: 데이터를 저장하는 표 전체 (건물의 각 층)
17. **Record**: Object 안의 데이터 하나 (층 안의 각 방)
18. **Field**: Record 안의 정보 항목 하나 (방 안의 서랍)
19. **Standard Object**: Salesforce가 기본으로 제공하는 Object
20. **Custom Object**: Admin이 직접 만드는 Object (API 이름에 `__c` 붙음)
21. **Standard Field**: Salesforce가 기본으로 제공하는 Field (삭제 불가)
22. **Custom Field**: Admin이 직접 만드는 Field (API 이름에 `__c` 붙음)
23. **API Name**: Salesforce 내부에서 사용하는 Field/Object의 고유 이름
24. **Field Label**: 화면에 표시되는 Field 이름 (API Name과 다르게 변경 가능)
25. **Required Field**: 반드시 값을 입력해야 저장되는 Field
26. **Unique Field**: 같은 값이 두 개 이상 존재할 수 없는 Field
27. **External ID**: Salesforce 밖의 다른 시스템에서 사용하던 고유 번호
28. **Record ID**: Salesforce가 Record 생성 시 자동으로 붙이는 18자리 고유 번호
29. **Record Owner**: 해당 Record를 담당하는 사람 (방 주인)
30. **Related List**: Record 화면 하단에 보이는 연결된 다른 Record들의 목록
31. **Child Record**: 다른 Record에 연결된 하위 Record

### 3. Standard Object — 기본 제공 층

32. **Account**: 거래하는 회사나 조직
33. **Contact**: Account에 속한 담당자 개인
34. **Opportunity**: 진행 중인 영업 기회
35. **Lead**: 아직 고객이 아닌 잠재 고객
36. **Campaign**: 마케팅 활동
37. **Case**: 고객의 문의나 문제 접수
38. **User**: Salesforce를 사용하는 내부 직원
39. **Contract**: Opportunity 성사 후 계약 조항 관리
40. **Order**: 계약 후 실제 주문·발주 관리
41. **Campaign Member**: Campaign과 Lead/Contact를 연결하는 중간 Object
42. **Solution**: 자주 발생하는 Case의 해결 방법 저장

### 4. 화면 구성 용어

43. **App Launcher**: 왼쪽 상단의 점 9개 아이콘 (모든 앱 볼 수 있음)
44. **App**: 업무 종류에 따른 작업 공간 (탭들의 묶음)
45. **Tab**: 상단 메뉴 버튼 (해당 Object 목록으로 이동)
46. **App Manager**: 모든 Salesforce 앱을 보고 만들고 수정하는 곳
47. **Page Layout**: Record를 열었을 때 보이는 화면 구성
48. **Compact Layout**: Record 카드나 모바일 화면에서 보이는 간략한 정보 구성
49. **Highlight Panel**: Record 페이지 상단의 핵심 Field 요약 영역 (최대 7개)
50. **List View**: Object의 Record들을 조건으로 필터링해서 보여주는 목록
51. **Kanban View**: Record를 카드 형태로 그룹별로 시각화
52. **Object Manager**: Standard/Custom Object의 모든 설정 도구
53. **Schema Builder**: Object들이 어떻게 연결되어 있는지 시각적으로 보여주는 다이어그램
54. **Lightning App Builder**: 드래그 앤 드롭으로 홈 페이지나 Record 페이지를 꾸미는 도구
55. **Dynamic Forms**: 특정 조건일 때만 Field가 보이도록 하는 기능
56. **Record Type**: 같은 Object 안에서 용도가 다른 방의 종류
57. **Business Process**: Record의 진행 단계를 추적하는 특수 Picklist
58. **Path**: 화면 상단에 표시되는 단계별 안내 표지판
59. **Quick Action**: 현재 화면을 벗어나지 않고 팝업 창에서 작업
60. **Help Text**: Field 옆의 아이콘에 마우스를 올리면 보이는 설명

### 5. Field 종류

61. **Text**: 최대 255자의 글자 입력 필드
62. **Text Area**: 여러 줄의 글자 입력 (줄바꿈 가능)
63. **Text Area Long**: 최대 131,072자 입력 가능
64. **Text Area Rich**: 서식, 이미지, 링크 포함 가능
65. **Text Encrypted**: 저장될 때 암호화되는 필드 (권한 없으면 비표시)
66. **Number**: 숫자 입력 필드
67. **Currency**: 통화 기호와 소수점이 자동 표시되는 금액 필드
68. **Percent**: 자동으로 %로 변환되는 필드
69. **Checkbox**: 참/거짓 표시 필드
70. **Date**: 날짜만 입력하는 필드
71. **Date/Time**: 날짜와 시간을 함께 입력
72. **Time**: 시간만 입력하는 필드
73. **Email**: 이메일 형식 자동 검증 (최대 80자)
74. **Phone**: 전화번호 형식으로 입력 (최대 40자)
75. **URL**: 웹 주소 입력 필드 (클릭하면 새 창으로 열림)
76. **Picklist**: 미리 정해둔 선택지 중 하나를 선택
77. **Picklist Multi-Select**: 미리 정해둔 선택지 중 여러 개를 선택
78. **Auto Number**: 자동으로 증가하는 번호 생성
79. **Formula**: 다른 필드 값을 참조해 자동 계산하는 읽기 전용 필드
80. **Roll-Up Summary**: 자식 Record 값을 부모 Record에 집계 (Master-Detail 관계만 가능)
81. **Geolocation**: 위도·경도 좌표로 위치 저장
82. **Global Picklist Value Set**: 여러 Object에서 같은 선택지를 공유
83. **Dependent Picklist**: 첫 번째 선택에 따라 두 번째 선택지가 자동 변경
84. **Data Classification**: 각 Field에 민감도 태그 붙이기

### 6. Object 관계 종류

85. **Lookup Relationship**: 두 Object를 느슨하게 연결 (부모 삭제 시 자식 살아남음)
86. **Master-Detail Relationship**: 두 Object를 단단하게 연결 (부모 삭제 시 자식도 삭제)
87. **Hierarchy Relationship**: User Object에서만 사용하는 직급 체계 표현
88. **Self Relationship**: 같은 Object 안의 Record끼리 연결
89. **Junction Object**: 다대다(M:N) 관계를 만들기 위한 중간 Custom Object
90. **Reparent**: Master-Detail 관계에서 자식의 부모를 다른 Record로 변경
91. **Lookup Filter**: Lookup 관계에서 검색 결과를 필터링하는 조건
92. **Cross-Object Formula**: 다른 Object의 Field 값을 참조해 계산하는 수식 (최대 10개 상위 필드)

### 7. 보안 용어

93. **Login Hours**: 특정 시간대에만 로그인 가능하도록 제한
94. **Login IP Ranges**: 특정 장소(IP)에서만 로그인 가능하도록 제한 (범위 밖은 불가)
95. **Trusted IP Ranges**: 신뢰 IP 등록 (범위 밖에서도 2단계 인증 후 로그인 가능)
96. **MFA**: 아이디+비밀번호 외에 추가 인증을 요구하는 보안 방식
97. **SSO**: 한 번 로그인으로 여러 앱에 자동 접속
98. **My Domain**: Salesforce org URL에 회사 이름을 넣는 설정
99. **Health Check**: 조직의 보안 설정 안전도를 점수로 표시
100. **Password Policy**: 비밀번호 길이, 복잡도, 변경 주기 등 설정
101. **Identity Verification**: 처음 쓰는 브라우저 로그인 시 인증 과정
102. **Data Privacy**: 고객 데이터 수집·보호에 대한 규칙

### 8. 접근 권한 제어

103. **Profile**: 모든 사용자가 가져야 하는 사원증 (Object 접근권 및 가능 작업 결정)
104. **Permission Set**: Profile은 유지하되 특정 직원에게만 추가 권한 (여러 개 가능)
105. **Permission Set Group**: 여러 Permission Set을 패키지로 묶어 한 번에 부여
106. **Muting Permission**: Permission Set Group 안에서 특정 권한만 차단
107. **CRED**: Create(생성), Read(읽기), Edit(수정), Delete(삭제) 4가지 권한
108. **View All Records**: OWD를 무시하고 Object의 모든 Record 볼 수 있는 권한
109. **Modify All Records**: OWD를 무시하고 모든 Record 수정·삭제 가능한 권한
110. **OWD**: 건물의 기본 출입 규칙 (내가 소유자가 아닌 Record에 대한 기본 접근 권한)
111. **Role Hierarchy**: 직급이 높을수록 부하직원의 Record에 접근 가능 (위→아래만 가능)
112. **Sharing Rules**: OWD가 잠금이어도 특정 팀에 특정 Record 접근 허용 (단방향)
113. **Public Group**: 여러 사용자, 역할, 그룹을 하나로 묶어 Sharing Rules 한 번에 적용
114. **Manual Sharing**: Record 주인이 특정 직원에게 일회용 방문 패스 제공
115. **Opportunity Team**: 하나의 Opportunity를 함께 진행하는 팀
116. **Account Team**: 하나의 Account와 연결된 모든 Contact, Opportunity, Case 담당 팀
117. **Case Team**: 하나의 Case를 여러 명이 함께 처리하는 팀 (최대 3개)
118. **Field-Level Security**: 각 Field에 자물쇠를 다는 기능 (누가 어떤 필드를 볼지 설정)
119. **Restriction Rules**: 이미 볼 수 있는 Record 중 특정 조건만 보이도록 더 제한
120. **Sharing Hierarchy**: 특정 Record에 누가 접근할 수 있는지 한눈에 확인
121. **User License**: Salesforce 사용을 위한 접근 권한 종류
122. **User Access Policies**: 특정 조건 충족 시 자동으로 Profile/Permission Set 배정
123. **Implicit Account Access**: Account 하위 Record 소유 시 그 Account 읽기 권한 자동 생성

### 9. 데이터 관리 도구

124. **Backup**: 데이터 손실에 대비해 미리 복사본 생성
125. **Data Export**: Salesforce의 모든 데이터를 한꺼번에 백업 (이미지, 문서, 첨부 파일 포함)
126. **Data Loader**: 대량 데이터 가져오기/내보내기 프로그램 (최대 500만 건, PC 설치 필요)
127. **Dataloader.io**: Data Loader의 클라우드 버전 (설치 불필요, OAuth 로그인)
128. **Data Import Wizard**: Salesforce 내장 데이터 가져오기 도구 (최대 5만 건)
129. **Import**: 외부 데이터를 Salesforce로 가져오기
130. **Export**: Salesforce 데이터를 파일로 꺼내기
131. **Insert**: 새 Record 추가
132. **Update**: 기존 Record 수정
133. **Delete**: Record 삭제 (15일 동안 Recycle Bin에 보관)
134. **Upsert**: Update + Insert의 합성어 (이미 있으면 수정, 없으면 생성)
135. **Undelete**: 삭제된 Record 복원 (15일 안에만 가능)
136. **Matching Type**: 새 데이터가 기존 데이터와 같은 건지 구별하는 기준
137. **Mass Delete**: 조건을 걸어 여러 Record 한꺼번에 삭제
138. **Mass Transfer**: 한 사람의 여러 Record를 다른 사람에게 한꺼번에 이전
139. **Recycle Bin**: 삭제된 Record가 최대 15일 보관되는 임시 보관함
140. **Permanently Delete**: Recycle Bin에서도 완전히 삭제 (복원 불가)
141. **Restore**: Recycle Bin에서 삭제된 Record 되살리기
142. **Change Sets**: Sandbox 설정을 Production으로 옮기는 도구
143. **Sandbox Refresh**: Sandbox를 Production의 최신 상태로 갱신
144. **Force.com Migration Tool**: 로컬과 Salesforce org 간 Metadata 이동 (명령줄 도구)

### 10. 자동화 도구

145. **Declarative Automation**: 코드 없이 화면 설정만으로 자동화
146. **Order of Execution**: Save 버튼 시 내부 실행 순서 (System Validation → Custom Validation → Assignment Rules → Auto-Response → Workflow → Escalation → Processes → 최종 저장)
147. **Workflow Rule**: 조건 충족 시 자동으로 액션 실행 (Task 생성만 가능, Record 생성 불가)
148. **Evaluation Criteria**: Workflow Rule이 언제 Record를 검사할지 설정
149. **Time Trigger**: 특정 시간 경과 후 자동화 액션 실행
150. **Field Update**: 자동화에서 Field 값 자동 변경 액션
151. **Outbound Message**: Salesforce에서 외부 시스템으로 데이터 자동 전송 (Workflow/Approval Process만 가능)
152. **Process Builder**: Workflow보다 강력한 자동화 (Record 생성 가능, 여러 분기 처리, Outbound Message 불가)
153. **Criteria Node**: Process Builder 내에서 조건 분기 지점
154. **Flow**: 가장 강력한 자동화 도구 (거의 모든 작업 가능)
155. **Approval Process**: Record 저장/값 변경 전 상위 담당자 승인 자동화
156. **Entry Criteria**: Approval Process 진입 조건
157. **Initial Submission Actions**: 승인 제출 시 실행되는 액션
158. **Final Approval Actions**: 최종 승인 시 실행되는 액션
159. **Final Rejection Actions**: 최종 거절 시 실행되는 액션
160. **Recall Actions**: 승인 요청 회수 시 실행되는 액션
161. **Validation Rule**: 잘못된 값이 저장되지 않도록 막는 규칙
162. **System Data Validation**: Salesforce가 기본으로 제공하는 유효성 검사
163. **Custom Validation Rules**: Admin이 만드는 유효성 검사 규칙
164. **Queue**: 여러 사람이 공유하는 공용 업무 수거함
165. **Assignment Rule**: 새 Lead/Case를 조건에 따라 자동 배정 (한 번에 1개만 활성화)
166. **Rule Entry**: Assignment Rule 안의 개별 조건 항목
167. **Auto-Response Rule**: 웹 폼 제출에 자동 이메일 응답 (한 번에 1개 Rule만 활성화)
168. **Escalation Rule**: Case가 일정 시간 미해결 시 상위 담당자에게 자동 재배정/알림
169. **Early Trigger**: Escalation Rule에서 조기 에스컬레이션 시작
170. **Big Deal Alert**: Opportunity 금액 기준 초과 시 자동 알림
171. **Update Reminder**: Opportunity 미업데이트 시 자동 알림
172. **Duplicate Management**: 같은 Record 중복 생성 방지 시스템
173. **Matching Rule**: Duplicate 찾기 위한 Field 매칭 기준
174. **Duplicate Rule**: Duplicate 발견 시 경고/차단 설정
175. **Field History Tracking**: Field 값 변경 이력 기록 (Object당 최대 20개)

### 11. 이메일 관련

176. **Email Template**: 자동화에서 발송할 이메일 내용 미리 작성한 양식
177. **Lightning Email Template**: Salesforce Lightning 버전 이메일 양식
178. **Merge Field**: Email Template의 자동 채우기 빈칸 (각 사람 정보 자동 입력)
179. **Enhanced Letterhead**: Email Template의 머리글/바닥글을 회사 브랜드에 맞게 꾸미기
180. **Org-wide Email Address**: 자동화에서 발신자 이메일로 사용할 회사 공용 주소

### 12. Lead & Case 관련

181. **Lead Conversion**: Lead를 Account·Contact·Opportunity로 전환
182. **Web-to-Lead**: 웹 폼 자동 제출 시 Lead 자동 생성 (24시간 500건 한도)
183. **Web-to-Case**: 웹 폼 자동 제출 시 Case 자동 생성 (24시간 5,000건 한도)
184. **Email-to-Case**: 특정 이메일 주소 자동 수신 시 Case 자동 생성 (24시간 5,000건)
185. **Knowledge**: 자주 묻는 질문/해결 방법을 Article로 저장·공유
186. **Article**: Knowledge 안의 개별 문서
187. **Customer Support Sites**: 고객이 직접 문제를 해결하는 셀프서비스 포털
188. **Experience Cloud Sites**: 고객, 파트너, 직원을 위한 커뮤니티/포털 생성

### 13. 회사 설정 관련

189. **Company Settings**: 조직 전체 정보 관리 설정
190. **Locale**: 날짜, 숫자, 이름 형식을 지역에 맞게 설정
191. **Language**: Salesforce 화면 텍스트 언어 설정
192. **Time Zone**: 이벤트와 날짜의 기준 시간대
193. **Corporate Currency**: 회사 전체 기준 통화
194. **Multiple Currencies**: 여러 나라 통화 동시 사용
195. **Advanced Currency Management**: Opportunity에서 마감일 기준으로 환율 고정
196. **Fiscal Year**: 보고서와 영업 예측에 사용되는 회계 기간
197. **Business Hours**: 회사 공식 업무 시간 설정
198. **Holiday**: 업무 시간 계산에서 제외되는 휴일 설정
199. **Standard Fiscal Year**: 시작일이 매월 1일인 회계연도
200. **Custom Fiscal Year**: 1일이 아닌 날짜로 시작하는 회계연도 (한 번 활성화 시 되돌릴 수 없음)

### 14. 협업 도구

201. **Chatter**: Salesforce 내장 협업 소셜 플랫폼
202. **Chatter Group**: 특정 주제/팀을 위한 Chatter 채널 (Private, Public, Unlisted)
203. **Slack**: Salesforce가 인수한 실시간 협업 플랫폼
204. **Activity**: Task(할 일)와 Event(일정) 통칭
205. **Task**: 마감일이 있는 할 일 목록
206. **Event**: 시작/종료 날짜가 있는 캘린더 일정
207. **Personal Calendar**: 모든 사용자의 개인 일정 관리 캘린더
208. **Public Calendar**: Admin이 만들어 전체 사용자와 공유하는 캘린더
209. **Salesforce Mobile**: 스마트폰에서 Salesforce를 사용하는 앱

### 15. Salesforce 제품군

210. **Sales Cloud**: 영업 관리, 파이프라인 추적 특화 제품
211. **Service Cloud**: 고객 서비스, Case 관리 특화 제품
212. **Marketing Cloud**: 마케팅 캠페인, 이메일 자동화 특화 제품
213. **Experience Cloud**: 고객·파트너 커뮤니티 포털 생성 제품
214. **Tableau**: 데이터 분석 및 시각화 도구
215. **Commerce Cloud**: 이커머스(온라인 쇼핑몰) 관리 제품
216. **Customer 360**: 영업·마케팅·고객서비스를 하나로 연결해 고객을 360도로 보는 컨셉
217. **Einstein**: Salesforce 내장 AI 기능
218. **Connected App**: Salesforce와 외부 애플리케이션 연결 설정

### 16. Sandbox 종류

219. **Developer Sandbox**: 개발·테스트용 (Metadata만, 200MB)
220. **Developer Pro Sandbox**: 더 큰 데이터 필요 개발·테스트용 (Metadata만, 1GB)
221. **Partial Copy Sandbox**: 테스트·교육용 (Metadata + 일부 데이터, 5GB)
222. **Full Sandbox**: 성능 테스트·스테이징용 (Metadata + 전체 데이터)
223. **Deploy Changes**: Sandbox 설정을 Production으로 이동

### 17. 레코드 접근 수준

224. **Full Access**: 보기·수정·소유권 이전·삭제·공유 모두 가능
225. **Read/Write**: 보기와 수정 가능 (삭제 불가)
226. **Read Only**: 보기만 가능
227. **No Access**: 접근 불가 (검색에도 안 나옴)
228. **VESTD**: Record Owner의 5가지 권한 (View·Edit·Share·Transfer·Delete)

### 18. Profile 관련 세부 용어

229. **Standard Profile**: Salesforce 기본 제공 6가지 Profile (삭제 불가, 수정 대부분 불가)
230. **System Administrator**: 모든 권한 최강력 기본 Profile
231. **Standard User**: 일반 영업 직원용 기본 Profile
232. **Minimum Access**: 아무 권한도 없는 빈 Profile (새 Profile 시작점)
233. **Tab Settings**: Profile에서 상단 탭 표시 여부 설정
234. **Assigned Apps**: Profile에서 표시되는 앱 메뉴 설정
235. **Record Type Assignments**: Profile에서 사용 가능한 Record 유형 설정
236. **Page Layout Assignments**: Profile에서 Record 화면 구성 설정
237. **Field Permissions**: Profile에서 Field 표시/수정 여부 설정
238. **App Permissions**: Profile에서 특정 앱 기능 사용 여부 설정
239. **System Permissions**: Profile에서 시스템 설정 접근 여부 설정
240. **Delegated Admin**: 범위가 제한된 마스터키 (특정 사용자만 관리)
241. **Field Accessibility**: 모든 Field와 모든 Profile의 접근 현황을 표 형태로 표시
242. **Manager Groups**: Role Hierarchy 대신 "직속 관리자" 필드 기준으로 공유

### 19. Chatter 세부 기능

243. **Announcements**: Chatter Group에서 중요 게시물 상단 고정
244. **Poll**: Chatter에서 팀원 의견 투표로 수집

### 20. Slack 세부 기능

245. **Channel**: Slack에서 주제별로 나뉜 대화 공간
246. **Huddle**: Slack에서 빠른 음성·화상 대화 시작
247. **Canvas**: Slack에서 팀과 공유 문서 작성

### 21. Formula 관련 세부 용어

248. **Simple Formula**: 같은 Object의 숫자 Field 계산 수식
249. **Advanced Formula**: 함수, 비숫자 Field, 부모 Field 포함하는 복잡한 수식
250. **Insert Field Browser**: Advanced Formula에서 참조 Field 찾아 삽입하는 도구

### 22. List View 관련 세부 용어

251. **Split View**: 왼쪽 목록 + 오른쪽 상세 정보 동시 표시
252. **Enhanced Related Lists**: 기본 Related List보다 강력 (최대 10개 열, 대량 작업 가능)

### 23. Case 관련 세부 용어

253. **Support Settings**: Case 관련 자동화 설정 관리
254. **Notify Default Case Owner**: 새 Case 배정 시 기본 소유자 자동 알림
255. **Automated Case User**: 자동화로 Case 처리할 때 사용하는 시스템 사용자
256. **Predefined Case Team**: 자주 쓰는 Case Team 구성 미리 저장
257. **Data Categories**: Knowledge Article 분류 카테고리
258. **Topic Tags**: Knowledge Article에 붙이는 주제 태그
259. **Service Contract**: 고객과의 서비스 수준 협약 관리 Object

### 24. Process Builder 액션 세부 용어

260. **Post to Chatter**: Process Builder/Flow에서 자동 Chatter 게시
261. **Submit for Approval**: 자동으로 Approval Process 제출
262. **Launch a Flow**: Flow를 실행하는 액션
263. **Call Apex**: Apex 코드를 실행하는 액션
264. **Log a Call**: Flow에서 통화 내용 자동 기록
265. **Session-based Permission Sets**: Flow 중 임시로 추가 권한 부여 (Flow 종료 후 자동 제거)
266. **User License Types**: Salesforce 라이선스 주요 3가지 종류 (Standard/Chatter/Experience Cloud)

**총 266개 용어 및 정의 정리 완료**

---

# DJ's TIL

## 8. DAY2. Salesforce ADX201

> 원문: https://velog.io/@katieeze0/DAY2.-Salesforce-ADX201 · 작성: Dajeong, 2026-05-19

### Lesson 1: Salesforce Fundamentals

**Key Takeaways:**
- Salesforce funtions in a multi-tenant Cloud
- Objects related to each other
- Admin's function in Setup, the backend of Salesforce
- Sandbox, production org

**Salesforce Agentic Enterprise**: System flows through context → work → agency → engagement

**Multi-tenant Cloud**: All customers worldwide can use the same features simultaneously while maintaining separate spaces, sharing common resources like utilities and maintenance.

**Standard/Custom Object**
- **Look up relationship**: Creates loose connections between objects (contacts can exist without accounts and vice versa)
- **Master detail relationship**: Dependent relationship where one cannot exist without the other

**Schema Builder**: Located in Setup

**Sandbox**: Used for deployment to production

### Lesson 2: The Big Picture: All Users

**Key Takeaways:**
- Configuration of company settings, fiscal year, currencies, UI settings, chatter
- Default settings apply corporate-wide
- Customizing Salesforce mobile app
- Security Layers

**Key Terminology & Overview:**
- Language and date settings
- CDT (Central Daylight Time)
- Fiscal year: 12-month period starting on specific date
- Currency settings: organization-level and individual-level options
- Task & Event: Team-based processing with mandatory date/time
- Customizing activities: Created within all objects
- Personal calendars: Display START and END DATES in one location
- Chatter: Social platform with polls and groups (some require approval)
- Slack: Automates repetitive work and serves as knowledge platform
- Security layers (organizational structure): Organisation > Object > Record > Field
- Verification: Trusted IP ranges enable access; outside ranges require additional procedures
- MFA (Multi-factor authentication): Generates 6-digit codes for verified devices
- MY DOMAIN: Should be as specific as possible
- Single Sign On (SSO): One login accessing multiple applications
- Health Check: Companies typically maintain 70%+ score; focuses on high-risk security settings

---

## 9. DAY3. ADX201

> 원문: https://velog.io/@katieeze0/DAY3.-ADX201

**SECURITY LAYERS**
- ORGANIZATION (the building)
- OBJECTS (the floors within the building)
- RECORDS (the rooms on each floor)
- FIELDS (the file cabinets accessible within each room)

RANGE: OBJECT ACCESS & RECORD ACCESS

### OBJECT: PROFILE | PERMISSION SETS & PERMISSION SET GROUPS | MUTING PERMISSIONS | PERMISSION SET-LED SECURITY

**1) Standard Profile**: Template role that cannot be modified or deleted. Offers minimum access with additional permissions configurable through permission sets.

**2) Custom Profile**: Created by duplicating standard profiles. Groups same job types together and layers additional permissions.

**3) Login Hours & Login IP Ranges**: Controls when and where users can access the system for enhanced security (e.g., new staff limited to 9-6 access only).

**4) Permission Sets**: Provide "additional permissions built on minimal base access" to reduce risk while allowing flexible user assignment within the same profile.

**5) Permission Set Groups**: Combines multiple permission sets into one assignment unit for efficiency (e.g., HR super user role).

**6) Muting Permissions**: Disables specific permissions for external users or interns without affecting other permission sets.

**7) Field-Level Security (FLS)**: Restricts access to specific fields across detail pages, edit pages, related lists, search results, and list views.

### RECORD OWNERSHIP & ACCESS LEVELS
- Admin (full system access)
- Full Access (View, Edit, Share, Transfer, Delete)
- Record Ownership & Queues
- OWD (Organization-Wide Defaults): private, public read-only, public read/write, public read/write/transfer

### RECORD ACCESS CONTROLS
- Role Hierarchy
- Sharing Rules (up to 300 with 50 conditions max)
- Public Groups (simplifies complex organizational sharing)
- Data Privacy (CCPA, GDPR compliance)

---

## 10. DAY4. ADX201

> 원문: https://velog.io/@katieeze0/DAY4.-ADX201

### RANGE & PURPOSE

1. CUSTOMIZE STANDARD FUNCTIONALITY
   - EVALUATE / MODIFY / CREATE
2. CUSTOMIZE THE UI
   - USE APP MANAGER, LIGHTNING APP BUILDER / CREATE HOME PAGE, LIST VIEW / CREATE, MODIFY PAGE LAYOUTS ELEMENTS / CREATE RECORD TYPES / BUILD PROCESS

### 주요 학습 주제

- STANDARD & CUSTOM FIELDS의 차이
- LOOKUP, MULTI-SELECT PICKLIST, CROSS-OBJECT FORMULA, ROLLUP SUMMARY FIELD의 차이
- PAGE LAYOUT, RECORD TYPE
- ACCOUNT RECORD & BUSINESS PROCESS의 차이

### FLOW ORDER OF EVALUATION

1) STANDARD FUNCTIONALITY
2) DECLARATIVE
3) AppExchange
4) PROGRAMMATIC

### LIGHTNING PLATFORM의 OBJECTS

- DATA CONFIGURATION: STANDARD FIELDS, CUSTOM FIELDS, CUSTOM RELATIONSHIP
- DATA QUALITY: VALIDATION RULE
- PAGE CONTROL: PAGE LAYOUTS & RECORD TYPES
- AUTOMATION: AUTOMATE BUSINESS PROCESSES
- SECURITY: CONTROL RECORD ACCESS, FIELD-LEVEL SECURITY

**CUSTOM OBJECTS: 'CRSS'** (Configurable, Relational, Reportable, Searchable, Securable)

### 상세 항목

- STANDARD FIELDS
- CUSTOM FIELDS
- DATA LOSS (15일 복구 가능)
- PICKLIST FIELDS / GLOBAL PICKLISTS VALUE SETS / DEPENDENT PICKLIST
- OBJECT RELATIONSHIPS / LOOKUP RELATIONSHIPS FIELDS
- MASTER-DETAIL RELATIONSHIP FIELDS / JUNCTION OBJECT
- CUSTOM FORMULA FIELDS / CROSS-OBJECT FORM

### MINDSET

고민 10분 + 빠른 도움 요청 & 건강한 질문 / IT + 비즈니스 / 문제해결 중심 / 선택과 집중

**참고 사항**: 2026년 6월 10일 AGENTFORCE WORLD TOUR 컨퍼런스 (온라인) / SALESFORCE PLUS, SLACK & TABLEAU 활용

---

## 11. DAY5. 1주차 마지막날

> 원문: https://velog.io/@katieeze0/DAY5.-1주차-마지막날 · 작성: Dajeong, 2026-05-22, 태그: HAPPY FRIDAY

### RECORD TYPE

- PREPARATION → RECORD STEP 1,2 → EDIT PICKLISTS 프로세스
- RECORD TYPE WITH BUSINESS PROCESSES: OPPORTUNITIES, CASES, SOLUTIONS, LEADS

### BUSINESS PROCESSES

- **SALES PROCESS**
- **SUPPORT PROCESS**: 고객지원팀 활용
- **LEAD PROCESS**: 잠재고객 관리, 폼 제출 후 연락

**비즈니스 프로세스 생성 순서**: UPDATE PICKLIST → CREATE BUSINESS PROCESS → CREATE RECORD TYPE

### DATA MANAGEMENT

**DATA BACKUP OPTIONS**
- **REPORTS**: 소규모에 적합, 수동, CSV 형식
- **DATA LOADER/DATALOADER.IO**: 대규모 백업 적합, 수동, CSV
- **DATA EXPORT**: 장기적 백업 적합, 자동 프로세스, 이미지·문서 등 첨부 가능

**DATA IMPORT 방식 비교**
- **DATA IMPORT WIZARD**: 5만 개 이하 소량 데이터
- **DATA LOADER**: 약 500만 개 대규모 데이터
- **DATALOADER.IO**: 클라우드 기반 솔루션

**모범 사례**: "CREATE, CLEAN UP, EXPORT, TEST BATCH" 프로세스 진행. 업무시간 외 업데이트 권장

**데이터 관리 기능**
- **MASS DELETE**: 필터 적용 후 일괄 삭제
- **RECYCLE BIN**: 15일 보관, 복구·영구삭제 가능
- **MASS TRANSFER**: 다른 사용자에게 이관

---

## 12. DAY6

> 원문: https://velog.io/@katieeze0/DAY6-dgkkauj0

### Automating Cases

- Automation, Assignment, Web to case form, 하루 최대 5000건 처리(PENDING QUEUE)

### Web to Case 준비사항

- Custom Fields
- Queues
- Assignment Rules

### Email to Case 준비사항

- Email Templates
- Org-wide Email Address
- Auto-response Rules
- Triggers (assignments, auto-response, escalation, workflow rules, processes)

### ORDER OF EXECUTION

- Auto-response rules: 6단계
- Escalation Rules: 8단계 (cases only)

### 기타 지원 방법

- Knowledge
- Support Settings
- Customer Support Sites

### Work flow Rules (7단계)

특정 조건 만족 시 실행. 구조: "Evaluation Criteria > Rule Criteria > Actions > Time Triggers > Actions"

**Workflow Actions 고려사항**
- Task
- Field Updates
- Outbound Messages

### Process Builder (9단계)

다중 기준 노드로 비즈니스 프로세스 자동화

### Approval Process

"Submit for approval > Entry criteria > Initial submission actions > Approval step(s) > Recall 처리 > Final actions"

**6가지 Approval 액션**: Lock/Unlock Record, Field Update, Email Alerts, Tasks, Outbound Messages, Flow
