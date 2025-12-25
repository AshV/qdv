---
layout: default
title: Query Dataverse
subTitle: A collection of frequently used Microsoft Dataverse queries
baseUrl: https://www.ashishvishwakarma.com/qdv/
---

<div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem;">
    <div>
        <h1 style="font-size: 2rem; margin: 0;">Query Dataverse</h1>
        <p style="margin: 0.5rem 0 0; color: var(--text-muted);">{{ page.subTitle }}</p>
    </div>
</div>

<div class="env-selector-card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
         <h3 style="margin:0;">Environment Context</h3>
         <small style="color: var(--text-muted)">Select active environment</small>
    </div>
    
    <div class="env-input-group">
        <input id="txtEnv" type="url" placeholder="https://org.crm.dynamics.com" />
        <button id="btnAddEnv" class="btn-primary">Add</button>
    </div>
    
    <div id="envList" class="env-tags">
        <!-- Tags injected by qdv.js -->
    </div>
</div>

<div class="query-grid">
    {% for query in site.pages %}
        {% if query.layout == 'queryPage' %}
        <div class="query-card">
            <h4>
                <a href="{{ query.url | relative_url }}">{{ query.title }}</a>
            </h4>
            <div class="query-actions">
                <button class="btn-primary" onclick="QDV.runQuery('{{ query.queryName }}', '{{ query.tablePlural }}')" style="flex: 1;">
                    Run
                </button>
                <a href="{{ query.url | relative_url }}" class="btn-secondary" style="flex: 1; text-align: center;">
                    Open
                </a>
            </div>
        </div>
        {% endif %}
    {% endfor %}
</div>