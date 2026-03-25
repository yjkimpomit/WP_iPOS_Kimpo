(function () {
  const root = document.documentElement;
  const STORAGE_KEY = 'branch';
  const DEFAULT_BRANCH = 'taean';

  /* =========================
   * 0. 브랜치 매핑 (UI 텍스트 → key)
   * ========================= */
  const BRANCH_MAP = {
    '태안 9, 10호기': 'taean',
    '김포열병합': 'kimpo',
    '평택 2복합': 'pyungtak'
  };

  /* =========================
   * 1. 브랜치 적용
   * ========================= */
  function setBranch(branch) {
    if (!branch || branch === DEFAULT_BRANCH) {
      root.removeAttribute('data-branch');
    } else {
      root.dataset.branch = branch;
    }

    localStorage.setItem(STORAGE_KEY, branch);

    syncHeaderLabel(branch);
    syncActiveState(branch);
    applyThemeToAllIframes(branch);
  }

  /* =========================
   * 2. 초기화
   * ========================= */
  function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_BRANCH;
    setBranch(saved);
  }

  /* =========================
   * 3. iframe 적용
   * ========================= */
  function applyThemeToIframe(iframe, branch) {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      if (!doc) return;

      if (branch === DEFAULT_BRANCH) {
        doc.documentElement.removeAttribute('data-branch');
      } else {
        doc.documentElement.dataset.branch = branch;
      }
    } catch (e) {
      // cross-origin iframe → 무시
    }
  }

  function applyThemeToAllIframes(branch) {
    document.querySelectorAll('iframe').forEach(iframe => {
      applyThemeToIframe(iframe, branch);
    });
  }

  /* =========================
   * 4. iframe load 대응
   * ========================= */
  function bindIframeLoad() {
    document.querySelectorAll('iframe').forEach(iframe => {
      iframe.addEventListener('load', () => {
        const branch = localStorage.getItem(STORAGE_KEY) || DEFAULT_BRANCH;
        applyThemeToIframe(iframe, branch);
      });
    });
  }

  /* =========================
   * 5. 동적 iframe 대응
   * ========================= */
  function observeIframeChanges() {
    const observer = new MutationObserver(() => {
      const branch = localStorage.getItem(STORAGE_KEY) || DEFAULT_BRANCH;
      applyThemeToAllIframes(branch);
      bindIframeLoad();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /* =========================
   * 6. 헤더 UI 바인딩
   * ========================= */
  function bindBranchUI() {
    const branchBox = document.querySelector('.branch');
    if (!branchBox) return;

    const trigger = branchBox.querySelector('.select-plant');
    const label = trigger.querySelector('span');
    const list = branchBox.querySelector('.plant-group');

    /* 드롭다운 토글 */
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      list.classList.toggle('active');
    });

    /* 외부 클릭 시 닫기 */
    document.addEventListener('click', () => {
      list.classList.remove('active');
    });

    /* 항목 선택 */
    list.querySelectorAll('span').forEach(item => {
      item.addEventListener('click', () => {
        const text = item.textContent.trim();
        const branch = BRANCH_MAP[text];

        if (!branch) return;

        setBranch(branch);
        list.classList.remove('active');
      });
    });
  }

  /* =========================
   * 7. UI 동기화
   * ========================= */

  // 헤더 텍스트
  function syncHeaderLabel(branch) {
    const label = document.querySelector('.select-plant span');
    if (!label) return;

    const entry = Object.entries(BRANCH_MAP)
      .find(([_, value]) => value === branch);

    if (entry) {
      label.textContent = entry[0];
    }
  }

  // active 상태
  function syncActiveState(branch) {
    document.querySelectorAll('.plant-group span').forEach(item => {
      const text = item.textContent.trim();
      const key = BRANCH_MAP[text];

      item.classList.toggle('active', key === branch);
    });
  }

  /* =========================
   * 8. 실행
   * ========================= */
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    bindBranchUI();
    bindIframeLoad();
    observeIframeChanges();
  });

})();