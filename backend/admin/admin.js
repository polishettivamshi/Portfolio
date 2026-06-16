// Portfolio Admin Dashboard - JavaScript
const API_BASE = '';

// ─── State ───
let portfolioData = {};

// ─── DOM Elements ───
const loginPage = document.getElementById('login-page');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const notification = document.getElementById('notification');
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menu-toggle');
const logoutBtn = document.getElementById('logout-btn');

// ─── Initialize ───
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));

    // Sidebar navigation
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            switchSection(section);
            sidebar.classList.remove('open');
        });
    });

    // File upload handlers
    document.getElementById('profile-image-input').addEventListener('change', (e) => handleFileUpload(e, 'image', 'profile'));
    document.getElementById('resume-input').addEventListener('change', (e) => handleFileUpload(e, 'resume', 'resume'));
}

// ─── Auth ───
async function checkAuth() {
    try {
        const res = await fetch(`${API_BASE}/admin/check`, { credentials: 'include' });
        if (res.ok) {
            showDashboard();
        } else {
            showLogin();
        }
    } catch {
        showLogin();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    loginError.style.display = 'none';

    try {
        const res = await fetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            showDashboard();
        } else {
            loginError.textContent = data.message || 'Invalid credentials';
            loginError.style.display = 'block';
        }
    } catch (err) {
        loginError.textContent = 'Connection error. Please try again.';
        loginError.style.display = 'block';
    }
}

async function handleLogout() {
    await fetch(`${API_BASE}/admin/logout`, { method: 'POST', credentials: 'include' });
    showLogin();
}

function showLogin() {
    loginPage.style.display = 'flex';
    dashboard.style.display = 'none';
}

function showDashboard() {
    loginPage.style.display = 'none';
    dashboard.style.display = 'block';
    loadPortfolio();
}

