let generatedImagesUrls = [];
    let cachedBgImg = null;
    let isBackedUp = true; // 최초 실행 시는 구실 데이터를 수정하지 않았으리건데, 실제 항목 입력 후 false가 됨

    document.addEventListener('DOMContentLoaded', () => {
    });

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
        if (child.dataset.type === 'table-block') {
          const boxes = [];
          child.querySelectorAll('.table-box').forEach(box => {
            boxes.push({
              content: box.querySelector('.box-content').value,
              price: box.querySelector('.box-price').value
            });
          });
          items.push({ type: 'table-block', boxes });
        } else if (child.classList.contains('item-row')) {
          const rows = [];
          child.querySelectorAll('.price-option-row').forEach(r => {
             rows.push({
                unit: r.querySelector('.item-unit').value,
                price: r.querySelector('.item-price').value
             });
          });
          items.push({
            type: 'item',
            itemName: child.querySelector('.item-name')?.value || "",
            nameSize: child.querySelector('.name-size')?.value || 27,
            nameWeight: child.querySelector('.name-weight')?.value || 700,
            rows: rows,
            unitSize: child.querySelector('.unit-size')?.value || 27,
            unitWeight: child.querySelector('.unit-weight')?.value || 800,
            priceSize: child.querySelector('.price-size')?.value || 34,
            priceWeight: child.querySelector('.price-weight')?.value || 700,
            layoutType: child.querySelector('.layout-type')?.value || 'standard'
          });
        } else if (child.classList.contains('section-title-wrapper')) {
          items.push({
            type: 'sectionTitle',
            value: child.querySelector('.section-title-input').value,
            titleSize: child.querySelector('.title-size').value,
            titleWeight: child.querySelector('.title-weight').value
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
              if (item.type === 'table-block' || item.type === 'table-group') {
                addTableGroup(item.boxes);
              } else if (item.type === 'item') {
                let rows = item.rows;
                if (!rows) {
                  rows = [{unit: item.unit || "", price: item.price || ""}];
                }
                addItemRow(item.itemName, rows, item.nameSize, item.nameWeight, item.unitSize, item.unitWeight, item.priceSize, item.priceWeight, item.layoutType || 'standard');
              } else if (item.type === 'sectionTitle') {
                addSectionTitle(item.value, false, item.titleSize, item.titleWeight);
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
      tabsEl._tabDragInitialized = false;
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
      });
      window.addEventListener('pointermove', (e) => {
        if (!tabDragDown) return;
        const walk = (e.clientX - tabStartX) * 1.5;
        if (Math.abs(walk) > 4) {
          tabHasDragged = true;
          el.classList.add('is-dragging');
        }
        el.scrollLeft = tabScrollLeft - walk;
      });
      window.addEventListener('pointerup', () => {
        tabDragDown = false;
        el.classList.remove('is-dragging');
      });
      window.addEventListener('pointercancel', () => {
        tabDragDown = false;
        el.classList.remove('is-dragging');
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

    function addSectionTitle(titleValue = "", withTemplate = false, titleSize = 49, titleWeight = 800) {
      const container = document.getElementById('itemsContainer');
      const wrapper = document.createElement('div');
      wrapper.className = 'section-title-wrapper';
      wrapper.innerHTML = `
                <div class="drag-handle">${DRAG_HANDLE_SVG}</div>
                <textarea class="btn-input section-title-input" placeholder="중앙 배너 제목 입력 (예: 보톡스 이벤트)">${titleValue}</textarea>
                <div class="section-row-actions">
                  <button class="btn-settings" onclick="this.closest('.section-title-wrapper').querySelector('.font-settings-panel').style.display = this.closest('.section-title-wrapper').querySelector('.font-settings-panel').style.display === 'flex' ? 'none' : 'flex'; this.classList.toggle('settings-open');" title="폰트 설정">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                  <button class="btn-remove" onclick="deleteSectionTitle(this)" title="삭제">${CLOSE_SVG_16}</button>
                </div>
                <div class="font-settings-panel">
                  <div class="setting-group">
                    <span class="setting-group-title">제목</span>
                    <span class="fc-label">Size</span>
                    <input type="number" class="btn-input fc-size title-size" value="${titleSize}" min="10" max="150" step="1">
                    <span class="fc-label">Weight</span>
                    <select class="btn-input fc-weight title-weight">
                      <option value="400" ${titleWeight == 400 ? 'selected' : ''}>Regular</option>
                      <option value="500" ${titleWeight == 500 ? 'selected' : ''}>Medium</option>
                      <option value="700" ${titleWeight == 700 ? 'selected' : ''}>Bold</option>
                      <option value="800" ${titleWeight == 800 ? 'selected' : ''}>ExtraBold</option>
                    </select>
                  </div>
                </div>
            `;
      container.appendChild(wrapper);
      // DOM 삽입 직후 초기 높이 설정
      const stInput = wrapper.querySelector('.section-title-input');
      stInput.style.height = 'auto';
      stInput.style.height = stInput.scrollHeight + 'px';

      // 탭 실시간 동기화
      stInput.addEventListener('input', () => renderTabs());
      // 실시간 갱신 리스너 추가 (input + select 모두)
      wrapper.querySelectorAll('input, textarea, select').forEach(el => {
        el.addEventListener('input', debouncedGenerateImages);
        el.addEventListener('change', debouncedGenerateImages);
      });

      renderTabs();
      switchTab(getBannerGroups().length - 1);
      
      const tabsEl = document.getElementById('bannerTabs');
      if (tabsEl) {
        setTimeout(() => {
          tabsEl.scrollTo({ left: tabsEl.scrollWidth, behavior: 'smooth' });
        }, 50);
      }
      if (withTemplate) {
        addItemRow(`<붓기삭제 종아리 슬림패키지>\n종아리 보톡스 200u + 슬림주사 100cc\n+지방타파레이저 1000샷`, [{unit: '', price: '19만9천'}]);
        addItemRow('보톡스', [{unit: '', price: '9만'}]);
        addItemRow('필러', [
          {unit: '1회', price: '4만'},
          {unit: '3회', price: '11만'}
        ]);
      } else {
        debouncedGenerateImages();
      }
    }

    function addItemRow(itemName = "", rows = [{unit: "", price: ""}], nSize = 27, nWeight = 700, uSize = 27, uWeight = 800, pSize = 34, pWeight = 700, layoutType = 'standard') {
      const container = document.getElementById('itemsContainer');
      const row = createItemRow(itemName, rows, nSize, nWeight, uSize, uWeight, pSize, pWeight, layoutType);
      
      let lastRow = null;
      Array.from(container.children).forEach(child => {
        if (child.classList.contains('item-row') || child.classList.contains('section-title-wrapper') || child.dataset.type === 'table-block') {
          lastRow = child;
        }
      });
      
      if (lastRow) {
        lastRow.parentNode.insertBefore(row, lastRow.nextSibling);
      } else {
        container.appendChild(row);
      }
      
      switchTab(getBannerGroups().length - 1);
      
      const tabsEl = document.getElementById('bannerTabs');
      if (tabsEl) {
        setTimeout(() => {
          tabsEl.scrollTo({ left: tabsEl.scrollWidth, behavior: 'smooth' });
        }, 50);
      }

      debouncedGenerateImages();
    }

    window.addPriceOption = function(btn) {
      const wrapper = btn.closest('.price-options-wrapper');
      const optionRow = document.createElement('div');
      optionRow.className = 'price-option-row';
      optionRow.style.cssText = 'display:flex; gap:8px; align-items:center;';
      optionRow.innerHTML = `
        <input type="text" class="btn-input item-unit" placeholder="단위">
        <input type="text" class="btn-input item-price" placeholder="금액">
        <button class="btn-remove btn-remove-price-option" onclick="this.closest('.price-option-row').remove(); debouncedGenerateImages();" style="width:24px; height:24px;">${CLOSE_SVG_14}</button>
      `;
      optionRow.querySelectorAll('input').forEach(el => el.addEventListener('input', debouncedGenerateImages));
      wrapper.insertBefore(optionRow, btn);
      debouncedGenerateImages();
    };

    function createItemRow(itemName = "", rows = [{unit: "", price: ""}], nSize = 27, nWeight = 700, uSize = 27, uWeight = 800, pSize = 34, pWeight = 700, layoutType = 'standard') {
      const row = document.createElement('div');
      row.className = 'item-row';
      
      let priceHtml = '';
      rows.forEach((r, i) => {
        priceHtml += `<div class="price-option-row" style="display:flex; gap:8px; align-items:center;">
          <input type="text" class="btn-input item-unit" placeholder="단위" value="${r.unit || ''}">
          <input type="text" class="btn-input item-price" placeholder="금액" value="${r.price || ''}">
          ${i > 0 ? `<button class="btn-remove btn-remove-price-option" onclick="this.closest('.price-option-row').remove(); debouncedGenerateImages();" style="width:24px; height:24px;">${CLOSE_SVG_14}</button>` : `<div style="width:24px;"></div>`}
        </div>`;
      });

      row.innerHTML = `
                <div class="drag-handle">${DRAG_HANDLE_SVG}</div>
                <textarea class="btn-input item-name" placeholder="항목명 (예: <리쥬란 2cc>)">${itemName}</textarea>
                <div class="price-options-wrapper" style="display:flex; flex-direction:column; gap:8px;">
                  ${priceHtml}
                  <button class="btn-add btn-add-price-option" onclick="addPriceOption(this)" style="padding:6px; font-size:12px; height:auto; background:#f2f4f6; color:#4e5968;">+ 가격 추가</button>
                </div>
                <div class="row-actions">
                    <button class="btn-settings" onclick="this.closest('.item-row').querySelector('.font-settings-panel').style.display = this.closest('.item-row').querySelector('.font-settings-panel').style.display === 'flex' ? 'none' : 'flex'; this.classList.toggle('settings-open');" title="폰트 설정">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1-1-1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button class="btn-copy" onclick="duplicateItemRow(this)" title="복제">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    </button>
                    <button class="btn-remove" onclick="this.closest('.item-row').remove(); debouncedGenerateImages();" title="삭제">${CLOSE_SVG_14}</button>
                </div>
                <div class="font-settings-panel">
                  <div class="setting-group">
                    <span class="setting-group-title">정렬</span>
                    <select class="btn-input fc-weight layout-type">
                      <option value="standard" ${layoutType === 'standard' ? 'selected' : ''}>↔ 좌우 배치</option>
                      <option value="center" ${layoutType === 'center' ? 'selected' : ''}>↕ 상하 중앙</option>
                    </select>
                  </div>
                  <div class="setting-group">
                    <span class="setting-group-title">항목명</span>
                    <span class="fc-label">Size</span>
                    <input type="number" class="btn-input fc-size name-size" value="${nSize}">
                    <span class="fc-label">Weight</span>
                    <select class="btn-input fc-weight name-weight">
                      <option value="400" ${nWeight == 400 ? 'selected' : ''}>Regular</option>
                      <option value="500" ${nWeight == 500 ? 'selected' : ''}>Medium</option>
                      <option value="700" ${nWeight == 700 ? 'selected' : ''}>Bold</option>
                      <option value="800" ${nWeight == 800 ? 'selected' : ''}>ExtraBold</option>
                    </select>
                  </div>
                  <div class="setting-group">
                    <span class="setting-group-title">단위</span>
                    <span class="fc-label">Size</span>
                    <input type="number" class="btn-input fc-size unit-size" value="${uSize}">
                    <span class="fc-label">Weight</span>
                    <select class="btn-input fc-weight unit-weight">
                      <option value="400" ${uWeight == 400 ? 'selected' : ''}>Regular</option>
                      <option value="500" ${uWeight == 500 ? 'selected' : ''}>Medium</option>
                      <option value="700" ${uWeight == 700 ? 'selected' : ''}>Bold</option>
                      <option value="800" ${uWeight == 800 ? 'selected' : ''}>ExtraBold</option>
                    </select>
                  </div>
                  <div class="setting-group">
                    <span class="setting-group-title">가격</span>
                    <span class="fc-label">Size</span>
                    <input type="number" class="btn-input fc-size price-size" value="${pSize}">
                    <span class="fc-label">Weight</span>
                    <select class="btn-input fc-weight price-weight">
                      <option value="400" ${pWeight == 400 ? 'selected' : ''}>Regular</option>
                      <option value="500" ${pWeight == 500 ? 'selected' : ''}>Medium</option>
                      <option value="700" ${pWeight == 700 ? 'selected' : ''}>Bold</option>
                      <option value="800" ${pWeight == 800 ? 'selected' : ''}>ExtraBold</option>
                    </select>
                  </div>
                </div>
            `;

      row.querySelectorAll('input, textarea, select').forEach(el => {
        el.addEventListener('input', debouncedGenerateImages);
        el.addEventListener('change', debouncedGenerateImages);
      });

      return row;
    }

    function createTableBox(content = "", price = "") {
      const box = document.createElement('div');
      box.className = 'table-box';
      box.innerHTML = `
        <textarea class="btn-input box-content" placeholder="좌측 항목 내용 (예: 레이저 2종 \n 보톡스)">${content}</textarea>
        <input type="text" class="btn-input box-price" placeholder="가격 (예: 100,000원)" value="${price}">
        <button type="button" class="btn-remove-table-box" style="color: var(--text-tertiary); background: none; border: none; cursor: pointer; font-size: 14px; padding: 4px;">✕</button>
      `;
      box.querySelectorAll('input, textarea').forEach(el => {
        el.addEventListener('input', debouncedGenerateImages);
      });
      box.querySelector('.btn-remove-table-box').addEventListener('click', () => {
        box.remove();
        debouncedGenerateImages();
      });
      return box;
    }

    function addTableGroup(boxesData = null) {
      const activeBanner = document.querySelector('.section-title-wrapper.active-banner');
      if (!activeBanner && !document.querySelector('.section-title-wrapper')) {
        addSectionTitle("새 페이지");
      }

      const container = document.getElementById('itemsContainer');
      const targetBanner = document.querySelector('.section-title-wrapper.active-banner') || document.querySelector('.section-title-wrapper');
      
      const row = document.createElement('div');
      row.className = 'item-row table-type';
      row.dataset.type = 'table-block';
      row.innerHTML = `
        <div class="drag-handle">${DRAG_HANDLE_SVG}</div>
        <div class="table-boxes-wrapper"></div>
        <div class="row-actions">
           <button class="btn-remove" onclick="this.closest('.item-row').remove(); debouncedGenerateImages();" title="삭제">${CLOSE_SVG_14}</button>
        </div>
      `;
      
      const wrapper = row.querySelector('.table-boxes-wrapper');
      
      if (boxesData && Array.isArray(boxesData)) {
        boxesData.forEach(d => wrapper.appendChild(createTableBox(d.content, d.price)));
      } else {
        wrapper.appendChild(createTableBox('', ''));
      }

      const addBtn = document.createElement('button');
      addBtn.className = 'btn-add-table-box';
      addBtn.textContent = '+ 박스 추가';
      addBtn.onclick = () => {
        wrapper.insertBefore(createTableBox('', ''), addBtn);
        debouncedGenerateImages();
      };
      wrapper.appendChild(addBtn);

      if (targetBanner) {
        let nextSibling = targetBanner.nextElementSibling;
        while (nextSibling && !nextSibling.classList.contains('section-title-wrapper')) {
          nextSibling = nextSibling.nextElementSibling;
        }
        if (nextSibling) container.insertBefore(row, nextSibling);
        else container.appendChild(row);
      } else {
        container.appendChild(row);
      }
      debouncedGenerateImages();
    }

    function duplicateItemRow(button) {
      const currentRow = button.closest('.item-row');
      const itemName = currentRow.querySelector('.item-name')?.value || "";
      const rowsData = [];
      currentRow.querySelectorAll('.price-option-row').forEach(r => {
        rowsData.push({
          unit: r.querySelector('.item-unit').value,
          price: r.querySelector('.item-price').value
        });
      });
      if(rowsData.length === 0) rowsData.push({unit: "", price: ""});
      
      const nSize = currentRow.querySelector('.name-size')?.value || 27;
      const nWeight = currentRow.querySelector('.name-weight')?.value || 700;
      const uSize = currentRow.querySelector('.unit-size')?.value || 27;
      const uWeight = currentRow.querySelector('.unit-weight')?.value || 800;
      const pSize = currentRow.querySelector('.price-size')?.value || 34;
      const pWeight = currentRow.querySelector('.price-weight')?.value || 700;
      const layoutType = currentRow.querySelector('.layout-type')?.value || 'standard';

      const newRow = createItemRow(itemName, rowsData, nSize, nWeight, uSize, uWeight, pSize, pWeight, layoutType);
      currentRow.after(newRow);
      const nameEl = newRow.querySelector('.item-name');
      if (nameEl) {
          nameEl.style.height = 'auto';
          nameEl.style.height = nameEl.scrollHeight + 'px';
      }
      debouncedGenerateImages();
    }


    const CONFIG = {
      width: 1000,
      height: 1000,
      fonts: {
        main: "'Pretendard', sans-serif",
        title: "'GmarketSansBold', sans-serif",
        sub: "'GmarketSansMedium', sans-serif"
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

    function convertToGroups(items) {
      const groups = [];
      let currentGroup = null;

      items.forEach(item => {
        if (item.type === 'table-block') {
          groups.push(item);
          currentGroup = null;
        } else {
          // Standard item
          if (currentGroup && currentGroup.type !== 'table-block' && currentGroup.item === item.item && currentGroup.layoutType === item.layoutType) {
            currentGroup.rows.push(...item.rows);
          } else {
            currentGroup = {
              type: 'item-group',
              item: item.item,
              layoutType: item.layoutType,
              nameSize: item.nameSize,
              nameWeight: item.nameWeight,
              rows: [...item.rows]
            };
            groups.push(currentGroup);
          }
        }
      });
      return groups;
    }

    async function generateImages() {
      if (!cachedBgImg) {
        return;
      }

      const container = document.getElementById('itemsContainer');
      const pages = [];
      let currentPage = { items: [], title: "", titleSize: 49, titleWeight: 800 };

      container.childNodes.forEach(child => {
        if (child.nodeType !== 1) return;

        if (child.classList.contains('section-title-wrapper')) {
          if (currentPage.items.length > 0) {
            currentPage.items = convertToGroups(currentPage.items);
            pages.push(currentPage);
            currentPage = { items: [], title: "", titleSize: 49, titleWeight: 800 };
          }
          currentPage.title = child.querySelector('.section-title-input').value.trim();
          currentPage.titleSize = parseInt(child.querySelector('.title-size')?.value) || 49;
          currentPage.titleWeight = parseInt(child.querySelector('.title-weight')?.value) || 800;
        } else if (child.dataset.type === 'table-block') {
          const boxes = [];
          child.querySelectorAll('.table-box').forEach(box => {
            const content = box.querySelector('.box-content').value.trim();
            const price = box.querySelector('.box-price').value.trim();
            if (content || price) boxes.push({ content, price });
          });
          if (boxes.length > 0) currentPage.items.push({ type: 'table-block', boxes });
        } else if (child.classList.contains('item-row')) {
          const itemName = child.querySelector('.item-name')?.value.trim() || "";
          const rows = [];
          
          child.querySelectorAll('.price-option-row').forEach(r => {
             const unit = r.querySelector('.item-unit').value.trim();
             const price = r.querySelector('.item-price').value.trim();
             if (unit || price || itemName) {
                 rows.push({
                     unit, price,
                     unitSize: parseInt(child.querySelector('.unit-size')?.value) || 27,
                     unitWeight: parseInt(child.querySelector('.unit-weight')?.value) || 800,
                     priceSize: parseInt(child.querySelector('.price-size')?.value) || 34,
                     priceWeight: parseInt(child.querySelector('.price-weight')?.value) || 700
                 });
             }
          });
          
          if (rows.length > 0) {
             currentPage.items.push({
               type: 'standard',
               item: itemName,
               rows: rows,
               nameSize: parseInt(child.querySelector('.name-size')?.value) || 27,
               nameWeight: parseInt(child.querySelector('.name-weight')?.value) || 700,
               layoutType: child.querySelector('.layout-type')?.value || 'standard'
             });
          }
        }
      });
      if (currentPage.items.length > 0) {
        currentPage.items = convertToGroups(currentPage.items);
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
        '800 54px "Pretendard"'
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
        const groups = page.items;
        if (groups.length > 0) {
          const title = page.title || "";
          const dataUrl = drawSingleCanvas(cachedBgImg, groups, title, botText, page.titleSize, page.titleWeight);
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

    function getPriceTokenMeta(ctx, priceStr, pSize = 34, pWeight = 700) {
      const tokens = priceStr.match(/[\d.,]+|[^\d.,]+/g) || [];
      let totalWidth = 0;
      const numDisplaySize = Math.round(pSize * 1.5); // 숫자는 1.5배 크게

      const tokenMeta = tokens.map(token => {
        const isNumber = /^[\d.,]+$/.test(token);
        const text = isNumber ? formatPrice(token) : token;
        const font = isNumber 
          ? `${pWeight} ${numDisplaySize}px ${CONFIG.fonts.main}` 
          : `${pWeight} ${pSize}px ${CONFIG.fonts.main}`;
        const color = isNumber ? null : 'black'; // null = themeColor
        const letterSpacing = isNumber ? "-2px" : "-1px";
        ctx.font = font;
        ctx.letterSpacing = letterSpacing;
        let width = ctx.measureText(text).width;
        if (isNumber) width += 2;
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

    function drawSingleCanvas(bgImg, groups, title, botText, titleSize = 49, titleWeight = 800) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = CONFIG.width;
      canvas.height = CONFIG.height;

      const startX = 105, endX = 895;
      const unitPriceGap = 25;
      const groupRowGap = 50;
      const whitePadding = 15;
      const itemHalfHeight = 24;

      let totalListHeight = 0;
      ctx.font = `700 22px ${CONFIG.fonts.main}`;
      ctx.letterSpacing = "-1px";

      groups.forEach((group, index) => {
        if (group.type === 'table-block') {
          let groupSpans = 0;
          group.boxLayouts = [];
          group.boxes.forEach(box => {
            const lines = box.content.split('\n');
            const textH = lines.length * 30; // 22px font size handling
            const boxH = Math.max(textH + 40, 80);
            group.boxLayouts.push({ lines, boxH });
            groupSpans += boxH + 12; // 12px gap
          });
          group.heightSpan = groupSpans - 12; 
          totalListHeight += group.heightSpan;
          if (index < groups.length - 1) {
              totalListHeight += 50;
          }
          return;
        }

        const gSize = group.nameSize || 22;
        const gWeight = group.nameWeight || 500;
        const textLineGap = Math.round(gSize * 1.4);

        if (!group.rows) group.rows = [];

        group.localMaxPriceWidth = 0;
        group.rows.forEach(r => {
          const { totalWidth } = getPriceTokenMeta(ctx, r.price, r.priceSize || 34, r.priceWeight || 700);
          if (totalWidth > group.localMaxPriceWidth) group.localMaxPriceWidth = totalWidth;
        });

        group.maxUnitW = 0;
        let priceSpan = 0;

        group.rows.forEach(r => {
          if (r.unit) {
            ctx.font = `${r.unitWeight || 500} ${r.unitSize || 18}px ${CONFIG.fonts.main}`;
            const w = ctx.measureText(r.unit).width + Math.round((r.unitSize || 18) * 1.2);
            if (w > group.maxUnitW) group.maxUnitW = w;
          }
          
          r.rowHeight = Math.round((r.priceSize || 34) * 1.6);
          priceSpan += r.rowHeight;
        });

        // 우측 요소(단위박스 + 가격) 전체 너비를 합산하여 텍스트 허용 너비 계산
        // 1. 레이아웃에 따른 텍스트 제한 너비(MaxWidth) 및 높이(HeightSpan) 계산
        ctx.font = `${gWeight} ${gSize}px ${CONFIG.fonts.main}`;
        ctx.letterSpacing = "-1px";

        if (group.layoutType === 'center') {
          // Center: 전체 너비 사용 (800px)
          const centerMaxWidth = endX - startX;
          group.lines = wrapTextChar(ctx, group.item, centerMaxWidth);
          const textSpan = group.lines.length * textLineGap;
          group.heightSpan = textSpan + 24 + priceSpan;
        } else {
          // Standard: 우측 버튼 영역과 겹치지 않도록 철저히 계산
          const rightBlockWidth = group.localMaxPriceWidth + (group.maxUnitW > 0 ? group.maxUnitW + unitPriceGap : 0);
          const currentMaxTextWidth = Math.max(60, (endX - startX) - rightBlockWidth - 30); // 30px 안전 마진 확보
          group.lines = wrapTextChar(ctx, group.item, currentMaxTextWidth);
          const textSpan = group.lines.length * textLineGap;
          group.heightSpan = Math.max(priceSpan, textSpan);
        }

        totalListHeight += group.heightSpan;
        if (index < groups.length - 1) {
            totalListHeight += Math.max(50, Math.round(gSize * 1.8));
        }
      });

      // whiteBoxHeight = 동적 마진 + 총 리스트 높이 + 동적 마진
      const dynamicWhitePadding = 30; // 기준 패딩
      const whiteBoxHeight = dynamicWhitePadding + totalListHeight + dynamicWhitePadding;
      
      ctx.font = `${titleWeight} ${titleSize}px ${CONFIG.fonts.title}`;
      ctx.letterSpacing = "-2px";
      const titleLines = wrapTextChar(ctx, title, 800);
      const titleLineHeight = Math.round(titleSize * 1.4);
      const bannerHeight = Math.max(95, titleLines.length * titleLineHeight + 30);

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

      ctx.fillStyle = themeColor;
      ctx.font = `27px ${CONFIG.fonts.sub}`;
      ctx.letterSpacing = "-1px";
      ctx.fillText(document.getElementById('topTitle').value, 500, titleBaselineY);
      ctx.fillText(document.getElementById('topDate').value, 500, dateBaselineY);

      ctx.fillStyle = themeColor; 
      ctx.fillRect(60, eventBoxStartY, 880, bannerHeight);
      ctx.fillStyle = "white"; 
      ctx.font = `${titleWeight} ${titleSize}px ${CONFIG.fonts.title}`;
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
      ctx.strokeStyle = themeColor; ctx.lineWidth = 2; 
      ctx.strokeRect(60 + 1, whiteBoxTop, 880 - 2, whiteBoxHeight - 1);

      let currentY = whiteBoxTop + dynamicWhitePadding;

      groups.forEach((group, index) => {
        if (group.type === 'table-group') {
          group.boxLayouts.forEach((layout, bIdx) => {
            const box = group.boxes[bIdx];
            const boxY = currentY;
            
            // 박스 배경 및 테두리
            ctx.fillStyle = "white";
            roundRect(ctx, startX, boxY, endX - startX, layout.boxH, 12);
            ctx.strokeStyle = themeColor;
            ctx.lineWidth = 2;
            ctx.stroke();

            // 좌측 컨텐츠
            ctx.fillStyle = "black";
            ctx.font = `22px ${CONFIG.fonts.main}`;
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            const lineGap = 30;
            const startLineY = boxY + (layout.boxH / 2) - ((layout.lines.length - 1) * lineGap) / 2;
            layout.lines.forEach((l, i) => {
               ctx.fillText(l, startX + 24, startLineY + i * lineGap);
            });

            // 우측 가격
            ctx.textAlign = "right";
            ctx.fillStyle = themeColor;
            const { tokenMeta, totalWidth } = getPriceTokenMeta(ctx, box.price, 34, 700);
            tokenMeta.forEach(m => { if (m.color === null) m.color = themeColor; });

            let drawX = endX - 24 - totalWidth;
            ctx.textAlign = "left";
            tokenMeta.forEach(meta => {
              ctx.font = meta.font; ctx.fillStyle = meta.color; ctx.letterSpacing = meta.letterSpacing;
              ctx.fillText(meta.text, drawX, boxY + (layout.boxH / 2));
              drawX += meta.width;
            });

            currentY += layout.boxH + 12; // box gap
          });
          currentY -= 12; // 마지막 gap 제거
          
          if (index < groups.length - 1) {
            const groupGap = 50;
            const lineY = currentY + (groupGap / 2);
            ctx.beginPath(); ctx.moveTo(startX, lineY); ctx.lineTo(endX, lineY);
            ctx.strokeStyle = themeColor; ctx.lineWidth = 1; ctx.stroke(); 
            currentY += groupGap;
          }
          return;
        }

        const gSize = group.nameSize || 27;
        const gWeight = group.nameWeight || 700;
        const textLineGap = Math.round(gSize * 1.4);
        
        if (group.layoutType === 'center') {
          // ―――― [CENTER LAYOUT: 상하 중앙 배치] ――――
          const textSpan = group.lines.length * textLineGap;
          const textBlockStartY = currentY + textLineGap / 2;
          let isHighlightText = false;

          // 1. 항목명 중앙 정렬
          group.lines.forEach((line, i) => {
            const lineY = textBlockStartY + i * textLineGap;
            const plainLine = line.replace(/[<>]/g, '');
            ctx.font = `${gWeight} ${gSize}px ${CONFIG.fonts.main}`;
            ctx.letterSpacing = "-1px";
            ctx.textBaseline = "middle";
            ctx.textAlign = "left"; // 파싱 렌더링을 위해 left 유지 후 시작점 계산
            
            const fullLineWidth = ctx.measureText(plainLine).width;
            let currentX = 500 - (fullLineWidth / 2);

            let chunk = "";
            for (let j = 0; j < line.length; j++) {
              const char = line[j];
              if (char === '<' || char === '>') {
                if (chunk.length > 0) {
                  ctx.fillStyle = isHighlightText ? themeColor : "black";
                  ctx.fillText(chunk, currentX, lineY);
                  currentX += ctx.measureText(chunk).width;
                  chunk = "";
                }
                isHighlightText = (char === '<');
              } else { chunk += char; }
            }
            if (chunk.length > 0) {
              ctx.fillStyle = isHighlightText ? themeColor : "black";
              ctx.fillText(chunk, currentX, lineY);
            }
          });

          // 2. 가격표 묶음 중앙 정렬 (항목명 아래)
          let accumulatedY = currentY + textSpan + 24;
          group.rows.forEach(row => {
            const rowCenterY = accumulatedY + row.rowHeight / 2;
            accumulatedY += row.rowHeight;

            ctx.font = `${row.priceWeight || 700} ${row.priceSize || 34}px ${CONFIG.fonts.main}`;
            const { tokenMeta, totalWidth } = getPriceTokenMeta(ctx, row.price, row.priceSize, row.priceWeight);
            tokenMeta.forEach(m => { if (m.color === null) m.color = themeColor; });

            const uSize = row.unitSize || 18;
            const unitW = row.unit ? (group.maxUnitW || 0) : 0;
            const rowTotalW = unitW + (unitW > 0 ? 12 : 0) + totalWidth;
            let drawX = 500 - (rowTotalW / 2);

            if (row.unit && unitW > 0) {
              ctx.font = `${row.unitWeight || 800} ${uSize}px ${CONFIG.fonts.main}`;
              ctx.fillStyle = themeColor;
              const boxH = Math.round(uSize * 1.8);
              roundRect(ctx, drawX, rowCenterY - boxH / 2, unitW, boxH, Math.round(uSize * 0.5));
              ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "white";
              ctx.fillText(row.unit, drawX + unitW / 2, rowCenterY);
              drawX += unitW + 12;
            }

            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            tokenMeta.forEach(meta => {
              ctx.font = meta.font; ctx.fillStyle = meta.color; ctx.letterSpacing = meta.letterSpacing;
              ctx.fillText(meta.text, drawX, rowCenterY);
              drawX += meta.width;
            });
          });

        } else {
          // ―――― [STANDARD LAYOUT: 좌우 기본 배치] ――――
          const groupCenterY = currentY + (group.heightSpan / 2);
          const textSpan = group.lines.length * textLineGap;
          let textStartY = groupCenterY - ((textSpan - textLineGap) / 2);
          let isHighlightText = false;

          // 1. 항목명 좌측 정렬 (startX = 105 고정)
          group.lines.forEach((line, i) => {
            const lineY = textStartY + (i * textLineGap);
            let currentX = startX; 
            let chunk = "";
            ctx.textBaseline = "middle";
            ctx.textAlign = "left";
            ctx.font = `${gWeight} ${gSize}px ${CONFIG.fonts.main}`;
            ctx.letterSpacing = "-1px";

            for (let j = 0; j < line.length; j++) {
              const char = line[j];
              if (char === '<' || char === '>') {
                if (chunk.length > 0) {
                  ctx.fillStyle = isHighlightText ? themeColor : "black";
                  ctx.fillText(chunk, currentX, lineY);
                  currentX += ctx.measureText(chunk).width;
                  chunk = "";
                }
                isHighlightText = (char === '<');
              } else { chunk += char; }
            }
            if (chunk.length > 0) {
              ctx.fillStyle = isHighlightText ? themeColor : "black";
              ctx.fillText(chunk, currentX, lineY);
            }
          });

          // 2. 가격표 우측 정렬 (endX = 895 고정)
          let priceSpan = group.rows.reduce((s, r) => s + r.rowHeight, 0);
          let accY = groupCenterY - (priceSpan / 2);

          group.rows.forEach(row => {
            const rowCenterY = accY + (row.rowHeight / 2);
            accY += row.rowHeight;

            const { tokenMeta, totalWidth } = getPriceTokenMeta(ctx, row.price, row.priceSize, row.priceWeight);
            tokenMeta.forEach(m => { if (m.color === null) m.color = themeColor; });

            // 가격 렌더링 (우측 정렬)
            let drawX = endX - totalWidth;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            tokenMeta.forEach(meta => {
              ctx.font = meta.font; ctx.fillStyle = meta.color; ctx.letterSpacing = meta.letterSpacing;
              ctx.fillText(meta.text, drawX, rowCenterY);
              drawX += meta.width;
            });

            // 단위 박스 렌더링 (가격 좌측)
            if (row.unit) {
              const uSize = row.unitSize || 18;
              ctx.font = `${row.unitWeight || 800} ${uSize}px ${CONFIG.fonts.main}`;
              const unitW = group.maxUnitW;
              const boxX = endX - totalWidth - unitPriceGap - unitW; // 가격 너비와 간격만큼 왼쪽으로 이동
              ctx.fillStyle = themeColor;
              const boxH = Math.round(uSize * 1.8);
              roundRect(ctx, boxX, rowCenterY - boxH / 2, unitW, boxH, Math.round(uSize * 0.5));
              ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "white";
              ctx.fillText(row.unit, boxX + unitW / 2, rowCenterY);
            }
          });
        }

        if (index < groups.length - 1) {
          const groupGap = Math.max(50, Math.round(gSize * 1.8));
          const lineY = currentY + group.heightSpan + (groupGap / 2);
          
          ctx.beginPath(); ctx.moveTo(startX, lineY); ctx.lineTo(endX, lineY);
          ctx.strokeStyle = themeColor; ctx.lineWidth = 1; ctx.stroke(); 
          currentY += group.heightSpan + groupGap;
        } else {
          currentY += group.heightSpan;
        }
      });

      const whiteBoxBottom = whiteBoxTop + whiteBoxHeight;
      // 캔버스 하단(975)과 박스 하단+25px 중 더 아래인 위치에 그리되,
      // 캔버스 최대 높이(990)를 초과하지 않도록 제한
      const botTextY = Math.min(Math.max(whiteBoxBottom + 25, 975), canvas.height - 10);

      ctx.textBaseline = "alphabetic";
      ctx.textAlign = "center";
      ctx.fillStyle = themeColor;
      ctx.font = `23px ${CONFIG.fonts.sub}`;
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
      addItemRow(`<붓기삭제 종아리 슬림패키지>\n종아리 보톡스 200u + 슬림주사 100cc\n+지방타파레이저 1000샷`, '', '19만9천');
      addItemRow('보톡스', '', '9만');
      addItemRow('필러', '1회', '4만');
      addItemRow('필러', '3회', '11만');
      addTableGroup([{content: '홍조 레이저\n여드름 케어', price: '149,000원'}, {content: '잡티 색소\n흉터 모공', price: '200,000원'}]);

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