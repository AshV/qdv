---
layout: default
title: Home
subTitle: A curated collection of Microsoft Dataverse queries
---

<!-- Hero Section -->
<section class="hero-section">
    <div class="hero-badge">
        <span class="chip-dot"></span>
        <span>Microsoft Dataverse Query Studio</span>
    </div>
    <h1 class="hero-title">
        Execute & Inspect <span class="gradient-text">Dataverse Queries</span>
    </h1>
    <p class="hero-subtitle">
        A curated catalog of frequently used queries with instant browser execution, FetchXML, Web API OData, and TDS SQL definitions.
    </p>
    <div class="hero-stats">
        <div class="stat-chip">
            <span class="chip-dot" style="background: var(--primary);"></span>
            <span>9 Ready Queries</span>
        </div>
        <div class="stat-chip">
            <span class="chip-dot" style="background: var(--accent-cyan);"></span>
            <span>FetchXML · OData · TDS SQL</span>
        </div>
        <div class="stat-chip">
            <span class="chip-dot" style="background: var(--accent-emerald);"></span>
            <span>Direct Browser SSO</span>
        </div>
    </div>
</section>

<!-- Environment Studio Card -->
<section class="env-studio-card">
    <div class="env-header">
        <div class="env-header-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                <line x1="6" y1="6" x2="6.01" y2="6"></line>
                <line x1="6" y1="18" x2="6.01" y2="18"></line>
            </svg>
            <h3>Environment Context</h3>
            <span id="envCountBadge" class="env-count-badge">0 saved</span>
        </div>
        <div id="envActiveIndicatorBox" class="env-active-indicator-box">
            <span class="status-dot"></span>
            <span>No active environment</span>
        </div>
    </div>

    <div class="env-input-wrapper">
        <div class="input-with-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <input id="txtEnv" type="url" placeholder="https://org.crm.dynamics.com" autocomplete="off" spellcheck="false" />
        </div>
        <button id="btnAddEnv" class="btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add Environment</span>
        </button>
    </div>

    <div id="envList" class="env-tags-list">
        <!-- Injected dynamically by qdv.js -->
    </div>

    <p class="env-tip-text">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
        <span>Queries run directly in your browser using your existing authenticated Microsoft Dataverse session.</span>
    </p>
</section>

<!-- Filter & Search Studio -->
<div class="filter-studio">
    <div class="search-bar-row">
        <div class="search-input-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input id="txtSearch" type="search" placeholder="Search queries by title, entity, or keyword..." autocomplete="off" />
            <span class="search-shortcut-hint">/</span>
        </div>
    </div>

    <div class="category-chips-row">
        <div class="category-pills">
            <button class="category-pill active" data-category="all">
                <span>All Queries</span>
            </button>
            <button class="category-pill" data-category="Security & Roles">
                <span>Security & Roles</span>
            </button>
            <button class="category-pill" data-category="Teams & Groups">
                <span>Teams & Groups</span>
            </button>
            <button class="category-pill" data-category="Solutions & Flows">
                <span>Solutions & Flows</span>
            </button>
        </div>
        <span id="filteredCount" class="filter-results-count">Showing 9 queries</span>
    </div>
</div>

<!-- Query Cards Grid -->
<div class="query-grid">
    {% for query in site.pages %}
        {% if query.layout == 'queryPage' %}
        <div class="query-card" 
             data-title="{{ query.title | escape }}" 
             data-desc="{{ query.description | default: '' | escape }}" 
             data-category="{{ query.category | default: 'General' }}" 
             data-entity="{{ query.tablePlural }}"
             data-tags="{{ query.tags | join: ' ' }}">
            
            <div class="card-top-row">
                <span class="entity-badge {{ query.tablePlural }}">{{ query.tablePlural }}</span>
                <div class="format-tags">
                    <span class="format-tag">XML</span>
                    <span class="format-tag">OData</span>
                    <span class="format-tag">SQL</span>
                </div>
            </div>

            <h3 class="query-card-title">
                <a href="{{ query.url | relative_url }}">{{ query.title }}</a>
            </h3>

            <p class="query-card-desc">
                {{ query.description | default: "Click Run to execute against your active Dataverse environment or explore query definitions." }}
            </p>

            <div class="query-actions-bar">
                <button class="btn-primary btn-card-run" onclick="QDV.runQuery('{{ query.queryName }}', '{{ query.tablePlural }}')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    <span>Run</span>
                </button>
                <a href="{{ query.url | relative_url }}" class="btn-secondary btn-card-open">
                    <span>Details</span>
                </a>
                <button class="btn-card-copy" onclick="QDV.copyFetchXmlSnippet('{{ query.queryName }}', event)" title="Copy FetchXML snippet">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
            </div>
        </div>
        {% endif %}
    {% endfor %}

    <!-- Empty Search State -->
    <div id="emptyState" class="empty-state" style="display: none;">
        <div class="empty-state-icon">🔍</div>
        <h3>No queries match your search</h3>
        <p>Try adjusting your search keywords or switching categories.</p>
        <button class="btn-secondary" onclick="QDV.search.clearFilter()">Clear Filters</button>
    </div>
</div>