// ─── Navigation ───
function switchSection(section) {
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
    document.querySelector(`.sidebar-nav a[data-section="${section}"]`).classList.add('active');
    document.querySelectorAll('.section-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`section-${section}`).classList.add('active');
    document.getElementById('page-title').textContent = document.querySelector(`.sidebar-nav a[data-section="${section}"]`).textContent.trim();
}

// ─── Notifications ───
function showNotification(message, type = 'success') {
    notification.className = `notification ${type}`;
    notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
    notification.style.display = 'flex';
    setTimeout(() => { notification.style.display = 'none'; }, 4000);
}

// ─── Load Portfolio ───
async function loadPortfolio() {
    try {
        const res = await fetch(`${API_BASE}/api/portfolio`, { credentials: 'include' });
        portfolioData = await res.json();
        populateAllFields();
    } catch (err) {
        showNotification('Failed to load portfolio data', 'error');
    }
}

function populateAllFields() {
    // Profile
    document.getElementById('field-name').value = portfolioData.name || '';
    document.getElementById('field-designation').value = portfolioData.designation || '';

    // Profile image preview
    if (portfolioData.profileImage) {
        document.getElementById('profile-preview').style.display = 'flex';
        document.getElementById('profile-preview-img').src = '/' + portfolioData.profileImage;
        document.getElementById('profile-preview-name').textContent = portfolioData.profileImage.split('/').pop();
        document.getElementById('profile-preview-url').textContent = portfolioData.profileImage;
    }

    // About
    document.getElementById('field-tagline').value = portfolioData.about?.tagline || '';
    document.getElementById('field-highlights').value = (portfolioData.about?.highlights || []).join('\n');
    renderStats();

    // Skills
    renderSkills();

    // Projects
    renderProjects();

    // Experience
    renderExperience();

    // Certifications
    renderCertifications();

    // Education
    renderEducation();

    // Social
    document.getElementById('field-whatsapp').value = portfolioData.socialLinks?.whatsapp || '';
    document.getElementById('field-linkedin').value = portfolioData.socialLinks?.linkedin || '';
    document.getElementById('field-github').value = portfolioData.socialLinks?.github || '';
    document.getElementById('field-hackerrank').value = portfolioData.socialLinks?.hackerrank || '';

    // Contact
    document.getElementById('field-contact-name').value = portfolioData.contact?.name || '';
    document.getElementById('field-contact-location').value = portfolioData.contact?.location || '';
    document.getElementById('field-contact-email').value = portfolioData.contact?.email || '';
    document.getElementById('field-contact-phone').value = portfolioData.contact?.phone || '';
    document.getElementById('field-contact-whatsapp').value = portfolioData.contact?.whatsapp || '';

    // Resume
    if (portfolioData.resumePdf) {
        document.getElementById('resume-preview').style.display = 'flex';
        document.getElementById('resume-preview-name').textContent = portfolioData.resumePdf.split('/').pop();
        document.getElementById('resume-preview-url').textContent = portfolioData.resumePdf;
        document.getElementById('resume-download-btn').href = '/' + portfolioData.resumePdf;
    }
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
                    <label>Icon Class</label>
                    <input type="text" value="${stat.icon || ''}" onchange="updateStat(${i}, 'icon', this.value)" placeholder="fas fa-bolt">
                </div>
                <div class="form-group">
                    <label>Number</label>
                    <input type="text" value="${stat.number || ''}" onchange="updateStat(${i}, 'number', this.value)" placeholder="500+">
                </div>
                <div class="form-group">
                    <label>Label</label>
                    <input type="text" value="${stat.label || ''}" onchange="updateStat(${i}, 'label', this.value)" placeholder="JIRA Issues">
                </div>
            </div>
        </div>
    `).join('');
}

function addStat() {
    if (!portfolioData.about) portfolioData.about = {};
    if (!portfolioData.about.stats) portfolioData.about.stats = [];
    portfolioData.about.stats.push({ icon: 'fas fa-bolt', number: '', label: '' });
    renderStats();
}

function updateStat(index, field, value) {
    portfolioData.about.stats[index][field] = value;
    renderStats();
}

function removeStat(index) {
    portfolioData.about.stats.splice(index, 1);
    renderStats();
}

// ─── Skills ───
function renderSkills() {
    const container = document.getElementById('skills-list');
    const skills = portfolioData.skills || [];
    container.innerHTML = skills.map((cat, i) => `
        <div class="list-item">
            <div class="item-header">
                <h4>${cat.title || 'Skill Category ' + (i + 1)}</h4>
                <button class="remove-btn" onclick="removeSkillCategory(${i})"><i class="fas fa-trash"></i></button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Icon Class</label>
                    <input type="text" value="${cat.icon || ''}" onchange="updateSkillCategory(${i}, 'icon', this.value)" placeholder="fab fa-python">
                </div>
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" value="${cat.title || ''}" onchange="updateSkillCategory(${i}, 'title', this.value)" placeholder="Python Stack">
                </div>
            </div>
            <div class="form-group">
                <label>Skills (one per line)</label>
                <textarea class="desc-textarea" onchange="updateSkillCategory(${i}, 'items', this.value)">${(cat.items || []).join('\n')}</textarea>
            </div>
        </div>
    `).join('');
}

function addSkillCategory() {
    if (!portfolioData.skills) portfolioData.skills = [];
    portfolioData.skills.push({ icon: 'fas fa-code', title: '', items: [] });
    renderSkills();
}

function updateSkillCategory(index, field, value) {
    if (field === 'items') {
        portfolioData.skills[index].items = value.split('\n').filter(s => s.trim());
    } else {
        portfolioData.skills[index][field] = value;
    }
    renderSkills();
}

function removeSkillCategory(index) {
    portfolioData.skills.splice(index, 1);
    renderSkills();
}

// ─── Projects ───
function renderProjects() {
    const container = document.getElementById('projects-list');
    const projects = portfolioData.projects || [];
    container.innerHTML = projects.map((proj, i) => `
        <div class="list-item">
            <div class="item-header">
                <h4>${proj.title || 'Project ' + (i + 1)}</h4>
                <button class="remove-btn" onclick="removeProject(${i})"><i class="fas fa-trash"></i></button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" value="${proj.title || ''}" onchange="updateProject(${i}, 'title', this.value)">
                </div>
                <div class="form-group">
                    <label>Icon</label>
                    <input type="text" value="${proj.icon || ''}" onchange="updateProject(${i}, 'icon', this.value)" placeholder="fas fa-globe">
                </div>
            </div>
            <div class="form-row-3">
                <div class="form-group">
                    <label>Image Path</label>
                    <input type="text" value="${proj.image || ''}" onchange="updateProject(${i}, 'image', this.value)" placeholder="images/project.png">
                </div>
                <div class="form-group">
                    <label>Live URL</label>
                    <input type="url" value="${proj.liveUrl || ''}" onchange="updateProject(${i}, 'liveUrl', this.value)">
                </div>
                <div class="form-group">
                    <label>Repo URL</label>
                    <input type="url" value="${proj.repoUrl || ''}" onchange="updateProject(${i}, 'repoUrl', this.value)">
                </div>
            </div>
            <div class="form-group">
                <label>Description (one point per line)</label>
                <textarea class="desc-textarea" onchange="updateProject(${i}, 'description', this.value)">${(proj.description || []).join('\n')}</textarea>
            </div>
            <div class="form-group">
                <label>Technologies</label>
                <input type="text" value="${proj.technologies || ''}" onchange="updateProject(${i}, 'technologies', this.value)">
            </div>
        </div>
    `).join('');
}

function addProject() {
    if (!portfolioData.projects) portfolioData.projects = [];
    portfolioData.projects.push({ title: '', icon: 'fas fa-code', image: '', liveUrl: '', repoUrl: '', description: [], technologies: '' });
    renderProjects();
}

function updateProject(index, field, value) {
    if (field === 'description') {
        portfolioData.projects[index].description = value.split('\n').filter(s => s.trim());
    } else {
        portfolioData.projects[index][field] = value;
    }
}

function removeProject(index) {
    portfolioData.projects.splice(index, 1);
    renderProjects();
}

// ─── Experience ───
function renderExperience() {
    const container = document.getElementById('experience-list');
    const exps = portfolioData.experience || [];
    container.innerHTML = exps.map((exp, i) => `
        <div class="list-item">
            <div class="item-header">
                <h4>${exp.title || 'Experience ' + (i + 1)}</h4>
                <button class="remove-btn" onclick="removeExperience(${i})"><i class="fas fa-trash"></i></button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Job Title</label>
                    <input type="text" value="${exp.title || ''}" onchange="updateExperience(${i}, 'title', this.value)">
                </div>
                <div class="form-group">
                    <label>Company</label>
                    <input type="text" value="${exp.company || ''}" onchange="updateExperience(${i}, 'company', this.value)">
                </div>
            </div>
            <div class="form-row-3">
                <div class="form-group">
                    <label>Type</label>
                    <input type="text" value="${exp.type || ''}" onchange="updateExperience(${i}, 'type', this.value)" placeholder="Full Time">
                </div>
                <div class="form-group">
                    <label>Duration</label>
                    <input type="text" value="${exp.duration || ''}" onchange="updateExperience(${i}, 'duration', this.value)" placeholder="Mar 2026 - Present">
                </div>
                <div class="form-group">
                    <label>Work Mode</label>
                    <input type="text" value="${exp.workMode || ''}" onchange="updateExperience(${i}, 'workMode', this.value)" placeholder="On-site">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Location</label>
                    <input type="text" value="${exp.location || ''}" onchange="updateExperience(${i}, 'location', this.value)">
                </div>
                <div class="form-group">
                    <label>Logo Path</label>
                    <input type="text" value="${exp.logo || ''}" onchange="updateExperience(${i}, 'logo', this.value)" placeholder="images/logo.jpg">
                </div>
            </div>
            <div class="form-group">
                <label>Skills</label>
                <textarea class="desc-textarea" onchange="updateExperience(${i}, 'skills', this.value)">${exp.skills || ''}</textarea>
            </div>
        </div>
    `).join('');
}

function addExperience() {
    if (!portfolioData.experience) portfolioData.experience = [];
    portfolioData.experience.push({ title: '', company: '', type: '', duration: '', location: '', workMode: '', logo: '', skills: '' });
    renderExperience();
}

function updateExperience(index, field, value) {
    portfolioData.experience[index][field] = value;
}

function removeExperience(index) {
    portfolioData.experience.splice(index, 1);
    renderExperience();
}

// ─── Certifications ───
function renderCertifications() {
    const container = document.getElementById('certifications-list');
    const certs = portfolioData.certifications || [];
    container.innerHTML = certs.map((cert, i) => `
        <div class="list-item">
            <div class="item-header">
                <h4>${cert.title || 'Certification ' + (i + 1)}</h4>
                <button class="remove-btn" onclick="removeCertification(${i})"><i class="fas fa-trash"></i></button>
            </div>
            <div class="form-row-3">
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" value="${cert.title || ''}" onchange="updateCertification(${i}, 'title', this.value)">
                </div>
                <div class="form-group">
                    <label>Icon</label>
                    <input type="text" value="${cert.icon || ''}" onchange="updateCertification(${i}, 'icon', this.value)" placeholder="fab fa-python">
                </div>
                <div class="form-group">
                    <label>Issuer</label>
                    <input type="text" value="${cert.issuer || ''}" onchange="updateCertification(${i}, 'issuer', this.value)">
                </div>
            </div>
            <div class="form-group">
                <label>Certificate URL</label>
                <input type="url" value="${cert.url || ''}" onchange="updateCertification(${i}, 'url', this.value)">
            </div>
        </div>
    `).join('');
}

function addCertification() {
    if (!portfolioData.certifications) portfolioData.certifications = [];
    portfolioData.certifications.push({ title: '', icon: 'fas fa-certificate', issuer: '', url: '' });
    renderCertifications();
}

function updateCertification(index, field, value) {
    portfolioData.certifications[index][field] = value;
}

function removeCertification(index) {
    portfolioData.certifications.splice(index, 1);
    renderCertifications();
}

// ─── Education ───
function renderEducation() {
    const container = document.getElementById('education-list');
    const edus = portfolioData.education || [];
    container.innerHTML = edus.map((edu, i) => `
        <div class="list-item">
            <div class="item-header">
                <h4>${edu.degree || 'Education ' + (i + 1)}</h4>
                <button class="remove-btn" onclick="removeEducation(${i})"><i class="fas fa-trash"></i></button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Degree</label>
                    <input type="text" value="${edu.degree || ''}" onchange="updateEducation(${i}, 'degree', this.value)">
                </div>
                <div class="form-group">
                    <label>Institution</label>
                    <input type="text" value="${edu.institution || ''}" onchange="updateEducation(${i}, 'institution', this.value)">
                </div>
            </div>
            <div class="form-row-3">
                <div class="form-group">
                    <label>Icon</label>
                    <input type="text" value="${edu.icon || ''}" onchange="updateEducation(${i}, 'icon', this.value)" placeholder="fas fa-university">
                </div>
                <div class="form-group">
                    <label>Duration</label>
                    <input type="text" value="${edu.duration || ''}" onchange="updateEducation(${i}, 'duration', this.value)">
                </div>
                <div class="form-group">
                    <label>Grade</label>
                    <input type="text" value="${edu.grade || ''}" onchange="updateEducation(${i}, 'grade', this.value)">
                </div>
            </div>
        </div>
    `).join('');
}

function addEducation() {
    if (!portfolioData.education) portfolioData.education = [];
    portfolioData.education.push({ degree: '', institution: '', icon: 'fas fa-graduation-cap', duration: '', grade: '' });
    renderEducation();
}

function updateEducation(index, field, value) {
    portfolioData.education[index][field] = value;
}

function removeEducation(index) {
    portfolioData.education.splice(index, 1);
    renderEducation();
}

// ─── File Upload ───
async function handleFileUpload(e, type, target) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
        const res = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            credentials: 'include',
            body: formData
        });
        const data = await res.json();
        if (res.ok) {
            if (target === 'profile') {
                portfolioData.profileImage = data.url;
                document.getElementById('profile-preview').style.display = 'flex';
                document.getElementById('profile-preview-img').src = '/' + data.url;
                document.getElementById('profile-preview-name').textContent = data.filename;
                document.getElementById('profile-preview-url').textContent = data.url;
            } else if (target === 'resume') {
                portfolioData.resumePdf = data.url;
                document.getElementById('resume-preview').style.display = 'flex';
                document.getElementById('resume-preview-name').textContent = data.filename;
                document.getElementById('resume-preview-url').textContent = data.url;
                document.getElementById('resume-download-btn').href = '/' + data.url;
            }
            showNotification('File uploaded successfully!');
        } else {
            showNotification(data.error || 'Upload failed', 'error');
        }
    } catch (err) {
        showNotification('Upload failed: ' + err.message, 'error');
    }
}

// ─── Save Functions ───
async function savePortfolioData(data) {
    try {
        const res = await fetch(`${API_BASE}/api/portfolio`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (res.ok) {
            showNotification(result.message || 'Saved successfully!');
            await loadPortfolio();
        } else {
            showNotification(result.error || 'Save failed', 'error');
        }
    } catch (err) {
        showNotification('Save failed: ' + err.message, 'error');
    }
}

function saveProfile() {
    savePortfolioData({
        name: document.getElementById('field-name').value,
        designation: document.getElementById('field-designation').value,
        profileImage: portfolioData.profileImage
    });
}

function saveAbout() {
    const highlights = document.getElementById('field-highlights').value.split('\n').filter(s => s.trim());
    savePortfolioData({
        about: {
            tagline: document.getElementById('field-tagline').value,
            highlights: highlights,
            stats: portfolioData.about?.stats || []
        }
    });
}

function saveSkills() {
    savePortfolioData({ skills: portfolioData.skills || [] });
}

function saveProjects() {
    savePortfolioData({ projects: portfolioData.projects || [] });
}

function saveExperience() {
    savePortfolioData({ experience: portfolioData.experience || [] });
}

function saveCertifications() {
    savePortfolioData({ certifications: portfolioData.certifications || [] });
}

function saveEducation() {
    savePortfolioData({ education: portfolioData.education || [] });
}

function saveSocial() {
    savePortfolioData({
        socialLinks: {
            whatsapp: document.getElementById('field-whatsapp').value,
            linkedin: document.getElementById('field-linkedin').value,
            github: document.getElementById('field-github').value,
            hackerrank: document.getElementById('field-hackerrank').value
        }
    });
}

function saveContact() {
    savePortfolioData({
        contact: {
            name: document.getElementById('field-contact-name').value,
            location: document.getElementById('field-contact-location').value,
            email: document.getElementById('field-contact-email').value,
            phone: document.getElementById('field-contact-phone').value,
            whatsapp: document.getElementById('field-contact-whatsapp').value
        }
    });
}

function saveFiles() {
    savePortfolioData({
        profileImage: portfolioData.profileImage,
        resumePdf: portfolioData.resumePdf
    });
}

// ─── Theme Toggle ───
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeKey = 'admin-theme';

function applyAdminTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light-mode');
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggleBtn.title = 'Switch to Dark Mode';
    } else {
        document.body.classList.remove('light-mode');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        themeToggleBtn.title = 'Switch to Light Mode';
    }
    localStorage.setItem(themeKey, theme);
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const current = localStorage.getItem(themeKey) || 'dark';
        applyAdminTheme(current === 'dark' ? 'light' : 'dark');
    });
    // Load saved theme
    applyAdminTheme(localStorage.getItem(themeKey) || 'dark');
}
