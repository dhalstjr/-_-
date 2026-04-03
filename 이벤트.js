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