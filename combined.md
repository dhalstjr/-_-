`html
<!DOCTYPE html>
<html lang="ko">
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
 <title>바로그 월이벤트 생성기</title>
 <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
 <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
 <link rel="stylesheet" href="./이벤트.css">
</head>
<body>
 <div class="bg-blur">
  <div class="blob" style="top: 10%; left: 10%;"></div>
  <div class="blob" style="top: 60%; left: 80%; width: 400px; height: 400px; background: var(--accent);"></div>
 </div>
 <div class="container">
  <div class="input-card glass-card">
   <h1>바로그 월이벤트 생성기</h1>
   <div class="form-section">
    <div class="form-row-group">
     <div class="form-group-item">
      <div class="label-with-tip">
       <span class="label-text">상단 제목</span>
       <span class="label-tip">✽ 불필요한 경우 공란</span>
      </div>
      <input type="text" id="topTitle" value="바로그 강남점 4월 이벤트" placeholder="상단 제목 입력">
     </div>
     <div class="form-group-item">
      <div class="label-with-tip">
       <span class="label-text">이벤트 기간</span>
       <span class="label-tip">✽ 불필요한 경우 공란</span>
      </div>
      <input type="text" id="topDate" value="2026.04.01 - 2026.04.30" placeholder="이벤트 기간 입력">
     </div>
    </div>
    <div class="form-row-group">
     <div class="form-group-item">
      <div class="label-with-tip">
       <span class="label-text">하단 문구</span>
      </div>
      <input type="text" id="botText" value="부가세별도" placeholder="하단 문구 입력">
     </div>
     <div class="form-group-item">
      <div class="label-with-tip">
       <span class="label-text">🎨 테마 색상</span>
       <span class="label-tip">✽ 강조색 일괄 변경</span>
      </div>
      <div class="color-group"
       style="background: white; border: 1px solid #e5e7eb; border-radius: var(--radius-md); padding: 5px 12px; height: 48px; display: flex; align-items: center;">
       <div class="color-swatch-wrapper" style="width: 28px; height: 28px;">
        <button id="themeSwatch" class="color-swatch" style="background-color: #0064FF;"></button>
        <input type="color" id="themeColor" class="color-picker-hidden" value="#0064FF">
       </div>
       <input type="text" id="themeHex" class="input-hex" value="#0064FF"
        style="border: none !important; box-shadow: none !important; height: auto !important; padding: 0 !important; font-size: 15px !important; flex: 1; text-align: left !important; margin-left: 10px; color: var(--text-main); font-weight: 700;">
      </div>
     </div>
    </div>
   </div>
   <div class="form-section">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
     <span class="label" style="margin-bottom: 0;">항목 데이터</span>
    </div>
    <div id="bannerTabs"></div>
    <div id="itemsContainer">
    </div>
    <div class="add-controls">
     <button class="btn-add" onclick="addItemRow()">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
       <path d="M5 12h14" />
       <path d="M12 5v14" />
      </svg>
      항목 추가
     </button>
    </div>
   </div>
   <div class="form-section">
    <div class="file-input-wrapper" id="dropZone">
     <label class="file-label" id="fileLabel">배경 이미지 파일 선택 또는 드래그</label>
     <input type="file" id="bgInput" accept="image/*">
    </div>
   </div>
   <div class="button-row">
    <button class="btn-generate" onclick="generateImages()">
     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
      style="margin-right:8px; vertical-align:middle;">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M12 18v-6" />
      <path d="m9 15 3 3 3-3" />
     </svg>
     이미지 생성하기 (Ctrl+S)
    </button>
    <button class="btn-download" id="downloadBtn" onclick="downloadAllImages()">
     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
      style="margin-right:8px; vertical-align:middle;">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
     </svg>
     전체 다운로드
    </button>
   </div>
   <div class="project-actions">
    <button class="btn-project" id="saveProjectBtn" onclick="saveProject()">
     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      style="margin-right:6px; vertical-align:middle;">
      <path
       d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <rect width="7" height="8" x="8" y="3" rx="1" />
      <path d="M7 21v-7a1 1 0 0 1 1-1h8a1 1 0 0 1 1-1v7" />
     </svg>
     내용 백업
    </button>
    <button class="btn-project" onclick="document.getElementById('projectInput').click()">
     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      style="margin-right:6px; vertical-align:middle;">
      <path
       d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.7 1.1h1.1" />
      <path d="m11 13 3 3 3-3" />
      <path d="M14 17V10" />
     </svg>
     백업 불러오기
    </button>
    <input type="file" id="projectInput" accept=".json" style="display: none;" onchange="loadProject(event)">
   </div>
  </div>
  <div class="preview-card glass-card">
   <div class="preview-container" id="previewContainer">
    <div class="placeholder-text" id="placeholder">
     <p style="font-size: 40px; margin-bottom: 20px;">🖼️</p>
     배경 이미지 선택 후 생성하기를 눌러주세요.
    </div>
   </div>
   <p style="text-align:center; font-size:12px; color:var(--text-muted); margin-top:8px; font-weight: 500;">
    이미지가 여러 장일 경우 스크롤하여 확인할 수 있습니다.
   </p>
  </div>
 </div>
 <script src="https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.2/Sortable.min.js"></script>
 <script src="./이벤트.js"></script>
</body>
</html>
`
`css
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&family=Noto+Sans+JP:wght@500;700;800&family=Noto+Sans+SC:wght@500;700;800&family=Noto+Sans+Thai:wght@500;700;800&display=swap');
  @font-face {
   font-family: 'GmarketSansMedium';
   src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansMedium.woff') format('woff');
   font-weight: normal;
   font-style: normal;
  }
  @font-face {
   font-family: 'GmarketSansBold';
   src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansBold.woff') format('woff');
   font-weight: normal;
   font-style: normal;
  }
  :root {
   --primary: #0064FF;
   --primary-light: #E8F3FF;
   --primary-dark: #1B64DA;
   --accent: #E5E8EB;
   --bg-main: #F2F4F6;
   --surface: #FFFFFF;
   --glass-bg: rgba(255, 255, 255, 1);
   --glass-border: #E5E8EB;
   --text-main: #191F28;
   --text-muted: #8B95A1;
   --text-tertiary: #ABB3BB;
   --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.02);
   --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.05);
   --shadow-lg: 0 20px 40px rgba(0, 0, 0, 0.08);
   --radius-sm: 10px;
   --radius-md: 18px;
   --radius-lg: 24px;
   --font-family: 'Pretendard', sans-serif;
  }
  * {
   box-sizing: border-box;
   margin: 0;
   padding: 0;
   -webkit-font-smoothing: antialiased;
   -moz-osx-font-smoothing: grayscale;
  }
  body {
   font-family: var(--font-family);
   background-color: var(--bg-main);
   color: var(--text-main);
   line-height: 1.6;
   padding: 32px 20px;
   min-height: 100vh;
  }
  .bg-blur {
   position: fixed;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   z-index: -1;
   overflow: hidden;
  }
  .blob {
   position: absolute;
   width: 500px;
   height: 500px;
   background: var(--primary);
   filter: blur(100px);
   opacity: 0.15;
   border-radius: 50%;
   animation: move 20s infinite alternate;
  }
  @keyframes move {
   from {
    transform: translate(-10%, -10%);
   }
   to {
    transform: translate(10%, 10%);
   }
  }
  .container {
   max-width: 1400px;
   margin: 0 auto;
   display: grid;
   grid-template-columns: 1.1fr 1fr;
   gap: 24px;
   align-items: start;
   animation: fadeIn 0.8s ease-out;
  }
  @keyframes fadeIn {
   from {
    opacity: 0;
    transform: translateY(20px);
   }
   to {
    opacity: 1;
    transform: translateY(0);
   }
  }
  @media (max-width: 1100px) {
   .container {
    grid-template-columns: 1fr;
   }
  }
  .glass-card {
   background: var(--surface);
   border: 1px solid var(--glass-border);
   border-radius: var(--radius-lg);
   box-shadow: var(--shadow-md);
   padding: 32px;
   transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
  }
  h1 {
   font-size: 26px;
   letter-spacing: -0.5px;
   margin-bottom: 28px;
   font-weight: 800;
   color: var(--text-main);
   display: flex;
   align-items: center;
   gap: 14px;
  }
  h1::before {
   content: '';
   display: block;
   width: 6px;
   height: 30px;
   background: var(--primary);
   border-radius: 3px;
  }
  .form-section {
   margin-bottom: 24px;
   background: #F9FAFB;
   padding: 24px;
   border-radius: var(--radius-md);
   border: 1px solid #F2F4F6;
  }
  .label {
   display: block;
   font-weight: 700;
   font-size: 13px;
   margin-bottom: 6px;
   color: var(--text-muted);
   text-transform: uppercase;
   letter-spacing: 0.5px;
  }
  input[type="text"],
  textarea {
   width: 100%;
   padding: 16px 20px;
   background: white;
   border: 1px solid #E5E8EB;
   border-radius: var(--radius-md);
   font-size: 15px;
   font-family: inherit;
   color: var(--text-main);
   transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
   box-shadow: none;
  }
  input[type="text"]:focus,
  textarea:focus {
   outline: none;
   border-color: var(--primary);
   box-shadow: 0 0 0 4px rgba(0, 100, 255, 0.1);
   transform: translateY(-1px);
  }
  textarea {
   height: 120px;
   resize: vertical;
  }
  #itemsContainer {
   display: flex;
   flex-direction: column;
   gap: 12px;
   margin-bottom: 24px;
  }
  .item-row,
  .section-title-wrapper {
   display: grid;
   align-items: center;
   background: white;
   padding: 12px 16px;
   border-radius: var(--radius-md);
   border: 1px solid #eee;
   box-shadow: var(--shadow-sm);
   transition: all 0.25s ease;
  }
  .item-row {
   grid-template-columns: 24px 1fr 80px 100px 50px;
   gap: 12px;
  }
  .section-title-wrapper {
   display: grid;
   grid-template-columns: 24px 80px 1fr 40px;
   align-items: center;
   gap: 12px;
   background: #e8f3ff;
   border: 1px solid var(--primary-light);
   border-left: 6px solid var(--primary);
   padding: 20px;
   border-radius: 12px;
   position: relative;
   box-shadow: 0 4px 12px rgba(0, 100, 255, 0.05);
   transition: all 0.2s ease;
   margin-bottom: 8px;
  }
  .active-banner {
   box-shadow: 0 0 0 2px var(--primary);
   background: #d8e9ff;
  }
  .section-title-wrapper:not(:first-child) {
   margin-top: 50px;
  }
  .item-row {
   margin-left: 14px;
   border-left: 2px solid #F2F4F6;
   padding-left: 24px;
  }
  .section-title-wrapper::before {
   content: attr(data-page-label);
   position: absolute;
   top: -12px;
   left: 20px;
   background: var(--primary);
   color: white;
   font-size: 11px;
   font-weight: 800;
   padding: 3px 12px;
   border-radius: 20px;
   box-shadow: 0 4px 8px rgba(0, 100, 255, 0.2);
   z-index: 10;
  }
  .section-title-input {
   min-height: 48px !important;
   resize: none !important;
   padding: 8px 12px !important;
   border-radius: 12px !important;
   line-height: 1.4 !important;
  }
  .item-row:hover,
  .section-title-wrapper:hover {
   transform: scale(1.01) translateY(-2px);
   box-shadow: var(--shadow-md);
   border-color: var(--primary);
  }
  .drag-handle {
   cursor: grab;
   color: #d1d5db;
   font-size: 18px;
   display: flex;
   align-items: center;
   justify-content: center;
   transition: color 0.2s;
  }
  .drag-handle:hover {
   color: var(--primary);
  }
  .btn-input {
   border: 1px solid #f3f4f6 !important;
   border-radius: 10px !important;
   background: #fafafa !important;
   padding: 10px 12px !important;
   font-size: 14px !important;
   font-weight: 600 !important;
  }
  .item-name {
   min-height: 48px;
   resize: none;
   border-radius: 12px !important;
  }
  .add-controls {
   display: grid;
   grid-template-columns: 1fr;
   gap: 12px;
   margin-top: 16px;
  }
  button {
   display: flex;
   align-items: center;
   justify-content: center;
   gap: 8px;
   padding: 16px 24px;
   border: none;
   border-radius: var(--radius-md);
   font-size: 15px;
   font-weight: 700;
   cursor: pointer;
   transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .btn-add {
   background: var(--primary-light);
   color: var(--primary);
  }
  .btn-add:hover {
   background: #D8E9FF;
   transform: translateY(-2px);
  }
  .btn-add-page {
   background: #F2F4F6;
   color: var(--text-main);
  }
  .btn-add-page:hover {
   background: #E5E8EB;
   transform: translateY(-2px);
  }
  .button-row {
   display: flex;
   gap: 12px;
   margin-top: 24px;
  }
  .btn-generate {
   flex: 1;
   background: var(--primary);
   color: white;
   padding: 20px;
   font-size: 16px;
  }
  .btn-generate:hover {
   background: var(--primary-dark);
   transform: translateY(-2px);
   box-shadow: 0 8px 16px rgba(0, 100, 255, 0.2);
  }
  .btn-download {
   flex: 1;
   background: #333D4B;
   color: white;
   padding: 20px;
   font-size: 16px;
  }
  .btn-download:hover {
   background: #191F28;
   transform: translateY(-2px);
   box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
  .project-actions {
   display: grid;
   grid-template-columns: 1fr 1fr;
   gap: 12px;
   margin-top: 12px;
  }
  .btn-project {
   background: white;
   color: #4E5968;
   border: 1px solid #E5E8EB;
   font-size: 14px;
   padding: 16px;
   font-weight: 600;
  }
  .btn-project:hover {
   background: #F9FAFB;
   border-color: var(--primary);
   color: var(--primary);
  }
  /* 백업 미완료 시 버튼 강조 */
  @keyframes pulse-border {
   0%,
   100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
   }
   50% {
    box-shadow: 0 0 0 6px rgba(239, 68, 68, 0);
   }
  }
  .btn-unsaved {
   background: #FEF2F2 !important;
   color: #DC2626 !important;
   border-color: #FCA5A5 !important;
   animation: pulse-border 1.8s ease-in-out infinite;
  }
  .btn-unsaved:hover {
   background: #FEE2E2 !important;
   border-color: #DC2626 !important;
  }
  .btn-remove {
   width: 32px;
   height: 32px;
   padding: 0;
   background: #d8e9ff;
   color: #0064FF;
   border-radius: 50%;
  }
  .btn-remove:hover {
   background: #d8e9ff;
   transform: scale(1.1) rotate(90deg);
  }
  .btn-copy {
   width: 32px;
   height: 32px;
   padding: 0;
   background: #F2F4F6;
   color: #4E5968;
   border-radius: 50%;
  }
  .btn-copy:hover {
   background: #E5E8EB;
   color: #191F28;
   transform: scale(1.1);
  }
  .preview-card {
   position: sticky;
   top: 24px;
   display: flex;
   flex-direction: column;
   gap: 16px;
  }
  .preview-container {
   background: #E5E8EB;
   border-radius: var(--radius-lg);
   padding: 24px;
   min-height: 700px;
   display: flex;
   flex-direction: column;
   align-items: center;
   gap: 20px;
   overflow-y: auto;
   max-height: calc(100vh - 60px);
   box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.05);
  }
  .preview-container img {
   width: 100%;
   border-radius: 12px;
   box-shadow: var(--shadow-lg);
   cursor: pointer;
   transition: transform 0.3s ease;
  }
  .preview-container img:hover {
   transform: scale(1.02);
  }
  .placeholder-text {
   color: #9ca3af;
   font-weight: 600;
   margin-top: 250px;
   text-align: center;
  }
  .file-input-wrapper {
   background: white;
   padding: 24px;
   border-radius: var(--radius-md);
   border: 2px dashed #D1D5DB;
   text-align: center;
   transition: all 0.25s ease;
   cursor: pointer;
  }
  .file-input-wrapper:hover {
   border-color: var(--primary);
   background: var(--primary-light);
  }
  .file-label {
   cursor: pointer;
   font-weight: 700;
   color: #4b5563;
   display: flex;
   flex-direction: row;
   gap: 12px;
   align-items: center;
   justify-content: center;
   font-size: 14px;
  }
  .file-label::before {
   content: '📤';
   font-size: 20px;
  }
  .file-attached {
   border-color: var(--primary);
   border-style: solid;
   background: #F0F7FF !important;
  }
  #bgInput {
   display: none;
  }
  .sortable-ghost {
   opacity: 0.4;
   background: var(--primary-light);
  }
  .sortable-chosen {
   box-shadow: var(--shadow-md);
  }
  .sortable-drag {
   opacity: 0;
  }
  .color-group {
   display: flex;
   gap: 6px;
   align-items: center;
  }
  .color-swatch-wrapper {
   position: relative;
   width: 38px;
   height: 38px;
  }
  .color-swatch {
   width: 100%;
   height: 100%;
   border-radius: 10px;
   border: 2px solid white;
   box-shadow: 0 0 0 1px #e5e7eb;
   cursor: pointer;
   padding: 0;
  }
  .color-picker-hidden {
   position: absolute;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   opacity: 0;
   cursor: pointer;
  }
  .input-hex {
   width: 95px !important;
   text-align: center;
   padding: 10px !important;
   font-family: monospace !important;
   font-size: 14px !important;
  }
  /* 가로 배치 레이아웃 스타일 */
  .form-row-group {
   display: flex;
   gap: 16px;
   margin-bottom: 12px;
  }
  .form-row-group .form-group-item {
   flex: 1;
  }
  .label-with-tip {
   display: flex;
   align-items: center;
   gap: 8px;
   margin-bottom: 8px;
  }
  .label-text {
   font-size: 14px;
   font-weight: 800;
   color: #4E5968;
  }
  .label-tip {
   font-size: 11px;
   color: #0064FF;
   background: #d8e9ff;
   padding: 3px 10px;
   border-radius: 6px;
   font-weight: 600;
   border: 1px solid #a2caff;
  }
  @media (max-width: 768px) {
   .form-row-group {
    flex-direction: column;
    gap: 12px;
   }
  }
  .undo-snackbar {
   position: fixed;
   bottom: 32px;
   left: 50%;
   transform: translateX(-50%);
   background: var(--text-main);
   color: white;
   border-radius: var(--radius-sm);
   padding: 14px 20px;
   display: flex;
   align-items: center;
   gap: 16px;
   box-shadow: var(--shadow-lg);
   z-index: 9999;
   font-size: 14px;
   font-weight: 600;
   white-space: nowrap;
   animation: snackbarIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes snackbarIn {
   from { opacity: 0; transform: translateX(-50%) translateY(16px); }
   to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  .undo-btn {
   background: var(--primary);
   color: white;
   border: none;
   border-radius: 6px;
   padding: 6px 14px;
   font-weight: 700;
   cursor: pointer;
   font-size: 13px;
  }
  .undo-btn:hover {
   background: var(--primary-dark);
   transform: none;
  }
  /* 탭 컨테이너 */
  #bannerTabs {
   display: flex;
   flex-direction: row;
   align-items: center;
   gap: 6px;
   overflow-x: auto;
   overflow-y: visible;
   min-width: 0;
   padding-bottom: 4px;
   margin-bottom: 12px;
   scrollbar-width: none;
   -webkit-overflow-scrolling: touch;
   cursor: grab;
   touch-action: pan-y;
   user-select: none;
  }
  #bannerTabs::-webkit-scrollbar { display: none; }
  #bannerTabs.is-dragging { cursor: grabbing; }
  #bannerTabs.is-dragging .banner-tab { pointer-events: none; }
  .banner-tab {
   display: flex;
   flex-direction: row;
   align-items: center;
   gap: 6px;
   padding: 7px 12px;
   border-radius: var(--radius-sm);
   font-size: 13px;
   font-weight: 600;
   cursor: pointer;
   background: var(--accent);
   color: var(--text-muted);
   border: 1px solid var(--glass-border);
   white-space: nowrap;
   flex-shrink: 0;
   transition: all 0.15s ease;
  }
  .banner-tab:hover {
   background: var(--primary-light);
   color: var(--primary);
   border-color: var(--primary);
   transform: none;
  }
  .banner-tab.tab-active {
   background: var(--primary);
   color: white;
   border-color: var(--primary);
  }
  .banner-tab.tab-active:hover {
   background: var(--primary-dark);
   transform: none;
  }
  .tab-badge {
   background: rgba(255, 255, 255, 0.25);
   color: inherit;
   border-radius: 4px;
   padding: 1px 6px;
   font-size: 11px;
   font-weight: 800;
  }
  .tab-close {
   width: 16px;
   height: 16px;
   min-width: 16px;
   padding: 0;
   background: transparent;
   border: none;
   color: inherit;
   opacity: 0;
   cursor: pointer;
   display: flex;
   align-items: center;
   justify-content: center;
   border-radius: 3px;
   transition: opacity 0.15s ease;
  }
  .banner-tab:hover .tab-close { opacity: 1; }
  .banner-tab.tab-active .tab-close { opacity: 0.6; }
  .banner-tab.tab-active:hover .tab-close { opacity: 1; }
  .tab-close:hover {
   background: rgba(0, 0, 0, 0.15);
   transform: none;
  }
  .tab-add-btn {
   flex-shrink: 0;
   margin-left: auto;
   padding: 7px 14px;
   border-radius: var(--radius-sm);
   background: var(--primary-light);
   color: var(--primary);
   border: 1px dashed var(--primary);
   font-size: 13px;
   font-weight: 700;
   cursor: pointer;
   white-space: nowrap;
   transition: all 0.15s ease;
  }
  .tab-add-btn:hover {
   background: #D8E9FF;
   transform: none;
  }
  .input-card {
   min-width: 0;
  }
`
`javascript
let generatedImagesUrls = [];
  let cachedBgImg = null;
  let isBackedUp = true; // 최초 실행 시는 구실 데이터를 수정하지 않았으리건데, 실제 항목 입력 후 false가 됨
  function markUnsaved() {
   if (isBackedUp) {
    isBackedUp = false;
    const btn = document.getElementById('saveProjectBtn');
    if (btn) {
     btn.classList.add('btn-unsaved');
     btn.title = '백업되지 않은 변경 사항이 있습니다';
    }
   }
  }
  function markSaved() {
   isBackedUp = true;
   const btn = document.getElementById('saveProjectBtn');
   if (btn) {
    btn.classList.remove('btn-unsaved');
    btn.title = '';
   }
  }
  // 공통 드래그 핸들 SVG
  const DRAG_HANDLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>`;
  // 공통 닫기(X) 버튼 SVG
  const CLOSE_SVG_16 = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
  const CLOSE_SVG_14 = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
  function saveProject() {
   const items = [];
   const container = document.getElementById('itemsContainer');
   Array.from(container.children).forEach(child => {
    if (child.classList.contains('item-row')) {
     items.push({
      type: 'item',
      itemName: child.querySelector('.item-name').value,
      unit: child.querySelector('.item-unit').value,
      price: child.querySelector('.item-price').value
     });
    } else if (child.classList.contains('section-title-wrapper')) {
     items.push({
      type: 'sectionTitle',
      value: child.querySelector('.section-title-input').value
     });
    }
   });
   const data = {
    topTitle: document.getElementById('topTitle').value,
    topDate: document.getElementById('topDate').value,
    botText: document.getElementById('botText').value,
    themeColor: document.getElementById('themeHex').value,
    bgImage: cachedBgImg ? cachedBgImg.src : null,
    items: items
   };
   const topTitle = document.getElementById('topTitle').value.replace(/[\\/:*?"<>|]/g, "_") || "이벤트";
   const now = new Date();
   const dateStr = now.getFullYear().toString() + (now.getMonth() + 1).toString().padStart(2, '0') + now.getDate().toString().padStart(2, '0');
   const timeStr = now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0') + now.getSeconds().toString().padStart(2, '0');
   const blob = new Blob([JSON.stringify(data)], { type: "application/json;charset=utf-8" });
   saveAs(blob, `${topTitle}_백업_${dateStr}_${timeStr}.json`);
   markSaved();
  }
  function loadProject(event) {
   const file = event.target.files[0];
   if (!file) return;
   const reader = new FileReader();
   reader.onload = function (e) {
    try {
     const data = JSON.parse(e.target.result);
     if (data.topTitle) {
      document.getElementById('topTitle').value = typeof data.topTitle === 'string' ? data.topTitle : data.topTitle.value;
     }
     if (data.topDate) {
      document.getElementById('topDate').value = typeof data.topDate === 'string' ? data.topDate : data.topDate.value;
     }
     if (data.botText) {
      document.getElementById('botText').value = typeof data.botText === 'string' ? data.botText : data.botText.value;
     }
     if (data.themeColor) updateColorSync('theme', data.themeColor);
     else if (data.topTitle && data.topTitle.color) updateColorSync('theme', data.topTitle.color);
     if (data.items) {
      const container = document.getElementById('itemsContainer');
      container.innerHTML = '';
      data.items.forEach(item => {
       if (item.type === 'item') {
        addItemRow(item.itemName, item.unit, item.price);
       } else if (item.type === 'sectionTitle') {
        addSectionTitle(item.value);
       }
      });
      renderTabs();
      switchTab(0);
     }
     if (data.bgImage) {
      const img = new Image();
      img.src = data.bgImage;
      img.onload = () => {
       cachedBgImg = img;
       const fileLabel = document.getElementById('fileLabel');
       const dropZone = document.getElementById('dropZone');
       fileLabel.textContent = "백업에서 불러온 배경 이미지";
       dropZone.classList.add('file-attached');
       generateImages();
      };
     } else if (cachedBgImg) {
      generateImages();
     } else {
      alert('내용을 불러왔습니다. 배경 이미지를 선택하시면 자동으로 이미지가 생성됩니다!');
     }
     markSaved(); // 백업 불러오기 완료 시에도 저장 상태로 표시
    } catch (err) {
     alert('잘못된 백업 파일입니다.');
    }
   };
   reader.readAsText(file);
   event.target.value = '';
  }
  let lastDeletedEl = null;
  let activeBannerIndex = 0;
  let lastDeletedBannerIndex = -1;
  function getBannerGroups() {
   const container = document.getElementById('itemsContainer');
   const groups = [];
   let current = null;
   Array.from(container.children).forEach(child => {
    if (child === lastDeletedEl) return;
    if (child.classList.contains('section-title-wrapper')) {
     current = { titleEl: child, itemEls: [] };
     groups.push(current);
    } else if (child.classList.contains('item-row') && current) {
     current.itemEls.push(child);
    }
   });
   return groups;
  }
  function renderTabs() {
   const tabsEl = document.getElementById('bannerTabs');
   if (!tabsEl) return;
   const groups = getBannerGroups();
   tabsEl.innerHTML = '';
   groups.forEach((g, i) => {
    const tab = document.createElement('button');
    tab.className = 'banner-tab' + (i === activeBannerIndex ? ' tab-active' : '');
    const title = (g.titleEl.querySelector('.section-title-input').value || '제목 없음').slice(0, 10);
    tab.innerHTML = `<span class="tab-badge">${i + 1}</span><span class="tab-label">${title}</span>`;
    if (groups.length > 1) {
     const closeBtn = document.createElement('button');
     closeBtn.className = 'tab-close';
     closeBtn.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
     closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!tabHasDragged) deleteSectionTitle(g.titleEl.querySelector('.btn-remove'));
     });
     tab.appendChild(closeBtn);
    }
    tab.addEventListener('click', () => { if (!tabHasDragged) switchTab(i); });
    tabsEl.appendChild(tab);
   });
   const addBtn = document.createElement('button');
   addBtn.className = 'tab-add-btn';
   addBtn.textContent = '+ 페이지 추가';
   addBtn.addEventListener('click', () => addSectionTitle('', true));
   tabsEl.appendChild(addBtn);
   initTabDragScroll();
  }
  function switchTab(index) {
   const groups = getBannerGroups();
   if (groups.length === 0) return;
   activeBannerIndex = Math.max(0, Math.min(index, groups.length - 1));
   const container = document.getElementById('itemsContainer');
   // 먼저 모든 visible 요소 숨김
   Array.from(container.children).forEach(child => {
    child.style.display = 'none';
   });
   // 활성 배너만 표시
   groups.forEach(group => group.titleEl.classList.remove('active-banner'));
   const g = groups[activeBannerIndex];
   if (g) {
    g.titleEl.classList.add('active-banner');
    g.titleEl.dataset.pageLabel = `PAGE ${activeBannerIndex + 1}`;
    g.titleEl.style.display = '';
    g.itemEls.forEach(el => { el.style.display = ''; });
   }
   renderTabs();
  }
  let tabHasDragged = false;
  function initTabDragScroll() {
   const el = document.getElementById('bannerTabs');
   if (!el || el._tabDragInitialized) return;
   el._tabDragInitialized = true;
   let tabDragDown = false;
   let tabStartX = 0;
   let tabScrollLeft = 0;
   el.addEventListener('pointerdown', (e) => {
    tabDragDown = true;
    tabStartX = e.clientX;
    tabScrollLeft = el.scrollLeft;
    tabHasDragged = false;
    el.setPointerCapture(e.pointerId);
   });
   el.addEventListener('pointermove', (e) => {
    if (!tabDragDown) return;
    const walk = (e.clientX - tabStartX) * 1.5;
    if (Math.abs(walk) > 4) {
     tabHasDragged = true;
     el.classList.add('is-dragging');
    }
    el.scrollLeft = tabScrollLeft - walk;
   });
   el.addEventListener('pointerup', (e) => {
    tabDragDown = false;
    el.classList.remove('is-dragging');
    el.releasePointerCapture(e.pointerId);
   });
   el.addEventListener('pointercancel', (e) => {
    tabDragDown = false;
    el.classList.remove('is-dragging');
    el.releasePointerCapture(e.pointerId);
   });
  }
  function deleteSectionTitle(btn) {
   const wrapper = btn.closest('.section-title-wrapper');
   const groups = getBannerGroups();
   const deletedIndex = groups.findIndex(g => g.titleEl === wrapper);
   lastDeletedBannerIndex = deletedIndex;
   wrapper.style.display = 'none';
   // 삭제된 항목들도 숨김
   if (deletedIndex >= 0) {
    groups[deletedIndex].itemEls.forEach(el => { el.style.display = 'none'; });
   }
   lastDeletedEl = wrapper;
   const newGroups = getBannerGroups();
   if (newGroups.length > 0) {
    const newIndex = deletedIndex >= newGroups.length ? newGroups.length - 1 : deletedIndex;
    switchTab(newIndex);
   } else {
    renderTabs();
   }
   debouncedGenerateImages();
   showUndoSnackbar();
  }
  function showUndoSnackbar() {
   const existing = document.querySelector('.undo-snackbar');
   if (existing) existing.remove();
   const snackbar = document.createElement('div');
   snackbar.className = 'undo-snackbar';
   snackbar.innerHTML = `
    <span>페이지가 삭제되었습니다.</span>
    <button class="undo-btn" onclick="undoDelete(this)">되돌리기</button>
   `;
   document.body.appendChild(snackbar);
   const timer = setTimeout(() => {
    if (lastDeletedEl) {
     lastDeletedEl.remove();
     lastDeletedEl = null;
    }
    snackbar.remove();
    const g = getBannerGroups();
    if (g.length > 0) switchTab(Math.min(activeBannerIndex, g.length - 1));
    else renderTabs();
   }, 5000);
   snackbar._timer = timer;
  }
  function undoDelete(btn) {
   const snackbar = btn.closest('.undo-snackbar');
   clearTimeout(snackbar._timer);
   if (lastDeletedEl) {
    lastDeletedEl.style.display = '';
    // 해당 배너의 item-row들도 복원 (잠시 숨겨진 것들)
    let next = lastDeletedEl.nextElementSibling;
    while (next && next.classList.contains('item-row')) {
     next.style.display = '';
     next = next.nextElementSibling;
    }
    lastDeletedEl = null;
   }
   snackbar.remove();
   const g = getBannerGroups();
   switchTab(Math.min(lastDeletedBannerIndex >= 0 ? lastDeletedBannerIndex : activeBannerIndex, g.length - 1));
   debouncedGenerateImages();
  }
  function addSectionTitle(titleValue = "", withTemplate = false) {
   const container = document.getElementById('itemsContainer');
   const wrapper = document.createElement('div');
   wrapper.className = 'section-title-wrapper';
   wrapper.innerHTML = `
        <div class="drag-handle">${DRAG_HANDLE_SVG}</div>
        <label style="font-size: 16px; color: var(--text-main); font-weight: 800;">제목</label>
        <textarea class="btn-input section-title-input" placeholder="중앙 배너 제목 입력 (예: 보톡스 이벤트)">${titleValue}</textarea>
        <button class="btn-remove" onclick="deleteSectionTitle(this)" title="삭제">${CLOSE_SVG_16}</button>
      `;
   container.appendChild(wrapper);
   // DOM 삽입 직후 초기 높이 설정
   const stInput = wrapper.querySelector('.section-title-input');
   stInput.style.height = 'auto';
   stInput.style.height = stInput.scrollHeight + 'px';
   // 탭 실시간 동기화
   stInput.addEventListener('input', () => renderTabs());
   // 실시간 갱신 리스너 추가
   stInput.addEventListener('input', debouncedGenerateImages);
   renderTabs();
   switchTab(getBannerGroups().length - 1);
   const tabsEl = document.getElementById('bannerTabs');
   if (tabsEl) {
    tabsEl.scrollTo({ left: tabsEl.scrollWidth, behavior: 'smooth' });
   }
   if (withTemplate) {
    addItemRow(`<붓기삭제 종아리 슬림패키지>\n종아리 보톡스 200u + 슬림주사 100cc\n+지방타파레이저 1000샷`, '', '19만9천');
    addItemRow('보톡스', '', '9만');
    addItemRow('필러', '1회', '4만');
    addItemRow('필러', '3회', '11만');
   } else {
    debouncedGenerateImages();
   }
  }
  function createItemRow(itemName = "", unit = "", price = "") {
   const row = document.createElement('div');
   row.className = 'item-row';
   row.innerHTML = `
        <div class="drag-handle">${DRAG_HANDLE_SVG}</div>
        <textarea class="btn-input item-name" placeholder="항목명 (예: <리쥬란 2cc>)">${itemName}</textarea>
        <input type="text" class="btn-input btn-input-unit item-unit" placeholder="단위" value="${unit}">
        <input type="text" class="btn-input btn-input-price item-price" placeholder="금액" value="${price}">
        <div class="row-actions">
          <button class="btn-copy" onclick="duplicateItemRow(this)" title="복제">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          </button>
          <button class="btn-remove" onclick="this.parentElement.parentElement.remove(); debouncedGenerateImages();" title="삭제">${CLOSE_SVG_14}</button>
        </div>
      `;
   // 실시간 갱신 리스너 추가
   row.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', debouncedGenerateImages);
   });
   return row;
  }
  function addItemRow(itemName = "", unit = "", price = "") {
   const container = document.getElementById('itemsContainer');
   const row = createItemRow(itemName, unit, price);
   const groups = getBannerGroups();
   const activeGroup = groups[activeBannerIndex];
   if (activeGroup) {
    // 활성 배너의 마지막 item-row 뒤에 삽입
    const lastItem = activeGroup.itemEls[activeGroup.itemEls.length - 1];
    if (lastItem) {
     lastItem.after(row);
    } else {
     activeGroup.titleEl.after(row);
    }
   } else {
    container.appendChild(row);
   }
   // DOM 삽입 직후 초기 높이 설정
   const nameEl = row.querySelector('.item-name');
   nameEl.style.height = 'auto';
   nameEl.style.height = nameEl.scrollHeight + 'px';
   switchTab(activeBannerIndex);
   debouncedGenerateImages();
  }
  function duplicateItemRow(btn) {
   const currentRow = btn.closest('.item-row');
   const itemName = currentRow.querySelector('.item-name').value;
   const unit = currentRow.querySelector('.item-unit').value;
   const price = currentRow.querySelector('.item-price').value;
   const newRow = createItemRow(itemName, unit, price);
   currentRow.after(newRow);
   // DOM 삽입 직후 초기 높이 설정
   const nameEl = newRow.querySelector('.item-name');
   nameEl.style.height = 'auto';
   nameEl.style.height = nameEl.scrollHeight + 'px';
   debouncedGenerateImages();
  }
  const CONFIG = {
   width: 1000,
   height: 1000,
   fonts: {
    main: "'Pretendard', 'Noto Sans JP', 'Noto Sans SC', 'Noto Sans Thai', sans-serif"
   }
  };
  document.getElementById('bgInput').addEventListener('change', function (e) {
   const fileLabel = document.getElementById('fileLabel');
   const dropZone = document.getElementById('dropZone');
   if (e.target.files && e.target.files.length > 0) {
    fileLabel.textContent = e.target.files[0].name;
    dropZone.classList.add('file-attached');
    const reader = new FileReader();
    reader.onload = (event) => {
     const img = new Image();
     img.src = event.target.result;
     img.onload = () => {
      cachedBgImg = img;
      debouncedGenerateImages();
     };
    };
    reader.readAsDataURL(e.target.files[0]);
   } else {
    fileLabel.textContent = '배경 이미지 파일을 선택하세요';
    dropZone.classList.remove('file-attached');
    cachedBgImg = null;
    debouncedGenerateImages();
   }
  });
  document.getElementById('dropZone').addEventListener('click', function () {
   document.getElementById('bgInput').click();
  });
  document.getElementById('dropZone').addEventListener('dragover', function (e) {
   e.preventDefault();
   this.classList.add('file-attached');
  });
  document.getElementById('dropZone').addEventListener('dragleave', function () {
   if (!cachedBgImg) this.classList.remove('file-attached');
  });
  document.getElementById('dropZone').addEventListener('drop', function (e) {
   e.preventDefault();
   const file = e.dataTransfer.files[0];
   if (!file || !file.type.startsWith('image/')) return;
   const fileLabel = document.getElementById('fileLabel');
   fileLabel.textContent = file.name;
   this.classList.add('file-attached');
   const reader = new FileReader();
   reader.onload = (event) => {
    const img = new Image();
    img.src = event.target.result;
    img.onload = () => {
     cachedBgImg = img;
     debouncedGenerateImages();
    };
   };
   reader.readAsDataURL(file);
  });
  async function generateImages() {
   if (!cachedBgImg) {
    return;
   }
   const container = document.getElementById('itemsContainer');
   const pages = [];
   let currentPage = { items: [], title: "" };
   container.childNodes.forEach(child => {
    if (child.nodeType !== 1) return;
    if (child.classList.contains('section-title-wrapper')) {
     if (currentPage.items.length > 0) {
      pages.push(currentPage);
      currentPage = { items: [], title: "" };
     }
     currentPage.title = child.querySelector('.section-title-input').value.trim();
    } else if (child.classList.contains('item-row')) {
     const itemName = child.querySelector('.item-name').value.trim();
     const unit = child.querySelector('.item-unit').value.trim();
     const price = child.querySelector('.item-price').value.trim();
     if (itemName || unit || price) {
      currentPage.items.push({ itemName, unit, price });
     }
    }
   });
   if (currentPage.items.length > 0) {
    pages.push(currentPage);
   }
   if (pages.length === 0) {
    alert('입력된 항목 데이터가 없습니다.');
    return;
   }
   const fontsToLoad = [
    '27px "GmarketSansMedium"',
    '23px "GmarketSansMedium"',
    '49px "GmarketSansBold"',
    '27px "Pretendard"',
    '700 36px "Pretendard"',
    '800 54px "Pretendard"',
    '27px "Noto Sans JP"',
    '27px "Noto Sans SC"',
    '27px "Noto Sans Thai"'
   ];
   try {
    await Promise.all(fontsToLoad.map(font => document.fonts.load(font)));
   } catch (e) {
    console.warn('일부 폰트를 로드하는 데 실패했습니다:', e);
   }
   await document.fonts.ready;
   const previewContainer = document.getElementById('previewContainer');
   previewContainer.innerHTML = '';
   generatedImagesUrls = [];
   const botText = document.getElementById('botText').value.trim();
   pages.forEach((page, index) => {
    const groups = convertToGroups(page.items);
    if (groups.length > 0) {
     const title = page.title || "";
     const dataUrl = drawSingleCanvas(cachedBgImg, groups, title, botText);
     generatedImagesUrls.push(dataUrl);
     const imgEl = document.createElement('img');
     imgEl.src = dataUrl;
     imgEl.dataset.pageIndex = index;
     imgEl.title = "클릭하면 해당 페이지로 이동";
     imgEl.addEventListener('click', function() {
      const pageIdx = parseInt(this.dataset.pageIndex);
      switchTab(pageIdx);
      const grps = getBannerGroups();
      if (grps[pageIdx]) {
       grps[pageIdx].titleEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
     });
     previewContainer.appendChild(imgEl);
    }
   });
   document.getElementById('downloadBtn').style.display = 'block';
  }
  function convertToGroups(items) {
   const groups = [];
   let currentGroup = null;
   items.forEach(it => {
    if (!currentGroup || currentGroup.item !== it.itemName) {
     currentGroup = { item: it.itemName, rows: [] };
     groups.push(currentGroup);
    }
    currentGroup.rows.push({ unit: it.unit, price: it.price });
   });
   return groups;
  }
  function downloadAllImages() {
   if (generatedImagesUrls.length === 0) return;
   if (!isBackedUp) {
    const ok = confirm("⚠️ 아직 백업되지 않은 변경 사항이 있습니다.\n\n[확인] 다운로드를 진행합니다.\n[취소] → [파일 백업] 버튼을 눈러 데이터를 먼저 저장하세요.");
    if (!ok) return;
   }
   const topTitle = document.getElementById('topTitle').value.replace(/[\\/:*?"<>|]/g, "_") || "이벤트";
   const now = new Date();
   const dateStr = now.getFullYear().toString() + (now.getMonth() + 1).toString().padStart(2, '0') + now.getDate().toString().padStart(2, '0');
   const timeStr = now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0') + now.getSeconds().toString().padStart(2, '0');
   if (generatedImagesUrls.length === 1) {
    const link = document.createElement('a');
    link.download = `${topTitle}_${dateStr}_${timeStr}.jpg`;
    link.href = generatedImagesUrls[0];
    link.click();
   } else {
    const zip = new JSZip();
    generatedImagesUrls.forEach((dataUrl, index) => {
     const base64Data = dataUrl.replace(/^data:image\/(png|jpeg);base64,/, "");
     zip.file(`${topTitle}_${index + 1}.jpg`, base64Data, { base64: true });
    });
    zip.generateAsync({ type: "blob" }).then(function (content) {
     saveAs(content, `${topTitle}_${dateStr}_${timeStr}.zip`);
    });
   }
  }
  function formatPrice(numStr) {
   if (!numStr) return "";
   const clean = numStr.replace(/,/g, '');
   if (!isNaN(clean) && clean.trim() !== "") {
    return Number(clean).toLocaleString('ko-KR');
   }
   return numStr;
  }
  // 가격 문자열을 숫자/텍스트 토큰으로 파싱하여 메타 정보 반환
  function getPriceTokenMeta(ctx, priceStr) {
   const tokens = priceStr.match(/[\d.,]+|[^\d.,]+/g) || [];
   let totalWidth = 0;
   const tokenMeta = tokens.map(token => {
    const isNumber = /^[\d.,]+$/.test(token);
    const text = isNumber ? formatPrice(token) : token;
    const font = isNumber ? `800 54px ${CONFIG.fonts.main}` : `700 34px ${CONFIG.fonts.main}`;
    const color = isNumber ? null : 'black'; // null = themeColor
    const letterSpacing = isNumber ? "-3px" : "-1px";
    ctx.font = font;
    ctx.letterSpacing = letterSpacing;
    let width = ctx.measureText(text).width;
    if (isNumber) width += 3;
    totalWidth += width;
    return { text, font, color, letterSpacing, width, isNumber };
   });
   return { tokenMeta, totalWidth };
  }
  function wrapTextChar(ctx, text, maxWidth) {
   const resultLines = [];
   const paragraphs = text.split('\n');
   paragraphs.forEach(paragraph => {
    let currentLine = '';
    for (let i = 0; i < paragraph.length; i++) {
     let char = paragraph[i];
     if (char === '<' || char === '>') {
      currentLine += char;
      continue;
     }
     let testLine = currentLine + char;
     let cleanTestLine = testLine.replace(/[<>]/g, '');
     if (ctx.measureText(cleanTestLine).width > maxWidth && i > 0) {
      resultLines.push(currentLine);
      currentLine = char;
     } else {
      currentLine = testLine;
     }
    }
    if (currentLine) {
     resultLines.push(currentLine);
    }
   });
   return resultLines;
  }
  function roundRect(ctx, x, y, width, height, radius) {
   ctx.beginPath(); ctx.moveTo(x + radius, y);
   ctx.lineTo(x + width - radius, y); ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
   ctx.lineTo(x + width, y + height - radius); ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
   ctx.lineTo(x + radius, y + height); ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
   ctx.lineTo(x, y + radius); ctx.quadraticCurveTo(x, y, x + radius, y);
   ctx.closePath(); ctx.fill();
  }
  function drawSingleCanvas(bgImg, groups, title, botText) {
   const canvas = document.createElement('canvas');
   const ctx = canvas.getContext('2d');
   canvas.width = CONFIG.width;
   canvas.height = CONFIG.height;
   const startX = 105, endX = 895;
   const unitPriceGap = 25;
   const groupRowGap = 50;
   const textLineGap = 40;
   const whitePadding = 15;
   const itemHalfHeight = 24;
   let totalListHeight = 0;
   ctx.font = `700 27px ${CONFIG.fonts.main}`;
   ctx.letterSpacing = "-1px";
   groups.forEach((group, index) => {
    group.localMaxPriceWidth = 0;
    group.rows.forEach(r => {
     const { totalWidth } = getPriceTokenMeta(ctx, r.price);
     if (totalWidth > group.localMaxPriceWidth) group.localMaxPriceWidth = totalWidth;
    });
    group.maxUnitW = 0;
    ctx.font = `800 27px ${CONFIG.fonts.main}`;
    group.rows.forEach(r => {
     if (r.unit) {
      const w = ctx.measureText(r.unit).width + 30;
      if (w > group.maxUnitW) group.maxUnitW = w;
     }
    });
    const groupUnitRightBoundary = endX - group.localMaxPriceWidth - unitPriceGap;
    let currentMaxTextWidth;
    if (group.maxUnitW > 0) {
     currentMaxTextWidth = (groupUnitRightBoundary - group.maxUnitW) - startX - 15;
    } else {
     currentMaxTextWidth = groupUnitRightBoundary - startX - 5;
    }
    group.lines = wrapTextChar(ctx, group.item, currentMaxTextWidth);
    let priceSpan = (group.rows.length - 1) * groupRowGap;
    let textSpan = (group.lines.length - 1) * textLineGap;
    group.heightSpan = Math.max(priceSpan, textSpan);
    totalListHeight += group.heightSpan;
    if (index < groups.length - 1) totalListHeight += 65;
   });
   ctx.font = `49px 'GmarketSansBold', 'Noto Sans JP', 'Noto Sans SC', 'Noto Sans Thai', sans-serif`;
   ctx.letterSpacing = "-2px";
   const titleLines = wrapTextChar(ctx, title, 800);
   const titleLineHeight = 58;
   const bannerHeight = Math.max(95, titleLines.length * titleLineHeight + 30);
   const whiteBoxHeight = whitePadding + itemHalfHeight + totalListHeight + itemHalfHeight + whitePadding;
   const totalEventBoxHeight = bannerHeight + whiteBoxHeight;
   const eventBoxStartY = 500 - (totalEventBoxHeight / 2);
   const imgRatio = bgImg.width / bgImg.height;
   ctx.drawImage(bgImg, 0, (1000 - (1000 / imgRatio)) / 2, 1000, 1000 / imgRatio);
   let dateBaselineY = 115;
   if (eventBoxStartY - 25 < dateBaselineY) {
    dateBaselineY = eventBoxStartY - 25;
   }
   let titleBaselineY = dateBaselineY - 35;
   ctx.textBaseline = "alphabetic";
   ctx.textAlign = "center";
   const themeColor = document.getElementById('themeHex').value;
   // 상단 제목 / 이벤트 기간 공통 스타일
   ctx.fillStyle = themeColor;
   ctx.font = `27px 'GmarketSansMedium', 'Noto Sans JP', 'Noto Sans SC', 'Noto Sans Thai', sans-serif`;
   ctx.letterSpacing = "-1px";
   ctx.fillText(document.getElementById('topTitle').value, 500, titleBaselineY);
   ctx.fillText(document.getElementById('topDate').value, 500, dateBaselineY);
   ctx.fillStyle = themeColor; // 2. 제목 박스 색상
   ctx.fillRect(60, eventBoxStartY, 880, bannerHeight);
   ctx.fillStyle = "white"; // 제목 텍스트 색상 (고정)
   ctx.font = `49px 'GmarketSansBold', 'Noto Sans JP', 'Noto Sans SC', 'Noto Sans Thai', sans-serif`;
   ctx.letterSpacing = "-2px";
   ctx.textAlign = "center";
   ctx.textBaseline = "middle";
   const titleStartY = eventBoxStartY + (bannerHeight / 2) - ((titleLines.length - 1) * titleLineHeight) / 2;
   titleLines.forEach((line, i) => {
    ctx.fillText(line, 500, titleStartY + (i * titleLineHeight));
   });
   const whiteBoxTop = eventBoxStartY + bannerHeight;
   ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
   ctx.fillRect(60, whiteBoxTop, 880, whiteBoxHeight);
   ctx.strokeStyle = themeColor; ctx.lineWidth = 2; // 3. 흰박스 라인 색상 (테마 색상 통합)
   ctx.strokeRect(60 + 1, whiteBoxTop, 880 - 2, whiteBoxHeight - 1);
   ctx.textBaseline = "middle";
   let currentY = whiteBoxTop + whitePadding + itemHalfHeight;
   groups.forEach((group, index) => {
    const groupCenterY = currentY + group.heightSpan / 2;
    ctx.font = `700 27px ${CONFIG.fonts.main}`;
    ctx.letterSpacing = "-1px";
    ctx.textAlign = "left";
    let textStartY = groupCenterY - ((group.lines.length - 1) * textLineGap) / 2;
    let isHighlightText = false;
    group.lines.forEach((line, i) => {
     let currentX = startX;
     let chunk = "";
     for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '<' || char === '>') {
       if (chunk.length > 0) {
        ctx.fillStyle = isHighlightText ? themeColor : "black"; // 4. 강조 텍스트 색상 & 항목명 텍스트 색상
        ctx.fillText(chunk, currentX, textStartY + (i * textLineGap));
        currentX += ctx.measureText(chunk).width;
        chunk = "";
       }
       isHighlightText = (char === '<');
      } else {
       chunk += char;
      }
     }
     if (chunk.length > 0) {
      ctx.fillStyle = isHighlightText ? themeColor : "black"; // 4. 강조 텍스트 색상 & 항목명 텍스트 색상
      ctx.fillText(chunk, currentX, textStartY + (i * textLineGap));
     }
    });
    let priceStartY = groupCenterY - ((group.rows.length - 1) * groupRowGap) / 2;
    group.rows.forEach((row, rowIndex) => {
     const rowCenterY = priceStartY + (rowIndex * groupRowGap);
     const groupUnitRightBoundary = endX - group.localMaxPriceWidth - unitPriceGap;
     if (row.unit) {
      ctx.font = `800 27px ${CONFIG.fonts.main}`;
      ctx.letterSpacing = "0px";
      const unitW = group.maxUnitW;
      const boxX = groupUnitRightBoundary - unitW;
      ctx.fillStyle = themeColor; // 5. 단위 박스 색상
      roundRect(ctx, boxX, rowCenterY - 24, unitW, 48, 14);
      ctx.textAlign = "center"; ctx.fillStyle = "white"; // 단위 텍스트 색상(고정)
      ctx.fillText(row.unit, boxX + unitW / 2, rowCenterY + 2);
     }
     const { tokenMeta, totalWidth } = getPriceTokenMeta(ctx, row.price);
     // isNumber인 토큰은 themeColor, 아닌 경우 black 적용
     tokenMeta.forEach(m => { if (m.color === null) m.color = themeColor; });
     const baselineY = rowCenterY + 18;
     let currentX = endX - totalWidth;
     ctx.textBaseline = "alphabetic";
     ctx.textAlign = "left";
     tokenMeta.forEach(meta => {
      ctx.font = meta.font;
      ctx.fillStyle = meta.color;
      ctx.letterSpacing = meta.letterSpacing;
      ctx.fillText(meta.text, currentX, baselineY);
      currentX += meta.width;
     });
     ctx.textBaseline = "middle";
    });
    if (index < groups.length - 1) {
     const lineY = currentY + group.heightSpan + 32.5;
     ctx.beginPath(); ctx.moveTo(startX, lineY); ctx.lineTo(endX, lineY);
     ctx.strokeStyle = themeColor; ctx.lineWidth = 1; ctx.stroke(); // 7. 선 색상 (테마 색상 통합)
     currentY = lineY + 32.5;
    }
   });
   const whiteBoxBottom = whiteBoxTop + whiteBoxHeight;
   // 캔버스 하단(975)과 박스 하단+25px 중 더 아래인 위치에 그리되,
   // 캔버스 최대 높이(990)를 초과하지 않도록 제한
   const botTextY = Math.min(Math.max(whiteBoxBottom + 25, 975), canvas.height - 10);
   ctx.textBaseline = "alphabetic";
   ctx.textAlign = "center";
   ctx.fillStyle = themeColor;
   ctx.font = `23px 'GmarketSansMedium', 'Noto Sans JP', 'Noto Sans SC', 'Noto Sans Thai', sans-serif`;
   ctx.letterSpacing = "0px";
   ctx.fillText(botText, 500, botTextY);
   return canvas.toDataURL('image/jpeg', 0.95);
  }
  window.onload = () => {
   // 컬러 연동 초기화
   const hexInput = document.getElementById('themeHex');
   const colorPicker = document.getElementById('themeColor');
   const swatch = document.getElementById('themeSwatch');
   colorPicker.addEventListener('input', (e) => {
    const color = e.target.value.toUpperCase();
    hexInput.value = color;
    swatch.style.backgroundColor = color;
   });
   hexInput.addEventListener('input', (e) => {
    let color = e.target.value;
    if (!color.startsWith('#')) color = '#' + color;
    if (/^#[0-9A-F]{6}$/i.test(color)) {
     colorPicker.value = color;
     swatch.style.backgroundColor = color;
    }
   });
   swatch.addEventListener('click', () => colorPicker.click());
   // 색상 및 텍스트 입력 실시간 갱신
   [hexInput, colorPicker].forEach(input => {
    input.addEventListener('input', debouncedGenerateImages);
   });
   ['topTitle', 'topDate', 'botText'].forEach(elId => {
    document.getElementById(elId).addEventListener('input', debouncedGenerateImages);
   });
   addSectionTitle('굿바이 Spring 4월 이벤트');
   addItemRow(`<붓기삭제 종아리 슬림패키지>
종아리 보톡스 200u + 슬림주사 100cc
+지방타파레이저 1000샷`, '', '19만9천');
   addItemRow('보톡스', '', '9만');
   addItemRow('필러', '1회', '4만');
   addItemRow('필러', '3회', '11만');
   // SortableJS 초기화
   new Sortable(document.getElementById('itemsContainer'), {
    handle: '.drag-handle',
    animation: 150,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    onEnd: () => debouncedGenerateImages()
   });
  };
  // 이벤트 위임: #itemsContainer → textarea 자동 높이 확장
  document.getElementById('itemsContainer').addEventListener('input', function (e) {
   if (e.target.classList.contains('item-name') || e.target.classList.contains('section-title-input')) {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
   }
   if (e.target.classList.contains('section-title-input')) {
    renderTabs();
   }
  });
  // 편집기 → 프리뷰 스크롤 동기화
  document.getElementById('itemsContainer').addEventListener('focusin', function (e) {
   if (e.target.classList.contains('section-title-input') || e.target.classList.contains('item-name')) {
    const groups = getBannerGroups();
    const titleEl = e.target.closest('.section-title-wrapper') || e.target.closest('.item-row')?.previousElementSibling;
    const idx = groups.findIndex(g => g.titleEl === titleEl || g.itemEls.some(el => el.contains(e.target)));
    if (idx < 0) return;
    const imgs = document.querySelectorAll('#previewContainer img');
    if (imgs[idx]) imgs[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
   }
  });
  // 실시간 생성을 위한 디바운스 함수
  let debounceTimer;
  function debouncedGenerateImages() {
   clearTimeout(debounceTimer);
   debounceTimer = setTimeout(() => {
    generateImages();
   }, 300);
   markUnsaved();
  }
  function updateColorSync(prefix, color) {
   const hexInput = document.getElementById(prefix + 'Hex');
   const colorPicker = document.getElementById(prefix + 'Color');
   const swatch = document.getElementById(prefix + 'Swatch');
   hexInput.value = color.toUpperCase();
   colorPicker.value = color;
   swatch.style.backgroundColor = color;
  }
  window.addEventListener('keydown', (e) => {
   if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 's' || e.code === 'KeyS')) {
    e.preventDefault();
    generateImages();
   }
  });
  window.addEventListener('beforeunload', (e) => {
   if (!isBackedUp) {
    e.preventDefault();
    e.returnValue = '';
   }
  });
`
