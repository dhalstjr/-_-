let generatedImagesUrls = [];
let cachedBgImg = null;
let activeBannerIndex = 0;

function getBannerGroups() {
  const container = document.getElementById('itemsContainer');
  const groups = [];
  let current = null;
  Array.from(container.children).forEach(el => {
    if (el.classList.contains('section-title-wrapper')) {
      current = { titleEl: el, itemEls: [] };
      groups.push(current);
    } else if (el.classList.contains('item-row')) {
      if (!current) {
        current = { titleEl: null, itemEls: [] };
        groups.push(current);
      }
      current.itemEls.push(el);
    }
  });
  return groups;
}

function renderTabs() {
  const tabBar = document.getElementById('bannerTabs');
  const groups = getBannerGroups();
  tabBar.innerHTML = '';

  groups.forEach((g, i) => {
    const tab = document.createElement('div');
    tab.className = 'banner-tab' + (i === activeBannerIndex ? ' active' : '');
    const title = g.titleEl
      ? (g.titleEl.querySelector('.section-title-input').value.trim().slice(0, 10) || ('배너 ' + (i + 1)))
      : ('배너 ' + (i + 1));

    const badge = `<span class="tab-badge">${i + 1}</span>`;
    const label = document.createTextNode(title);
    const delBtn = document.createElement('button');
    delBtn.className = 'tab-del';
    delBtn.title = '배너 삭제';
    delBtn.textContent = '×';
    if (groups.length <= 1) delBtn.style.display = 'none';
    delBtn.addEventListener('click', (e) => { e.stopPropagation(); deleteBanner(i); });

    tab.innerHTML = badge;
    tab.appendChild(label);
    tab.appendChild(delBtn);
    tab.addEventListener('click', () => switchTab(i));
    tabBar.appendChild(tab);
  });

  const addBtn = document.createElement('button');
  addBtn.className = 'btn-tab-add';
  addBtn.innerHTML = '+ 배너 추가';
  addBtn.addEventListener('click', () => {
    addSectionTitle();
    addItemRow(`<붓기삭제 종아리 슬림패키지>\n종아리 보톡스 200u + 슬림주사 100cc\n+지방타파레이저 1000샷`, '', '19만9천');
    addItemRow('보톡스', '', '9만');
    addItemRow('필러', '1회', '4만');
    addItemRow('필러', '3회', '11만');
  });
  tabBar.appendChild(addBtn);
}

function switchTab(index) {
  activeBannerIndex = index;
  renderTabs();
  const groups = getBannerGroups();
  groups.forEach((g, i) => {
    const show = (i === activeBannerIndex);
    if (g.titleEl) g.titleEl.style.display = show ? '' : 'none';
    g.itemEls.forEach(el => { el.style.display = show ? '' : 'none'; });
  });
}

function deleteBanner(index) {
  const groups = getBannerGroups();
  if (groups.length <= 1) return;
  const g = groups[index];
  if (g.titleEl) g.titleEl.remove();
  g.itemEls.forEach(el => el.remove());
  activeBannerIndex = Math.min(activeBannerIndex, getBannerGroups().length - 1);
  renderTabs();
  switchTab(activeBannerIndex);
}

