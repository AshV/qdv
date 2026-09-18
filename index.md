---
layout: default
title: Home
subTitle: A curated collection of Microsoft Dataverse queries
---

<!-- Compact Hero Section -->
<section class="hero-section compact-hero">
    <h1 class="hero-title">
        Execute & Inspect <span class="gradient-text">Dataverse Queries</span>
    </h1>
    <p class="hero-subtitle">
        A curated catalog of frequently used Microsoft Dataverse queries with instant browser execution across FetchXML, Web API OData, and TDS SQL.
    </p>
</section>

<!-- Compact Environment Context Strip -->
<div class="detail-env-manager-strip sticky-env-strip">
    <div class="detail-env-status-side">
        <span class="detail-env-label">Environment:</span>
        <div id="envActiveIndicatorBox" class="env-active-indicator-box">
            <span class="status-dot"></span>
            <span>No active environment</span>
        </div>
    </div>

    <div class="detail-env-pills-side">
        <div class="detail-env-pills-row">
            <!-- Injected dynamically by qdv.js -->
        </div>
        <button class="btn-secondary detail-btn-manage-env" onclick="QDV.env.openModal()" title="Add or manage environments">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add / Manage</span>
        </button>
    </div>
</div>

<!-- Filter & Category Studio -->
<div class="filter-studio">

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
            <button class="category-pill" data-category="Solutions & ALM">
                <span>Solutions & ALM</span>
            </button>
            <button class="category-pill" data-category="Monitoring & Governance">
                <span>Monitoring & Governance</span>
            </button>
        </div>
        <span id="filteredCount" class="filter-results-count">Showing 19 queries</span>
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