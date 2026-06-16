// Portfolio Admin - GitHub API CMS
// Uses GitHub Contents API to read/write portfolio.json directly in the repo

let portfolioData = {};
let githubToken = '';
let repoName = '';
let branchName = 'main';
let fileSha = '';
let isDirty = false;
const JSON_PATH = 'backend/data/portfolio.json';

// ─── DOM Elements ───
const loginPage = document.getElementById('login-page');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const notification = document.getElementById('notification');
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menu-toggle');
const logoutBtn = document.getElementById('logout-btn');
const saveAllBtn = document.getElementById('save-all-btn');
const repoDisplay = document.getElementById('repo-display');

// ─── Initialize ───
document.addEventListener('DOMContentLoaded', () => {
    // Check if token is saved in localStorage
    const saved = localStorage.getItem('portfolio-cms');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            githubToken = data.token;
            repoName = data.repo;
            branchName = data.branch || 'main';
            connectToGitHub();
        } catch(e) {
            showLogin();
        }
    } else {
        showLogin();
    }
    setupEventListeners();
});

function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    saveAllBtn.addEventListener('click', pushToGitHub);
    menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));

    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchSection(link.dataset.section);
            sidebar.classList.remove('open');
        });
    });

    // Track changes on all inputs
    document.addEventListener('input', () => {
        isDirty = true;
        saveAllBtn.style.display = 'inline-flex';
    });

    // Theme toggle
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const current = localStorage.getItem('admin-theme') || 'dark';
            const next = current === 'dark' ? 'light' : 'dark';
            localStorage.setItem('admin-theme', next);
            applyTheme(next);
        });
        applyTheme(localStorage.getItem('admin-theme') || 'dark');
    }
}

function applyTheme(theme) {
    const btn = document.getElementById('theme-toggle-btn');
    if (theme === 'light') {
        document.body.classList.add('light-mode');
        if (btn) btn.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        document.body.classList.remove('light-mode');
        if (btn) btn.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// ─── GitHub API ───
function githubHeaders() {
    return {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
    };
}

async function handleLogin(e) {
    e.preventDefault();
    githubToken = document.getElementById('github-token').value.trim();
    repoName = document.getElementById('repo-name').value.trim();
    branchName = document.getElementById('branch-name').value.trim() || 'main';
    loginError.style.display = 'none';

    if (!githubToken || !repoName) {
        loginError.textContent = 'Please fill all fields';
        loginError.style.display = 'block';
        return;
    }

    await connectToGitHub();
}

async function connectToGitHub() {
    try {
        // Test token by fetching the file
        const res = await fetch(
            `https://api.github.com/repos/${repoName}/contents/${JSON_PATH}?ref=${branchName}`,
            { headers: githubHeaders() }
        );

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Failed to connect');
        }

        const fileData = await res.json();
        fileSha = fileData.sha;
        portfolioData = JSON.parse(atob(fileData.content));

        // Save credentials
        localStorage.setItem('portfolio-cms', JSON.stringify({
            token: githubToken,
            repo: repoName,
            branch: branchName
        }));

        showDashboard();
    } catch (err) {
        loginError.textContent = 'Connection failed: ' + err.message;
        loginError.style.display = 'block';
        showLogin();
    }
}

async function pushToGitHub() {
    if (!isDirty) {
        showNotification('No changes to push', 'error');
        return;
    }

    saveAllBtn.disabled = true;
    saveAllBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Pushing...';

    try {
        collectFormData();

        const content = btoa(unescape(encodeURIComponent(JSON.stringify(portfolioData, null, 2))));
        
        const res = await fetch(
            `https://api.github.com/repos/${repoName}/contents/${JSON_PATH}`,
            {
                method: 'PUT',
                headers: githubHeaders(),
                body: JSON.stringify({
                    message: `Update portfolio via Admin CMS - ${new Date().toISOString().split('T')[0]}`,
                    content: content,
                    sha: fileSha,
                    branch: branchName
                })
            }
        );

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Push failed');
        }

        const result = await res.json();
        fileSha = result.content.sha;
        isDirty = false;
        saveAllBtn.style.display = 'none';
        showNotification('Changes pushed to GitHub! Portfolio will update in ~2 minutes.');
    } catch (err) {
        showNotification('Push failed: ' + err.message, 'error');
    } finally {
        saveAllBtn.disabled = false;
        saveAllBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Push to GitHub';
    }
}

function handleLogout() {
    localStorage.removeItem('portfolio-cms');
    githubToken = '';
    repoName = '';
    fileSha = '';
    portfolioData = {};
    showLogin();
}

function showLogin() {
    loginPage.style.display = 'flex';
    dashboard.style.display = 'none';
}