function saveProject() {
  const items = [];
  const container = document.getElementById('itemsContainer');
  container.childNodes.forEach(child => {
    if (child.classList) {
      if (child.classList.contains('item-row')) {
        items.push({
          type: 'item',
          itemName: child.querySelector('.item-name').value,
          unit: child.querySelector('.item-unit').value,
          price: child.querySelector('.item-price').value
        });
      } else if (child.classList.contains('page-separator')) {
        items.push({ type: 'separator' });
      } else if (child.classList.contains('section-title-wrapper')) {
        items.push({
          type: 'sectionTitle',
          value: child.querySelector('.section-title-input').value
        });
      }
    }
  });

  const data = {
    topTitle: document.getElementById('topTitle').value,
    topDate: document.getElementById('topDate').value,
    botText: document.getElementById('botText').value,
    bgImage: cachedBgImg ? cachedBgImg.src : null,
    items: items
  };

  const topTitle = document.getElementById('topTitle').value.replace(/[\\/:*?"<>|]/g, "_") || "이벤트";
  const now = new Date();
  const dateStr = now.getFullYear().toString() + (now.getMonth() + 1).toString().padStart(2, '0') + now.getDate().toString().padStart(2, '0');
  const timeStr = now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0') + now.getSeconds().toString().padStart(2, '0');

  const blob = new Blob([JSON.stringify(data)], { type: "application/json;charset=utf-8" });
  saveAs(blob, `${topTitle}_백업_${dateStr}_${timeStr}.json`);
}

function loadProject(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.topTitle !== undefined) document.getElementById('topTitle').value = data.topTitle;
      if (data.topDate !== undefined) document.getElementById('topDate').value = data.topDate;
      if (data.botText !== undefined) document.getElementById('botText').value = data.botText;

      if (data.items) {
        const container = document.getElementById('itemsContainer');
        container.innerHTML = '';
        activeBannerIndex = 0;
        data.items.forEach(item => {
          if (item.type === 'item') {
            // loadProject 시에는 항상 container 끝에 추가하기 위해 직접 append
            const row = document.createElement('div');
            row.className = 'item-row';
            row.innerHTML = `
                <div class="drag-handle"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg></div>
                <textarea class="btn-input item-name" placeholder="항목명 (예: 리쥬란2cc)">${item.itemName}</textarea>
                <input type="text" class="btn-input btn-input-unit item-unit" placeholder="예: 1회, 100cc" value="${item.unit}">
                <input type="text" class="btn-input btn-input-price item-price" placeholder="금액" value="${item.price}">
                <div class="row-actions">
                    <button class="btn-copy" onclick="duplicateItemRow(this)" title="복제"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg></button>
                    <button class="btn-remove" onclick="this.parentElement.parentElement.remove()" title="삭제"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
                </div>`;
            container.appendChild(row);
            initDragAndDrop(row);
            const ta = row.querySelector('.item-name');
            if (ta) { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; }
          } else if (item.type === 'separator') {
            addPageBreak();
          } else if (item.type === 'sectionTitle') {
            const wrapper = document.createElement('div');
            wrapper.className = 'section-title-wrapper';
            wrapper.innerHTML = `
                <div class="drag-handle"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg></div>
                <label style="font-size:16px;color:#000;font-weight:800;">제목</label>
                <textarea class="btn-input section-title-input" placeholder="중앙 배너 제목 입력 (예: 보톡스 이벤트)">${item.value}</textarea>
                <button class="btn-remove" onclick="deleteBanner(getBannerGroups().findIndex(g=>g.titleEl===this.parentElement))" title="삭제"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>`;
            container.appendChild(wrapper);
            initDragAndDrop(wrapper);
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
    } catch (err) {
      alert('잘못된 백업 파일입니다.');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function addSectionTitle(titleValue = "") {
  const container = document.getElementById('itemsContainer');
  const wrapper = document.createElement('div');
  wrapper.className = 'section-title-wrapper';
  const newIndex = getBannerGroups().length; // index AFTER append
  wrapper.innerHTML = `
                <div class="drag-handle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                </div>
                <label style="font-size: 16px; color: #000; font-weight: 800;">제목</label>
                <textarea class="btn-input section-title-input" placeholder="중앙 배너 제목 입력 (예: 보톡스 이벤트)">${titleValue}</textarea>
                <button class="btn-remove" onclick="deleteBanner(getBannerGroups().findIndex(g=>g.titleEl===this.parentElement))" title="삭제">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
            `;
  container.appendChild(wrapper);
  initDragAndDrop(wrapper);
  activeBannerIndex = getBannerGroups().length - 1;
  renderTabs();
  switchTab(activeBannerIndex);
}

function addItemRow(itemName = "", unit = "", price = "") {
  const container = document.getElementById('itemsContainer');
  const row = document.createElement('div');
  row.className = 'item-row';
  row.innerHTML = `
                <div class="drag-handle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                </div>
                <textarea class="btn-input item-name" placeholder="항목명 (예: 리쥬란2cc)">${itemName}</textarea>
                <input type="text" class="btn-input btn-input-unit item-unit" placeholder="예: 1회, 100cc" value="${unit}">
                <input type="text" class="btn-input btn-input-price item-price" placeholder="금액" value="${price}">
                <div class="row-actions">
                    <button class="btn-copy" onclick="duplicateItemRow(this)" title="복제">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    </button>
                    <button class="btn-remove" onclick="this.parentElement.parentElement.remove()" title="삭제">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                </div>
            `;

  // 현재 활성 배너의 마지막 요소 뒤에 삽입
  const groups = getBannerGroups();
  if (groups.length === 0) {
    container.appendChild(row);
  } else {
    const g = groups[activeBannerIndex] || groups[groups.length - 1];
    const lastEl = g.itemEls.length > 0 ? g.itemEls[g.itemEls.length - 1] : g.titleEl;
    if (lastEl) {
      lastEl.after(row);
    } else {
      container.appendChild(row);
    }
  }

  initDragAndDrop(row);
  const nameTa = row.querySelector('.item-name');
  if (nameTa) {
    nameTa.style.height = 'auto';
    nameTa.style.height = nameTa.scrollHeight + 'px';
  }
}

function duplicateItemRow(btn) {
  const currentRow = btn.closest('.item-row');
  const itemName = currentRow.querySelector('.item-name').value;
  const unit = currentRow.querySelector('.item-unit').value;
  const price = currentRow.querySelector('.item-price').value;

  const newRow = document.createElement('div');
  newRow.className = 'item-row';
  newRow.innerHTML = `
                <div class="drag-handle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                </div>
                <textarea class="btn-input item-name" placeholder="항목명 (예: <리쥬란 2cc>)">${itemName}</textarea>
                <input type="text" class="btn-input btn-input-unit item-unit" placeholder="예: 1회, 100cc" value="${unit}">
                <input type="text" class="btn-input btn-input-price item-price" placeholder="금액" value="${price}">
                <div class="row-actions">
                    <button class="btn-copy" onclick="duplicateItemRow(this)" title="복제">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    </button>
                    <button class="btn-remove" onclick="this.parentElement.parentElement.remove()" title="삭제">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                </div>
            `;
  currentRow.after(newRow);
  initDragAndDrop(newRow);
  const nameTa = newRow.querySelector('.item-name');
  if (nameTa) {
    nameTa.style.height = 'auto';
    nameTa.style.height = nameTa.scrollHeight + 'px';
  }
}

let dragSrcEl = null;

function initDragAndDrop(el) {
  const handle = el.querySelector('.drag-handle');
  if (handle) {
    handle.addEventListener('mouseenter', () => { el.draggable = true; });
    handle.addEventListener('mouseleave', () => {
      if (!el.classList.contains('dragging')) el.draggable = false;
    });
  }

  el.addEventListener('dragstart', handleDragStart);
  el.addEventListener('dragover', handleDragOver);
  el.addEventListener('dragleave', handleDragLeave);
  el.addEventListener('drop', handleDrop);
  el.addEventListener('dragend', handleDragEnd);
}

function handleDragStart(e) {
  this.classList.add('dragging');
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', '');
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  this.classList.add('over');
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDragLeave(e) {
  this.classList.remove('over');
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  if (dragSrcEl !== this) {
    const container = document.getElementById('itemsContainer');
    const children = Array.from(container.children);
    const fromIndex = children.indexOf(dragSrcEl);
    const toIndex = children.indexOf(this);

    if (fromIndex < toIndex) {
      this.after(dragSrcEl);
    } else {
      this.before(dragSrcEl);
    }
  }
  return false;
}

function handleDragEnd(e) {
  this.draggable = false;
  const items = document.querySelectorAll('.item-row, .section-title-wrapper, .page-separator');
  items.forEach(item => {
    item.classList.remove('dragging');
    item.classList.remove('over');
  });
}

const CONFIG = {
  width: 1000,
  height: 1000,
  fonts: {
    main: "'Pretendard', 'Noto Sans JP', 'Noto Sans SC', 'Noto Sans Thai', sans-serif",
    title: "'GmarketSansBold', 'Noto Sans JP', 'Noto Sans SC', 'Noto Sans Thai', sans-serif",
    medium: "'GmarketSansMedium', 'Noto Sans JP', 'Noto Sans SC', 'Noto Sans Thai', sans-serif"
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
      img.onload = () => { cachedBgImg = img; };
    };
    reader.readAsDataURL(e.target.files[0]);
  } else {
    fileLabel.textContent = '배경 이미지 파일을 선택하세요';
    dropZone.classList.remove('file-attached');
    cachedBgImg = null;
  }
});

document.getElementById('dropZone').addEventListener('click', function () {
  document.getElementById('bgInput').click();
});

// [UX] #itemsContainer 이벤트 위임: active-row 강조 + 가격 자동 포맷
document.getElementById('itemsContainer').addEventListener('focusin', function (e) {
  const row = e.target.closest('.item-row');
  if (row) row.classList.add('active-row');
});
document.getElementById('itemsContainer').addEventListener('focusout', function (e) {
  const row = e.target.closest('.item-row');
  if (!row) return;
  // 포커스가 같은 row 안에 머무는지 확인 (탭 이동 시 깜빡임 방지)
  if (!row.contains(e.relatedTarget)) {
    row.classList.remove('active-row');
  }
  // 가격 자동 포맷
  if (e.target.classList.contains('item-price')) {
    e.target.value = formatPriceKorean(e.target.value);
  }
});
// [UX] 항목명 textarea 자동 높이 조절 + 탭 제목 동기화
document.getElementById('itemsContainer').addEventListener('input', function (e) {
  if (e.target.classList.contains('item-name')) {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  }
  if (e.target.classList.contains('section-title-input')) {
    renderTabs();
  }
});

async function generateImages() {
  if (!cachedBgImg) {
    alert('배경 이미지를 먼저 선택해주세요!');
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

  const botTextRaw = document.getElementById('botText').value;
  const botTexts = botTextRaw.split('---').map(t => t.trim());

  pages.forEach((page, index) => {
    const groups = convertToGroups(page.items);
    if (groups.length > 0) {
      const title = page.title || "";
      const botText = botTexts[index] || botTexts[botTexts.length - 1] || "";
      const dataUrl = drawSingleCanvas(cachedBgImg, groups, title, botText);
      generatedImagesUrls.push(dataUrl);

      const imgEl = document.createElement('img');
      imgEl.src = dataUrl;
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

  alert("이미지 전체 다운로드 전에 [💾 내용 백업] 버튼을 눌러 데이터를 먼저 저장해 주세요!");

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

function formatPriceKorean(val) {
  const str = String(val).trim();
  if (!str) return str;
  // 이미 문자가 섞여 있거나 하이픈이 있으면 원본 유지
  if (/[^0-9]/.test(str)) return str;
  const num = parseInt(str, 10);
  if (isNaN(num) || num === 0) return str;
  const man = Math.floor(num / 10000);
  const chun = Math.floor((num % 10000) / 1000);
  let result = '';
  if (man > 0) result += man + '만';
  if (chun > 0) result += chun + '천';
  return result || str;
}

function parseCSV(blockText) {
  const lines = blockText.split('\n').filter(l => l.trim().length > 0 || l.includes('.'));
  const groups = [];
  let currentGroup = null;
  let pendingPrefix = "";

  lines.forEach(line => {
    const parts = line.split('.').map(s => s.trim());
    if (parts.length < 3) {
      pendingPrefix += line + "\n";
      return;
    }
    const price = parts.pop();
    const unit = parts.pop();
    const item = pendingPrefix + parts.join('.').trim();
    pendingPrefix = "";

    if (!currentGroup || currentGroup.item !== item) {
      currentGroup = { item, rows: [] };
      groups.push(currentGroup);
    }
    currentGroup.rows.push({ unit, price });
  });
  return groups;
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
  const textLineGap = 33;
  const whitePadding = 15;
  const itemHalfHeight = 24;

  let totalListHeight = 0;
  ctx.font = `700 27px ${CONFIG.fonts.main}`;
  ctx.letterSpacing = "-1px";

  groups.forEach((group, index) => {
    group.localMaxPriceWidth = 0;
    group.rows.forEach(r => {
      const tokens = r.price.match(/[\d.,]+|[^\d.,]+/g) || [];
      let rowPriceW = 0;
      tokens.forEach(token => {
        const isNumber = /^[\d.,]+$/.test(token);
        const formattedToken = isNumber ? formatPrice(token) : token;
        ctx.font = isNumber ? `800 54px ${CONFIG.fonts.main}` : `700 34px ${CONFIG.fonts.main}`;
        ctx.letterSpacing = isNumber ? "-3px" : "-1px";
        rowPriceW += ctx.measureText(formattedToken).width;
      });
      if (rowPriceW > group.localMaxPriceWidth) group.localMaxPriceWidth = rowPriceW;
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

  ctx.font = `49px ${CONFIG.fonts.title}`;
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
  ctx.fillStyle = "#315714"; // 1. 상단 제목 & 이벤트 기간 색상
  ctx.font = `27px ${CONFIG.fonts.medium}`;
  ctx.letterSpacing = "-1px";
  ctx.fillText(document.getElementById('topTitle').value, 500, titleBaselineY);
  ctx.fillText(document.getElementById('topDate').value, 500, dateBaselineY);

  ctx.fillStyle = "#315714"; // 2. 제목 박스 색상
  ctx.fillRect(60, eventBoxStartY, 880, bannerHeight);
  ctx.fillStyle = "white"; // 제목 텍스트 색상 (고정)
  ctx.font = `49px ${CONFIG.fonts.title}`;
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
  ctx.strokeStyle = "#315714"; ctx.lineWidth = 2; // 3. 흰박스 라인 색상
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
            ctx.fillStyle = isHighlightText ? "#315714" : "black"; // 4. 강조 텍스트 색상 & 항목명 텍스트 색상
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
        ctx.fillStyle = isHighlightText ? "#315714" : "black"; // 4. 강조 텍스트 색상 & 항목명 텍스트 색상
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

        ctx.fillStyle = "#315714"; // 5. 단위 박스 색상
        roundRect(ctx, boxX, rowCenterY - 24, unitW, 48, 14);
        ctx.textAlign = "center"; ctx.fillStyle = "white"; // 단위 텍스트 색상(고정)
        ctx.fillText(row.unit, boxX + unitW / 2, rowCenterY + 2);
      }

      const tokens = row.price.match(/[\d.,]+|[^\d.,]+/g) || [];
      let tokenMeta = [];
      let totalWidth = 0;

      tokens.forEach(token => {
        const isNumber = /^[\d.,]+$/.test(token);
        const formattedToken = isNumber ? formatPrice(token) : token;
        const font = isNumber ? `800 54px ${CONFIG.fonts.main}` : `700 34px ${CONFIG.fonts.main}`;
        const color = isNumber ? "#315714" : "black"; // 6. 가격 색상 & 금액 색상
        const letterSpacing = isNumber ? "-3px" : "-1px";

        ctx.font = font;
        ctx.letterSpacing = letterSpacing;
        let width = ctx.measureText(formattedToken).width;

        if (isNumber) {
          width += 3;
        }

        tokenMeta.push({ text: formattedToken, font, color, letterSpacing, width });
        totalWidth += width;
      });

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
      ctx.strokeStyle = "#315714"; ctx.lineWidth = 1; ctx.stroke(); // 7. 선 색상
      currentY = lineY + 32.5;
    }
  });

  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "center";
  ctx.fillStyle = "#315714"; // 8. 부가세별도 색상
  ctx.font = `23px ${CONFIG.fonts.medium}`;
  ctx.letterSpacing = "0px";
  ctx.fillText(botText, 500, 975);

  return canvas.toDataURL('image/jpeg', 0.95);
}

window.onload = () => {
  addSectionTitle('굿바이 Spring 4월 이벤트');
  addItemRow(`<붓기삭제 종아리 슬림패키지>
종아리 보톡스 200u + 슬림주사 100cc
+지방타파레이저 1000샷`, '', '19만9천');
  addItemRow('보톡스', '', '9만');
  addItemRow('필러', '1회', '4만');
  addItemRow('필러', '3회', '11만');
};

window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 's' || e.code === 'KeyS')) {
    e.preventDefault();
    generateImages();
  }
});
