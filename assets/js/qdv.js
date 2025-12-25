const QDV = {
    orgURLs: {},
    orgURLInput: null,
    envListContainer: null,

    init: function () {
        this.initTheme(); // Initialize theme first

        this.orgURLInput = document.querySelector("#txtEnv");
        this.envListContainer = document.querySelector("#envList");

        if (localStorage.getItem("lsOrgURLs") !== null) {
            this.orgURLs = JSON.parse(localStorage.getItem("lsOrgURLs"));
            this.renderOrgList();
        }

        // Setup Event Listeners if elements exist
        const addBtn = document.querySelector("#btnAddEnv");
        const envInput = document.querySelector("#txtEnv");

        if (addBtn && envInput) {
            addBtn.onclick = () => this.addEnvironment();
            envInput.onchange = () => this.validateAndFormatInput();
        }
    },

    isValidURL: function (str) {
        const regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
        return regexp.test(str);
    },

    validateAndFormatInput: function () {
        if (!this.orgURLInput.value.length) return;

        if (this.isValidURL(this.orgURLInput.value)) {
            try {
                const url = new URL(this.orgURLInput.value);
                this.orgURLInput.value = url.origin;
            } catch (e) {
                // Keep as is if URL parsing fails but regex passed (rare)
            }
        } else {
            alert("Please enter a valid URL.");
        }
    },

    addEnvironment: function () {
        if (this.isValidURL(this.orgURLInput.value)) {
            try {
                let url = new URL(this.orgURLInput.value);
                this.orgURLInput.value = url.origin;
                let orgName = url.hostname.split('.')[0];
                this.orgURLs[orgName] = url.origin;
                localStorage.setItem("lsOrgURLs", JSON.stringify(this.orgURLs));
                this.renderOrgList();
                this.orgURLInput.value = "";
            } catch (e) {
                console.error(e);
                alert("Error parsing URL.");
            }
        } else {
            alert("Please enter a valid URL.");
        }
    },

    removeEnvironment: function (key) {
        delete this.orgURLs[key];
        localStorage.setItem("lsOrgURLs", JSON.stringify(this.orgURLs));
        this.renderOrgList();
    },

    setCurrentEnvironment: function (envElement) {
        // Update input value
        if (this.orgURLInput) {
            this.orgURLInput.value = envElement.getAttribute('value');
        }

        // UI Highlighting
        document.querySelectorAll(".env-tag").forEach(elem => elem.style.border = "none");
        envElement.style.border = "2px solid var(--primary-color)";
    },

    renderOrgList: function () {
        if (!this.envListContainer) return;

        let orgsHTML = '';
        for (let [key, value] of Object.entries(this.orgURLs)) {
            orgsHTML += `<div class="env-tag" onclick="QDV.setCurrentEnvironment(this);" value="${value}" title="${value}">
                            ${key}
                            <span class="remove" onclick="event.stopPropagation(); QDV.removeEnvironment('${key}')">×</span>
                         </div>`;
        }
        this.envListContainer.innerHTML = orgsHTML;
    },

    // Theme Logic
    initTheme: function () {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    },

    toggleTheme: function () {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
    },

    updateThemeIcon: function (theme) {
        const btn = document.getElementById('themeToggleBtn');
        if (btn) {
            btn.textContent = theme === 'dark' ? '☀️' : '🌙';
            btn.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
        }
    },

    runQuery: async function (queryName, tablePlural) {
        const currentEnvUrl = this.orgURLInput ? this.orgURLInput.value : "";

        if (!currentEnvUrl || !this.isValidURL(currentEnvUrl)) {
            alert("Please select or enter a valid organization URL first.");
            if (this.orgURLInput) this.orgURLInput.focus();
            return;
        }

        try {
            // Fetch the FetchXML content
            const response = await fetch(`https://raw.githubusercontent.com/AshV/QueryDataverse/main/Queries/${queryName}/fetch.xml`);
            if (!response.ok) throw new Error("Failed to fetch query definition");
            const queryXml = await response.text();

            // Construct the execution URL
            const executeUrl = `${currentEnvUrl}/api/data/v9.2/${tablePlural}?fetchXml=${encodeURIComponent(queryXml)}`;

            // Open in new tab
            window.open(executeUrl, '_blank');
        } catch (error) {
            console.error(error);
            alert("Failed to load query definition. Please try again.");
        }
    }
};

document.addEventListener("DOMContentLoaded", function () {
    QDV.init();
});