function showDashboard() {
    loginPage.style.display = 'none';
    dashboard.style.display = 'block';
    repoDisplay.textContent = repoName;
    populateAllFields();
}

// ─── Navigation ───
function switchSection(section) {
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
    document.querySelector(`.sidebar-nav a[data-section="${section}"]`).classList.add('active');
    document.querySelectorAll('.section-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`section-${section}`).classList.add('active');
    document.getElementById('page-title').textContent = 
        document.querySelector(`.sidebar-nav a[data-section="${section}"]`).textContent.trim();
}

// ─── Notifications ───
function showNotification(message, type = 'success') {
    notification.className = `notification ${type}`;
    notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
    notification.style.display = 'flex';
    setTimeout(() => { notification.style.display = 'none'; }, 5000);
}

function markDirty() {
    isDirty = true;
    saveAllBtn.style.display = 'inline-flex';
    showNotification('Changes marked. Click "Push to GitHub" to save.');
}

// ─── Populate Fields ───
function populateAllFields() {
    document.getElementById('field-name').value = portfolioData.name || '';
    document.getElementById('field-designation').value = portfolioData.designation || '';
    document.getElementById('field-tagline').value = portfolioData.about?.tagline || '';
    document.getElementById('field-highlights').value = (portfolioData.about?.highlights || []).join('\n');
    renderStats();
    renderSkills();
    renderProjects();
    renderExperience();
    renderCertifications();
    renderEducation();
    document.getElementById('field-whatsapp').value = portfolioData.socialLinks?.whatsapp || '';
    document.getElementById('field-linkedin').value = portfolioData.socialLinks?.linkedin || '';
    document.getElementById('field-github').value = portfolioData.socialLinks?.github || '';
    document.getElementById('field-hackerrank').value = portfolioData.socialLinks?.hackerrank || '';
    document.getElementById('field-contact-name').value = portfolioData.contact?.name || '';
    document.getElementById('field-contact-location').value = portfolioData.contact?.location || '';
    document.getElementById('field-contact-email').value = portfolioData.contact?.email || '';
    document.getElementById('field-contact-phone').value = portfolioData.contact?.phone || '';
}

function collectFormData() {
    portfolioData.name = document.getElementById('field-name').value;
    portfolioData.designation = document.getElementById('field-designation').value;
    if (!portfolioData.about) portfolioData.about = {};
    portfolioData.about.tagline = document.getElementById('field-tagline').value;
    portfolioData.about.highlights = document.getElementById('field-highlights').value.split('\n').filter(s => s.trim());
    if (!portfolioData.socialLinks) portfolioData.socialLinks = {};
    portfolioData.socialLinks.whatsapp = document.getElementById('field-whatsapp').value;
    portfolioData.socialLinks.linkedin = document.getElementById('field-linkedin').value;
    portfolioData.socialLinks.github = document.getElementById('field-github').value;
    portfolioData.socialLinks.hackerrank = document.getElementById('field-hackerrank').value;
    if (!portfolioData.contact) portfolioData.contact = {};
    portfolioData.contact.name = document.getElementById('field-contact-name').value;
    portfolioData.contact.location = document.getElementById('field-contact-location').value;
    portfolioData.contact.email = document.getElementById('field-contact-email').value;
    portfolioData.contact.phone = document.getElementById('field-contact-phone').value;
}

// ─── Stats ───
function renderStats() {
    const container = document.getElementById('stats-list');
    const stats = portfolioData.about?.stats || [];
    container.innerHTML = stats.map((stat, i) => `
        <div class="list-item">
            <div class="item-header">
                <h4>${stat.label || 'Stat ' + (i + 1)}</h4>
                <button class="remove-btn" onclick="removeStat(${i})"><i class="fas fa-trash"></i></button>
            </div>
            <div class="form-row-3">
                <div class="form-group">
                    <label>Icon</label>
                    <input type="text" value="${stat.icon || ''}" onchange="updateStat(${i},'icon',this.value)" placeholder="fas fa-bolt">
                </div>
                <div class="form-group">
                    <label>Number</label>
                    <input type="text" value="${stat.number || ''}" onchange="updateStat(${i},'number',this.value)">
                </div>
                <div class="form-group">
                    <label>Label</label>
                    <input type="text" value="${stat.label || ''}" onchange="updateStat(${i},'label',this.value)">
                </div>
            </div>
        </div>
    `).join('');
}
function addStat() {
    if (!portfolioData.about) portfolioData.about = {};
    if (!portfolioData.about.stats) portfolioData.about.stats = [];
    portfolioData.about.stats.push({ icon: 'fas fa-bolt', number: '', label: '' });
    renderStats(); markDirty();
}
function updateStat(i, f, v) { portfolioData.about.stats[i][f] = v; markDirty(); }
function removeStat(i) { portfolioData.about.stats.splice(i, 1); renderStats(); markDirty(); }

// ─── Skills ───
function renderSkills() {
    const container = document.getElementById('skills-list');
    const skills = portfolioData.skills || [];
    container.innerHTML = skills.map((cat, i) => `
        <div class="list-item">
            <div class="item-header">
                <h4>${cat.title || 'Category ' + (i + 1)}</h4>
                <button class="remove-btn" onclick="removeSkill(${i})"><i class="fas fa-trash"></i></button>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Icon</label><input type="text" value="${cat.icon||''}" onchange="updateSkill(${i},'icon',this.value)"></div>
                <div class="form-group"><label>Title</label><input type="text" value="${cat.title||''}" onchange="updateSkill(${i},'title',this.value)"></div>
            </div>
            <div class="form-group"><label>Skills (one per line)</label><textarea class="desc-textarea" onchange="updateSkill(${i},'items',this.value)">${(cat.items||[]).join('\n')}</textarea></div>
        </div>
    `).join('');
}
function addSkillCategory() {
    if (!portfolioData.skills) portfolioData.skills = [];
    portfolioData.skills.push({ icon: 'fas fa-code', title: '', items: [] });
    renderSkills(); markDirty();
}
function updateSkill(i, f, v) {
    if (f === 'items') portfolioData.skills[i].items = v.split('\n').filter(s => s.trim());
    else portfolioData.skills[i][f] = v;
    markDirty();
}
function removeSkill(i) { portfolioData.skills.splice(i, 1); renderSkills(); markDirty(); }

// ─── Projects ───
function renderProjects() {
    const container = document.getElementById('projects-list');
    const projects = portfolioData.projects || [];
    container.innerHTML = projects.map((p, i) => `
        <div class="list-item">
            <div class="item-header"><h4>${p.title||'Project '+(i+1)}</h4><button class="remove-btn" onclick="removeProject(${i})"><i class="fas fa-trash"></i></button></div>
            <div class="form-row">
                <div class="form-group"><label>Title</label><input type="text" value="${p.title||''}" onchange="updateProject(${i},'title',this.value)"></div>
                <div class="form-group"><label>Icon</label><input type="text" value="${p.icon||''}" onchange="updateProject(${i},'icon',this.value)"></div>
            </div>
            <div class="form-row-3">
                <div class="form-group"><label>Image</label><input type="text" value="${p.image||''}" onchange="updateProject(${i},'image',this.value)"></div>
                <div class="form-group"><label>Live URL</label><input type="url" value="${p.liveUrl||''}" onchange="updateProject(${i},'liveUrl',this.value)"></div>
                <div class="form-group"><label>Repo URL</label><input type="url" value="${p.repoUrl||''}" onchange="updateProject(${i},'repoUrl',this.value)"></div>
            </div>
            <div class="form-group"><label>Description (one per line)</label><textarea class="desc-textarea" onchange="updateProject(${i},'description',this.value)">${(p.description||[]).join('\n')}</textarea></div>
            <div class="form-group"><label>Technologies</label><input type="text" value="${p.technologies||''}" onchange="updateProject(${i},'technologies',this.value)"></div>
        </div>
    `).join('');
}
function addProject() {
    if (!portfolioData.projects) portfolioData.projects = [];
    portfolioData.projects.push({ title: '', icon: 'fas fa-code', image: '', liveUrl: '', repoUrl: '', description: [], technologies: '' });
    renderProjects(); markDirty();
}
function updateProject(i, f, v) {
    if (f === 'description') portfolioData.projects[i].description = v.split('\n').filter(s => s.trim());
    else portfolioData.projects[i][f] = v;
    markDirty();
}
function removeProject(i) { portfolioData.projects.splice(i, 1); renderProjects(); markDirty(); }

// ─── Experience ───
function renderExperience() {
    const container = document.getElementById('experience-list');
    const exps = portfolioData.experience || [];
    container.innerHTML = exps.map((e, i) => `
        <div class="list-item">
            <div class="item-header"><h4>${e.title||'Experience '+(i+1)}</h4><button class="remove-btn" onclick="removeExp(${i})"><i class="fas fa-trash"></i></button></div>
            <div class="form-row">
                <div class="form-group"><label>Title</label><input type="text" value="${e.title||''}" onchange="updateExp(${i},'title',this.value)"></div>
                <div class="form-group"><label>Company</label><input type="text" value="${e.company||''}" onchange="updateExp(${i},'company',this.value)"></div>
            </div>
            <div class="form-row-3">
                <div class="form-group"><label>Type</label><input type="text" value="${e.type||''}" onchange="updateExp(${i},'type',this.value)"></div>
                <div class="form-group"><label>Duration</label><input type="text" value="${e.duration||''}" onchange="updateExp(${i},'duration',this.value)"></div>
                <div class="form-group"><label>Work Mode</label><input type="text" value="${e.workMode||''}" onchange="updateExp(${i},'workMode',this.value)"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Location</label><input type="text" value="${e.location||''}" onchange="updateExp(${i},'location',this.value)"></div>
                <div class="form-group"><label>Logo</label><input type="text" value="${e.logo||''}" onchange="updateExp(${i},'logo',this.value)"></div>
            </div>
            <div class="form-group"><label>Skills</label><textarea class="desc-textarea" onchange="updateExp(${i},'skills',this.value)">${e.skills||''}</textarea></div>
        </div>
    `).join('');
}
function addExperience() {
    if (!portfolioData.experience) portfolioData.experience = [];
    portfolioData.experience.push({ title: '', company: '', type: '', duration: '', location: '', workMode: '', logo: '', skills: '' });
    renderExperience(); markDirty();
}
function updateExp(i, f, v) { portfolioData.experience[i][f] = v; markDirty(); }
function removeExp(i) { portfolioData.experience.splice(i, 1); renderExperience(); markDirty(); }

// ─── Certifications ───
function renderCertifications() {
    const container = document.getElementById('certifications-list');
    const certs = portfolioData.certifications || [];
    container.innerHTML = certs.map((c, i) => `
        <div class="list-item">
            <div class="item-header"><h4>${c.title||'Cert '+(i+1)}</h4><button class="remove-btn" onclick="removeCert(${i})"><i class="fas fa-trash"></i></button></div>
            <div class="form-row-3">
                <div class="form-group"><label>Title</label><input type="text" value="${c.title||''}" onchange="updateCert(${i},'title',this.value)"></div>
                <div class="form-group"><label>Icon</label><input type="text" value="${c.icon||''}" onchange="updateCert(${i},'icon',this.value)"></div>
                <div class="form-group"><label>Issuer</label><input type="text" value="${c.issuer||''}" onchange="updateCert(${i},'issuer',this.value)"></div>
            </div>
            <div class="form-group"><label>URL</label><input type="url" value="${c.url||''}" onchange="updateCert(${i},'url',this.value)"></div>
        </div>
    `).join('');
}
function addCertification() {
    if (!portfolioData.certifications) portfolioData.certifications = [];
    portfolioData.certifications.push({ title: '', icon: 'fas fa-certificate', issuer: '', url: '' });
    renderCertifications(); markDirty();
}
function updateCert(i, f, v) { portfolioData.certifications[i][f] = v; markDirty(); }
function removeCert(i) { portfolioData.certifications.splice(i, 1); renderCertifications(); markDirty(); }

// ─── Education ───
function renderEducation() {
    const container = document.getElementById('education-list');
    const edus = portfolioData.education || [];
    container.innerHTML = edus.map((e, i) => `
        <div class="list-item">
            <div class="item-header"><h4>${e.degree||'Education '+(i+1)}</h4><button class="remove-btn" onclick="removeEdu(${i})"><i class="fas fa-trash"></i></button></div>
            <div class="form-row">
                <div class="form-group"><label>Degree</label><input type="text" value="${e.degree||''}" onchange="updateEdu(${i},'degree',this.value)"></div>
                <div class="form-group"><label>Institution</label><input type="text" value="${e.institution||''}" onchange="updateEdu(${i},'institution',this.value)"></div>
            </div>
            <div class="form-row-3">
                <div class="form-group"><label>Icon</label><input type="text" value="${e.icon||''}" onchange="updateEdu(${i},'icon',this.value)"></div>
                <div class="form-group"><label>Duration</label><input type="text" value="${e.duration||''}" onchange="updateEdu(${i},'duration',this.value)"></div>
                <div class="form-group"><label>Grade</label><input type="text" value="${e.grade||''}" onchange="updateEdu(${i},'grade',this.value)"></div>
            </div>
        </div>
    `).join('');
}
function addEducation() {
    if (!portfolioData.education) portfolioData.education = [];
    portfolioData.education.push({ degree: '', institution: '', icon: 'fas fa-graduation-cap', duration: '', grade: '' });
    renderEducation(); markDirty();
}
function updateEdu(i, f, v) { portfolioData.education[i][f] = v; markDirty(); }
function removeEdu(i) { portfolioData.education.splice(i, 1); renderEducation(); markDirty(); }