---
layout: default
title: Query Dataverse
subTitle: A collection of frequently used Microsoft Dataverse queries with a convenient way of executing them.
baseUrl: https://www.ashishvishwakarma.com/qdv/
---

<div class="text-center">
    <h1>{{ page.subTitle }}</h1>
</div>

<div class="env-selector-card" style="margin-top: 2rem;">
    <h3>Environment Selector</h3>
    <p>Select Environment to execute queries directly from this list.</p>
    
    <div class="env-input-group">
        <input id="txtEnv" type="url" placeholder="https://org.crm8.dynamics.com" autofocus />
        <input id="btnAddEnv" type="button" class="btn-primary" value="Add Environment" />
    </div>
    
    <div id="envList" class="env-tags">
        <!-- Tags will be injected here by qdv.js -->
    </div>
</div>

<div style="margin-top: 2rem;">
    {% for query in site.pages %}
        {% if query.layout == 'queryPage' %}
        <article class="query-card-row" style="background: white; padding: 1.5rem; margin-bottom: 1rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; border: 1px solid #eee;">
            <div style="flex-grow: 1;">
                <h4 style="margin: 0; font-weight: 600;">
                    <a href="{{ query.url | relative_url }}" style="text-decoration: none; color: inherit;">{{ query.title }}</a>
                </h4>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn-primary" onclick="QDV.runQuery('{{ query.queryName }}', '{{ query.tablePlural }}')" style="font-size: 0.9rem; padding: 0.5rem 1rem;">
                    Run Query
                </button>
                <a href="{{ query.url | relative_url }}" role="button" class="btn-secondary" style="background: #f0f0f0; color: #333; padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 0.9rem;">
                    Open
                </a>
            </div>
        </article>
        {% endif %}
    {% endfor %}
</div>