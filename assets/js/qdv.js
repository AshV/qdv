/**
 * Query Dataverse (QDV) - Core Application Logic
 * Modern, robust client-side module for environment management, query execution,
 * search & category filtering, syntax highlighting, and theme control.
 */

const QDV = {
    // State
    orgURLs: {},
    activeOrg: null,
    basePath: '',

    init: function () {
        this.detectBasePath();
        this.registerODataLanguage();
        this.theme.init();
        this.env.init();
        this.search.init();
        this.toast.init();
    },

    detectBasePath: function () {
        const metaBase = document.querySelector('meta[name="site-baseurl"]');
        if (metaBase && metaBase.content) {
            this.basePath = metaBase.content.replace(/\/$/, '');
        } else {
            const pathname = window.location.pathname;
            if (pathname.startsWith('/qdv/')) {
                this.basePath = '/qdv';
            } else {
                this.basePath = '';
            }
        }
    },

    // =========================================================================
    // Custom OData Syntax Highlighting Grammar for Highlight.js
    // =========================================================================
    registerODataLanguage: function () {
        if (!window.hljs) return;

        hljs.registerLanguage('odata', function (hljs) {
            return {
                name: 'OData',
                case_insensitive: true,
                keywords: {
                    keyword: 'GET POST PATCH PUT DELETE and or not eq ne gt ge lt le in has any all asc desc',
                    literal: 'true false null',
                    built_in: '$select $filter $expand $top $skip $orderby $count $search $apply $format'
                },
                contains: [
                    {
                        className: 'string',
                        begin: /'/,
                        end: /'/,
                        contains: [{ begin: /''/ }]
                    },
                    {
                        className: 'variable',
                        begin: /\[/,
                        end: /\]/
                    },
                    {
                        className: 'title.function',
                        begin: /[a-zA-Z0-9_.]+(?=\()/
                    },
                    {
                        className: 'number',
                        begin: /\b\d+(\.\d+)?\b/
                    },
                    {
                        className: 'symbol',
                        begin: /[$&?]/
                    },
                    {
                        className: 'params',
                        begin: /\b[a-zA-Z_][a-zA-Z0-9_]*(?==)/
                    },
                    hljs.C_LINE_COMMENT_MODE,
                    hljs.C_BLOCK_COMMENT_MODE
                ]
            };
        });
    },

    // =========================================================================
    // Theme Management
    // =========================================================================
    theme: {
        init: function () {
            const savedTheme = localStorage.getItem('theme');
            let theme = savedTheme;
            if (!theme) {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                theme = prefersDark ? 'dark' : 'light';
            }
            this.applyTheme(theme);
        },

        toggle: function () {
            const current = document.documentElement.getAttribute('data-theme') || 'light';
            const next = current === 'dark' ? 'light' : 'dark';
            this.applyTheme(next);
            localStorage.setItem('theme', next);
        },

        applyTheme: function (theme) {
            document.documentElement.setAttribute('data-theme', theme);
            const btn = document.getElementById('themeToggleBtn');
            if (btn) {
                if (theme === 'dark') {
                    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
                    btn.title = 'Switch to Light Mode';
                } else {
                    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
                    btn.title = 'Switch to Dark Mode';
                }
            }
        }
    },

    // =========================================================================
    // Environment Management
    // =========================================================================
    env: {
        init: function () {
            try {
                const storedOrgs = localStorage.getItem('lsOrgURLs');
                if (storedOrgs) {
                    QDV.orgURLs = JSON.parse(storedOrgs);
                }
                const storedActive = localStorage.getItem('qdv_active_env');
                if (storedActive && QDV.orgURLs[storedActive]) {
                    QDV.activeOrg = storedActive;
                } else {
                    const keys = Object.keys(QDV.orgURLs);
                    if (keys.length > 0) {
                        QDV.activeOrg = keys[0];
                    }
                }
            } catch (e) {
                console.error('Error loading environments from localStorage', e);
            }

            this.setupListeners();
            this.render();
        },

        cleanUrl: function (raw) {
            if (!raw || typeof raw !== 'string') return '';
            let val = raw.trim().replace(/^["'<(\[]+|[>"')\]]+$/g, '').trim();
            if (!val) return '';

            const hasProtocol = /^https?:\/\//i.test(val);
            const hasDomainPattern = /[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/i.test(val) || /^localhost(:\d+)?/i.test(val);

            if (!hasProtocol && !hasDomainPattern) {
                return val;
            }

            if (!hasProtocol) {
                val = 'https://' + val;
            }

            try {
                const url = new URL(val);
                if (url.hostname && (url.hostname.includes('.') || url.hostname === 'localhost')) {
                    return url.origin;
                }
            } catch (e) {
                const match = val.match(/^(https?:\/\/[^\/?#]+)/i);
                if (match) return match[1];
            }

            return val.replace(/[?#].*$/, '').replace(/\/+$/, '');
        },

        bindPasteCleaner: function (input) {
            if (!input) return;

            // Immediately sanitize pasted URL on 'paste' event
            input.addEventListener('paste', (e) => {
                const clipboardData = e.clipboardData || window.clipboardData;
                const pastedText = clipboardData ? clipboardData.getData('text') : '';
                if (pastedText) {
                    const cleaned = this.cleanUrl(pastedText);
                    if (cleaned) {
                        e.preventDefault();
                        input.value = cleaned;
                        input.dispatchEvent(new Event('input', { bubbles: true }));

                        input.classList.add('url-auto-cleaned');
                        setTimeout(() => input.classList.remove('url-auto-cleaned'), 600);
                    }
                }
            });

            // Also clean on input if pasted via mobile context menu or dragged
            input.addEventListener('input', () => {
                const cur = input.value;
                if (cur && (cur.includes('?') || cur.includes('#') || cur.includes('/main.aspx') || cur.includes('/api/'))) {
                    const cleaned = this.cleanUrl(cur);
                    if (cleaned && cleaned !== cur) {
                        input.value = cleaned;
                    }
                }
            });

            // Clean on blur or change
            input.addEventListener('change', () => {
                if (input.value && input.value.trim()) {
                    const cleaned = this.cleanUrl(input.value);
                    if (cleaned && cleaned !== input.value.trim()) {
                        input.value = cleaned;
                    }
                }
            });
        },

        setupListeners: function () {
            // Homepage Add Button
            const addBtn = document.getElementById('btnAddEnv');
            const envInput = document.getElementById('txtEnv');

            if (addBtn && envInput) {
                addBtn.onclick = () => this.handleAdd(envInput);
                envInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        this.handleAdd(envInput);
                    }
                });
            }

            // Modal Add Button
            const modalAddBtn = document.getElementById('btnModalAddEnv');
            const modalEnvInput = document.getElementById('txtModalEnv');
            if (modalAddBtn && modalEnvInput) {
                modalAddBtn.onclick = () => this.handleModalAdd();
                modalEnvInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        this.handleModalAdd();
                    }
                });
            }

            // Bind instant paste cleaner to environment inputs
            this.bindPasteCleaner(envInput);
            this.bindPasteCleaner(modalEnvInput);

            // Header Environment Indicator opens modal everywhere
            const navIndicator = document.getElementById('navEnvIndicator');
            if (navIndicator) {
                navIndicator.onclick = () => {
                    this.openModal();
                };
            }

            // Keyboard Escape closes modal
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeModal();
                }
            });
        },

        openModal: function () {
            const modal = document.getElementById('envModal');
            if (modal) {
                modal.classList.add('open');
                const input = document.getElementById('txtModalEnv');
                if (input) {
                    setTimeout(() => input.focus(), 50);
                }
                this.render();
            }
        },

        closeModal: function () {
            const modal = document.getElementById('envModal');
            if (modal) {
                modal.classList.remove('open');
            }
        },

        isValidURL: function (str) {
            if (!str || typeof str !== 'string') return false;
            const cleaned = this.cleanUrl(str);
            try {
                const url = new URL(cleaned);
                return url.hostname.length > 3 && (url.hostname.includes('.') || url.hostname === 'localhost');
            } catch (e) {
                return false;
            }
        },

        formatURL: function (raw) {
            return this.cleanUrl(raw);
        },

        handleAdd: function (inputElement) {
            if (!inputElement) return;

            const val = this.cleanUrl(inputElement.value);
            if (!this.isValidURL(val)) {
                QDV.toast.show('Please enter a valid URL (e.g., https://org.crm.dynamics.com)', 'error');
                inputElement.focus();
                return;
            }

            try {
                const formatted = this.formatURL(val);
                const url = new URL(formatted);
                let orgName = url.hostname.split('.')[0];
                if (orgName.toLowerCase() === 'www' || orgName.length <= 1) {
                    orgName = url.hostname;
                }

                QDV.orgURLs[orgName] = formatted;
                QDV.activeOrg = orgName;

                this.save();
                this.render();

                inputElement.value = '';
                QDV.toast.show(`Environment "${orgName}" added and activated!`, 'success');
            } catch (e) {
                QDV.toast.show('Error parsing environment URL.', 'error');
            }
        },

        handleModalAdd: function () {
            const input = document.getElementById('txtModalEnv');
            if (!input) return;
            this.handleAdd(input);
        },

        select: function (key) {
            if (QDV.orgURLs[key]) {
                QDV.activeOrg = key;
                this.save();
                this.render();
                QDV.toast.show(`Switched to "${key}"`, 'info');
            }
        },

        remove: function (key, event) {
            if (event) event.stopPropagation();
            if (!QDV.orgURLs[key]) return;

            delete QDV.orgURLs[key];
            if (QDV.activeOrg === key) {
                const remaining = Object.keys(QDV.orgURLs);
                QDV.activeOrg = remaining.length > 0 ? remaining[0] : null;
            }

            this.save();
            this.render();
            QDV.toast.show(`Removed "${key}"`, 'info');
        },

        copyUrl: function (key, event) {
            if (event) event.stopPropagation();
            const url = QDV.orgURLs[key];
            if (!url) return;

            navigator.clipboard.writeText(url).then(() => {
                QDV.toast.show(`Copied URL for ${key}`, 'success');
            });
        },

        save: function () {
            localStorage.setItem('lsOrgURLs', JSON.stringify(QDV.orgURLs));
            if (QDV.activeOrg) {
                localStorage.setItem('qdv_active_env', QDV.activeOrg);
            } else {
                localStorage.removeItem('qdv_active_env');
            }
        },

        renderPillsHTML: function (keys) {
            if (keys.length === 0) {
                return `<span style="color: var(--text-subtle); font-size: 0.85rem; padding: 0.25rem 0;">No environments added yet.</span>`;
            }

            let html = '';
            keys.forEach(key => {
                const url = QDV.orgURLs[key];
                const isSelected = key === QDV.activeOrg;
                html += `
                    <div class="env-pill ${isSelected ? 'selected' : ''}" 
                         onclick="QDV.env.select('${key}')" 
                         title="${url}">
                        <span class="env-pill-status"></span>
                        <span class="env-pill-name">${key}</span>
                        <span class="env-pill-action" onclick="QDV.env.copyUrl('${key}', event)" title="Copy URL">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </span>
                        <span class="env-pill-action" onclick="QDV.env.remove('${key}', event)" title="Remove environment">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </span>
                    </div>
                `;
            });
            return html;
        },

        renderDetailPillsHTML: function (keys) {
            if (keys.length === 0) {
                return `<span style="color: var(--text-subtle); font-size: 0.8rem;">No saved environments</span>`;
            }

            let html = '';
            keys.forEach(key => {
                const url = QDV.orgURLs[key];
                const isSelected = key === QDV.activeOrg;
                html += `
                    <div class="env-pill ${isSelected ? 'selected' : ''}" 
                         onclick="QDV.env.select('${key}')" 
                         title="${url}" style="padding: 0.25rem 0.65rem; font-size: 0.8rem;">
                        <span class="env-pill-status"></span>
                        <span class="env-pill-name">${key}</span>
                    </div>
                `;
            });
            return html;
        },

        render: function () {
            const keys = Object.keys(QDV.orgURLs);

            // 1. Render in Global Modal (#modalEnvList)
            const modalContainer = document.getElementById('modalEnvList');
            const modalCount = document.getElementById('modalEnvCount');
            if (modalCount) {
                modalCount.textContent = `${keys.length} saved`;
            }
            if (modalContainer) {
                modalContainer.innerHTML = this.renderPillsHTML(keys);
            }

            // 2. Render in all compact pill rows on Homepage & Query Detail Page (.detail-env-pills-row)
            const pillRows = document.querySelectorAll('.detail-env-pills-row');
            pillRows.forEach(row => {
                row.innerHTML = this.renderDetailPillsHTML(keys);
            });

            // 4. Update Active Indicator Boxes (Home + Detail Page)
            const activeBoxes = document.querySelectorAll('#envActiveIndicatorBox');
            activeBoxes.forEach(box => {
                if (QDV.activeOrg && QDV.orgURLs[QDV.activeOrg]) {
                    box.className = 'env-active-indicator-box active';
                    box.innerHTML = `<span class="status-dot"></span> Active: <strong>${QDV.activeOrg}</strong>`;
                } else {
                    box.className = 'env-active-indicator-box';
                    box.innerHTML = `<span class="status-dot"></span> No active environment`;
                }
            });

            // 5. Update Navbar Indicator
            this.renderNavIndicator();
        },

        renderNavIndicator: function () {
            const indicator = document.getElementById('navEnvIndicator');
            if (!indicator) return;

            if (QDV.activeOrg && QDV.orgURLs[QDV.activeOrg]) {
                indicator.className = 'nav-env-indicator active';
                indicator.innerHTML = `
                    <span class="status-dot"></span>
                    <span class="env-label">${QDV.activeOrg}</span>
                `;
                indicator.title = `Active Environment: ${QDV.orgURLs[QDV.activeOrg]} (Click to change)`;
            } else {
                indicator.className = 'nav-env-indicator';
                indicator.innerHTML = `
                    <span class="status-dot"></span>
                    <span class="env-label">Set Environment</span>
                `;
                indicator.title = 'No active environment selected. Click to add or choose one.';
            }
        },

        getActiveUrl: function () {
            if (QDV.activeOrg && QDV.orgURLs[QDV.activeOrg]) {
                return QDV.orgURLs[QDV.activeOrg];
            }
            return null;
        }
    },

    // =========================================================================
    // Query Execution Runner
    // =========================================================================
    runQuery: async function (queryName, tablePlural) {
        const activeUrl = this.env.getActiveUrl();

        if (!activeUrl) {
            QDV.toast.show('Please select or add a Dataverse environment first!', 'error');
            this.env.openModal();
            return;
        }

        try {
            QDV.toast.show('Loading query definition...', 'info');
            const xml = await this.fetchQueryFile(queryName, 'fetch.xml');
            if (!xml) throw new Error('Query file is empty');

            const endpoint = `${activeUrl}/api/data/v9.2/${tablePlural}?fetchXml=${encodeURIComponent(xml)}`;
            window.open(endpoint, '_blank');
            QDV.toast.show('Query opened in new tab!', 'success');
        } catch (e) {
            console.error('Error running query', e);
            QDV.toast.show('Failed to load query definition. Please check console.', 'error');
        }
    },

    fetchQueryFile: async function (queryName, fileName) {
        const relativeUrl = `${this.basePath}/Queries/${queryName}/${fileName}`;
        try {
            const resp = await fetch(relativeUrl);
            if (resp.ok) {
                return await resp.text();
            }
        } catch (err) {
            // fallback below
        }

        const rawUrl = `https://raw.githubusercontent.com/AshV/qdv/main/Queries/${queryName}/${fileName}`;
        const resp2 = await fetch(rawUrl);
        if (resp2.ok) {
            return await resp2.text();
        }
        throw new Error(`Unable to fetch ${fileName}`);
    },

    // =========================================================================
    // Query Detail Page Engine
    // =========================================================================
    detail: {
        queryName: '',
        tablePlural: '',
        contents: {
            fetchXml: '',
            webApi: '',
            sql: ''
        },

        init: function (queryName, tablePlural) {
            this.queryName = queryName;
            this.tablePlural = tablePlural;

            // Ensure custom syntax modes are ready
            QDV.registerODataLanguage();

            this.setupTabs();
            this.loadAllFiles();
        },

        setupTabs: function () {
            const tabButtons = document.querySelectorAll('.code-tab-btn');
            tabButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    tabButtons.forEach(b => b.classList.remove('active'));
                    document.querySelectorAll('.code-pane-content').forEach(p => p.classList.remove('active'));

                    btn.classList.add('active');
                    const targetId = btn.getAttribute('data-target');
                    const targetPane = document.getElementById(targetId);
                    if (targetPane) targetPane.classList.add('active');

                    const fileName = btn.getAttribute('data-filename');
                    const fileBadge = document.getElementById('codeFileBadge');
                    if (fileBadge && fileName) {
                        fileBadge.textContent = fileName;
                    }
                });
            });

            const btnCopy = document.getElementById('btnCopyActiveCode');
            if (btnCopy) {
                btnCopy.addEventListener('click', () => this.copyActiveCode());
            }

            const btnDownload = document.getElementById('btnDownloadActiveCode');
            if (btnDownload) {
                btnDownload.addEventListener('click', () => this.downloadActiveCode());
            }
        },

        loadAllFiles: async function () {
            const files = [
                { id: 'codeFetchXML', name: 'fetch.xml', key: 'fetchXml' },
                { id: 'codeWebAPI', name: 'webapi.odata', key: 'webApi' },
                { id: 'codeSQL', name: 'tds.sql', key: 'sql' }
            ];

            for (const file of files) {
                const container = document.getElementById(file.id);
                if (!container) continue;

                try {
                    const text = await QDV.fetchQueryFile(this.queryName, file.name);
                    this.contents[file.key] = text;
                    container.textContent = text;
                    if (window.hljs) {
                        hljs.highlightElement(container);
                    }
                } catch (e) {
                    container.textContent = `// Error loading ${file.name}.\n// Check your network connection.`;
                }
            }
        },

        getActiveSnippet: function () {
            const activeBtn = document.querySelector('.code-tab-btn.active');
            if (!activeBtn) return { text: '', filename: 'query.txt' };
            const filename = activeBtn.getAttribute('data-filename') || 'query.txt';
            const targetId = activeBtn.getAttribute('data-target');
            const pane = document.getElementById(targetId);
            const codeElem = pane ? pane.querySelector('code') : null;
            return {
                text: codeElem ? codeElem.textContent : '',
                filename: filename
            };
        },

        copyActiveCode: function () {
            const { text } = this.getActiveSnippet();
            if (!text) return;
            navigator.clipboard.writeText(text).then(() => {
                const btn = document.getElementById('btnCopyActiveCode');
                if (btn) {
                    const originalText = btn.innerHTML;
                    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!`;
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                    }, 2000);
                }
                QDV.toast.show('Code copied to clipboard!', 'success');
            });
        },

        downloadActiveCode: function () {
            const { text, filename } = this.getActiveSnippet();
            if (!text) return;
            const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.queryName}-${filename}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            QDV.toast.show(`Downloading ${filename}`, 'info');
        }
    },

    // =========================================================================
    // Home Page Live Search & Category Filtering
    // =========================================================================
    search: {
        activeCategory: 'all',
        searchTerm: '',

        init: function () {
            const searchInput = document.getElementById('txtSearch');
            const categoryPills = document.querySelectorAll('.category-pill');

            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.searchTerm = e.target.value.toLowerCase().trim();
                    this.applyFilter();
                });

                document.addEventListener('keydown', (e) => {
                    if (e.key === '/' && document.activeElement !== searchInput && document.activeElement.tagName !== 'INPUT') {
                        e.preventDefault();
                        searchInput.focus();
                    } else if (e.key === 'Escape' && document.activeElement === searchInput) {
                        searchInput.value = '';
                        this.searchTerm = '';
                        this.applyFilter();
                        searchInput.blur();
                    }
                });
            }

            if (categoryPills.length > 0) {
                categoryPills.forEach(pill => {
                    pill.addEventListener('click', () => {
                        categoryPills.forEach(p => p.classList.remove('active'));
                        pill.classList.add('active');
                        this.activeCategory = pill.getAttribute('data-category') || 'all';
                        this.applyFilter();
                    });
                });
            }
        },

        applyFilter: function () {
            const cards = document.querySelectorAll('.query-card');
            const emptyState = document.getElementById('emptyState');
            const countDisplay = document.getElementById('filteredCount');

            let visibleCount = 0;

            cards.forEach(card => {
                const title = (card.getAttribute('data-title') || '').toLowerCase();
                const desc = (card.getAttribute('data-desc') || '').toLowerCase();
                const category = card.getAttribute('data-category') || '';
                const entity = (card.getAttribute('data-entity') || '').toLowerCase();
                const tags = (card.getAttribute('data-tags') || '').toLowerCase();

                const matchesSearch = !this.searchTerm ||
                    title.includes(this.searchTerm) ||
                    desc.includes(this.searchTerm) ||
                    entity.includes(this.searchTerm) ||
                    tags.includes(this.searchTerm);

                const matchesCategory = this.activeCategory === 'all' || category === this.activeCategory;

                if (matchesSearch && matchesCategory) {
                    card.style.display = 'flex';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            if (countDisplay) {
                countDisplay.textContent = `Showing ${visibleCount} of ${cards.length} queries`;
            }

            if (emptyState) {
                emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
            }
        },

        clearFilter: function () {
            const searchInput = document.getElementById('txtSearch');
            if (searchInput) searchInput.value = '';
            this.searchTerm = '';

            const allPill = document.querySelector('.category-pill[data-category="all"]');
            if (allPill) {
                document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
                allPill.classList.add('active');
                this.activeCategory = 'all';
            }

            this.applyFilter();
        }
    },

    // =========================================================================
    // Quick Copy FetchXML from Card
    // =========================================================================
    copyFetchXmlSnippet: async function (queryName, event) {
        if (event) event.stopPropagation();
        try {
            const xml = await this.fetchQueryFile(queryName, 'fetch.xml');
            await navigator.clipboard.writeText(xml);
            QDV.toast.show('FetchXML copied to clipboard!', 'success');
        } catch (e) {
            QDV.toast.show('Failed to copy FetchXML.', 'error');
        }
    },

    // =========================================================================
    // Toast Notification System
    // =========================================================================
    toast: {
        container: null,

        init: function () {
            let elem = document.getElementById('toast-container');
            if (!elem) {
                elem = document.createElement('div');
                elem.id = 'toast-container';
                document.body.appendChild(elem);
            }
            this.container = elem;
        },

        show: function (message, type = 'info') {
            if (!this.container) this.init();

            const toast = document.createElement('div');
            toast.className = `toast ${type}`;

            let iconSvg = '';
            if (type === 'success') {
                iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            } else if (type === 'error') {
                iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
            } else {
                iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
            }

            toast.innerHTML = `${iconSvg} <span>${message}</span>`;
            this.container.appendChild(toast);

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(10px) scale(0.95)';
                toast.style.transition = 'all 0.2s ease-out';
                setTimeout(() => {
                    if (toast.parentElement) toast.parentElement.removeChild(toast);
                }, 200);
            }, 3000);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    QDV.init();
});
