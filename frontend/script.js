// 全局状态
let currentUser = null;
let allPets = [];

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化
    loadPets();
    setupEventListeners();
    
    // 检查登录状态
    checkLoginStatus();
});

// 设置事件监听器
function setupEventListeners() {
    // 登录按钮
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openModal('loginModal');
        });
    }
    
    // 为登录表单添加提交事件
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // 为注册表单添加提交事件
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // 关闭模态框
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Tab切换
    const loginTab = document.querySelector('.tab-btn:nth-child(1)');
    const registerTab = document.querySelector('.tab-btn:nth-child(2)');
    if (loginTab) loginTab.addEventListener('click', () => switchTab('login'));
    if (registerTab) registerTab.addEventListener('click', () => switchTab('register'));
}

// 检查登录状态
function checkLoginStatus() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        try {
            currentUser = JSON.parse(user);
            updateLoginUI(true);
            console.log('已登录用户:', currentUser.username);
        } catch (e) {
            console.error('解析用户信息失败:', e);
            logout();
        }
    }
}

// 更新登录状态UI - 修改这个函数！
// 更新登录状态UI
function updateLoginUI(isLoggedIn) {
    const loginBtn = document.getElementById('loginBtn');
    if (!loginBtn) return;
    
    if (isLoggedIn && currentUser) {
        // 用户已登录，显示用户名和头像
        loginBtn.innerHTML = `
            <div class="user-menu-container">
                <div style="background: linear-gradient(135deg, #4A90E2, #3a80d2); color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold;">
                    ${currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <span style="font-weight: 500; color: #212121; max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${currentUser.username}
                </span>
                <span style="color: #666; font-size: 0.9rem;">▼</span>
            </div>
        `;
        
        // 点击显示用户菜单
        loginBtn.onclick = function(e) {
            e.preventDefault();
            showUserMenu();
        };
    } else {
        // 用户未登录
        loginBtn.innerHTML = '登录/注册';
        loginBtn.onclick = function(e) {
            e.preventDefault();
            openModal('loginModal');
        };
    }
}

// 登录处理函数
async function handleLogin(event) {
    event.preventDefault(); // 阻止表单默认提交
    
    // 获取表单数据（支持多种可能的ID命名）
    let email, password;
    
    // 尝试多种可能的ID
    email = document.getElementById('loginEmail')?.value || 
            document.getElementById('email')?.value;
    password = document.getElementById('loginPassword')?.value || 
               document.getElementById('password')?.value;
    
    // 如果通过ID找不到，尝试通过name属性
    if (!email || !password) {
        const emailInputs = document.querySelectorAll('input[type="email"], input[name="email"]');
        const passwordInputs = document.querySelectorAll('input[type="password"], input[name="password"]');
        
        if (emailInputs.length > 0) email = emailInputs[0].value;
        if (passwordInputs.length > 0) password = passwordInputs[0].value;
    }
    
    console.log('尝试登录:', email);
    
    if (!email || !password) {
        showMessage('请填写邮箱和密码', 'error');
        return;
    }
    
    // 显示加载状态
    const submitBtn = event.target.querySelector('button[type="submit"]');
    let originalText = '登录';
    if (submitBtn) {
        originalText = submitBtn.textContent;
        submitBtn.textContent = '登录中...';
        submitBtn.disabled = true;
    }
    
    try {
        // 发送登录请求到后端
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        console.log('登录响应:', data);
        
       // 在登录成功处理部分（约第100行），修改这里：
if (data.success) {
    // 登录成功
    showMessage(`登录成功！欢迎 ${data.data.username || data.data.user?.username}`, 'success');
    
    // 保存用户信息 - 根据后端返回的数据结构调整
    const userData = data.data.user || data.data;
    
    localStorage.setItem('token', data.data.token || 'temp_token');
    localStorage.setItem('user', JSON.stringify(userData));
    
    currentUser = userData;
    updateLoginUI(true);
    
    // 关闭登录模态框
    closeModal('loginModal');
    
    // 清空表单
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.reset();
    
    // 不需要刷新页面
    // setTimeout(() => {
    //     window.location.reload();
    // }, 1500);
}
         else {
            showMessage(data.message || '登录失败', 'error');
        }
    } catch (error) {
        console.error('登录请求失败:', error);
        showMessage('网络错误，请检查服务器是否运行', 'error');
    } finally {
        // 恢复按钮状态
        if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
}

// 注册处理
async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername')?.value;
    const email = document.getElementById('registerEmail')?.value;
    const password = document.getElementById('registerPassword')?.value;
    const confirm = document.getElementById('registerConfirm')?.value;
    
    if (!username || !email || !password || !confirm) {
        showMessage('请填写所有必填项', 'error');
        return;
    }
    
    if (password !== confirm) {
        showMessage('两次输入的密码不一致', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('密码至少需要6位', 'error');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage(`注册成功！欢迎 ${username}！`, 'success');
            
            // 自动登录
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            
            currentUser = data.data.user;
            updateLoginUI(true);
            
            closeModal('loginModal');
            document.getElementById('registerForm').reset();
            
            // 切换到登录tab
            switchTab('login');
            
            // 刷新页面
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            showMessage(data.message || '注册失败', 'error');
        }
    } catch (error) {
        console.error('注册失败:', error);
        showMessage('注册失败: ' + error.message, 'error');
    }
}

// 加载宠物列表
async function loadPets() {
    const container = document.getElementById('petsContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">加载宠物中...</div>';
    
    try {
        const response = await fetch('http://localhost:3000/api/pets');
        const result = await response.json();
        
        if (result.success) {
            allPets = result.data;
            renderPets(allPets);
            showMessage('成功加载' + allPets.length + '只宠物', 'success');
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('加载宠物失败:', error);
        container.innerHTML = `
            <div class="error-message" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #f44336;">
                ❌ 加载失败: ${error.message}
                <br>
                <button onclick="loadPets()" style="margin-top: 20px; padding: 10px 20px; background: #4A90E2; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    重试
                </button>
            </div>
        `;
    }
}

// 渲染宠物卡片
function renderPets(pets) {
    const container = document.getElementById('petsContainer');
    if (!container) return;
    
    if (pets.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 60px;">
                <div style="font-size: 4rem;">😿</div>
                <h3 style="margin: 20px 0 10px; color: #666;">暂时没有找到符合条件的宠物</h3>
                <p style="color: #999;">试试调整筛选条件或稍后再来</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    pets.forEach(pet => {
        const card = document.createElement('div');
        card.className = 'pet-card';
        card.innerHTML = `
            <div class="pet-header">
                <div class="pet-icon">${pet.image || getPetEmoji(pet.species)}</div>
                <div class="pet-status status-${pet.status}">
                    ${pet.status === 'available' ? '可领养' : '审核中'}
                </div>
            </div>
            <div class="pet-body">
                <h3 class="pet-name">${pet.name}</h3>
                <div class="pet-meta">
                    <span class="pet-species species-${pet.species}">
                        ${pet.species === 'dog' ? '狗狗 🐕' : '猫咪 🐈'}
                    </span>
                    <span>${pet.age}个月 · ${pet.gender === 'male' ? '公' : '母'}</span>
                </div>
                <div class="pet-location">
                    📍 ${pet.location}
                </div>
                <div class="pet-tags">
                    ${pet.vaccinated ? '<span class="tag tag-vaccinated">已疫苗 💉</span>' : ''}
                    ${pet.sterilized ? '<span class="tag tag-sterilized">已绝育</span>' : ''}
                </div>
                <div class="pet-actions">
                    <button class="action-btn btn-adopt" onclick="applyAdopt(${pet.id})">
                        🏠 申请领养
                    </button>
                    <button class="action-btn btn-detail" onclick="showPetDetail(${pet.id})">
                        👀 查看详情
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// 获取宠物Emoji
function getPetEmoji(species) {
    const emojis = {
        dog: '🐕',
        cat: '🐈',
        other: '🐾'
    };
    return emojis[species] || '🐾';
}

// 筛选宠物
function filterPets() {
    const species = document.getElementById('speciesFilter')?.value || 'all';
    const location = document.getElementById('locationFilter')?.value || 'all';
    
    let filtered = allPets;
    
    if (species !== 'all') {
        filtered = filtered.filter(pet => pet.species === species);
    }
    
    if (location !== 'all') {
        filtered = filtered.filter(pet => pet.location.includes(location));
    }
    
    renderPets(filtered);
    showMessage(`找到 ${filtered.length} 只符合条件的宠物`, 'info');
}

// 显示宠物详情
function showPetDetail(petId) {
    const pet = allPets.find(p => p.id === petId);
    if (!pet) return;
    
    const detailHtml = `
        <div style="padding: 30px; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="font-size: 6rem;">${pet.image || getPetEmoji(pet.species)}</div>
                <h2 style="color: #212121; margin: 20px 0 10px;">${pet.name}</h2>
                <div style="color: #666; font-size: 1.1rem;">
                    ${pet.species === 'dog' ? '狗狗' : '猫咪'} · ${pet.age}个月 · ${pet.gender === 'male' ? '公' : '母'}
                </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 15px; margin-bottom: 25px;">
                <h3 style="color: #212121; margin-bottom: 15px; border-bottom: 2px solid #4A90E2; padding-bottom: 8px;">基本信息</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                    <div>
                        <strong>品种：</strong> ${pet.breed || '未知'}
                    </div>
                    <div>
                        <strong>颜色：</strong> ${pet.color || '未知'}
                    </div>
                    <div>
                        <strong>体型：</strong> ${getSizeText(pet.size)}
                    </div>
                    <div>
                        <strong>所在地：</strong> ${pet.location}
                    </div>
                </div>
                
                <div style="margin-top: 20px;">
                    <strong>健康状态：</strong>
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        ${pet.vaccinated ? '<span style="background: #66BB6A; color: white; padding: 5px 15px; border-radius: 15px;">已疫苗 💉</span>' : ''}
                        ${pet.sterilized ? '<span style="background: #757575; color: white; padding: 5px 15px; border-radius: 15px;">已绝育</span>' : ''}
                    </div>
                </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 15px; margin-bottom: 30px;">
                <h3 style="color: #212121; margin-bottom: 15px; border-bottom: 2px solid #FFA726; padding-bottom: 8px;">它的故事</h3>
                <p style="line-height: 1.8; color: #666;">${pet.story || '暂时没有更多介绍...'}</p>
            </div>
            
            <div style="text-align: center;">
                <button onclick="applyAdopt(${pet.id})" style="background: linear-gradient(135deg, #4A90E2, #3a80d2); color: white; border: none; padding: 15px 40px; border-radius: 25px; font-size: 1.1rem; font-weight: 600; cursor: pointer; margin-right: 15px;">
                    🏠 申请领养
                </button>
                <button onclick="closeDetail()" style="background: #e0e0e0; color: #212121; border: none; padding: 15px 30px; border-radius: 25px; font-size: 1.1rem; font-weight: 600; cursor: pointer;">
                    关闭
                </button>
            </div>
        </div>
    `;
    
    // 创建详情模态框
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px; overflow-y: auto; max-height: 90vh;">
            <span class="close" onclick="closeDetail()">&times;</span>
            ${detailHtml}
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 获取体型文本
function getSizeText(size) {
    const sizes = {
        small: '小型',
        medium: '中型',
        large: '大型'
    };
    return sizes[size] || '未知';
}

// 关闭详情
function closeDetail() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// 申请领养
function applyAdopt(petId) {
    if (!currentUser) {
        showMessage('请先登录后再申请领养', 'error');
        openModal('loginModal');
        return;
    }
    
    const pet = allPets.find(p => p.id === petId);
    if (!pet) return;
    
    const message = prompt(`请输入您想对${pet.name}的送养人说的话：\n（例如：您的养宠经验、家庭环境等）`);
    
    if (message) {
        showMessage(`已提交对 ${pet.name} 的领养申请！我们会尽快联系您。`, 'success');
        
        // 这里应该发送到后端API
        console.log('领养申请:', {
            petId: pet.id,
            petName: pet.name,
            applicant: currentUser.username,
            message: message,
            timestamp: new Date().toISOString()
        });
    }
}

// 显示发布表单
function showPublishForm() {
    if (!currentUser) {
        showMessage('请先登录后再发布信息', 'error');
        openModal('loginModal');
        return;
    }
    
    openModal('publishModal');
}

// 提交宠物表单
async function submitPetForm(event) {
    event.preventDefault();
    
    if (!currentUser) {
        showMessage('请先登录', 'error');
        return;
    }
    
    const petData = {
        name: document.getElementById('petName').value,
        species: document.getElementById('petSpecies').value,
        age: parseInt(document.getElementById('petAge').value),
        gender: document.getElementById('petGender').value,
        size: document.getElementById('petSize').value || undefined,
        location: document.getElementById('petLocation').value,
        story: document.getElementById('petStory').value || '',
        vaccinated: document.getElementById('petVaccinated').checked,
        sterilized: document.getElementById('petSterilized').checked,
        image: getPetEmoji(document.getElementById('petSpecies').value),
        color: '待补充',
        breed: '待补充',
        status: 'available'
    };
    
    try {
        const response = await fetch('http://localhost:3000/api/pets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(petData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('发布成功！等待审核中...', 'success');
            closeModal('publishModal');
            document.getElementById('publishForm').reset();
            loadPets(); // 刷新列表
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('发布失败:', error);
        showMessage('发布失败: ' + error.message, 'error');
    }
}

// 切换Tab
function switchTab(tabName) {
    // 隐藏所有tab内容
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
        tab.classList.remove('active');
    });
    
    // 更新tab按钮状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 显示目标tab
    if (tabName === 'login') {
        const loginForm = document.getElementById('loginForm');
        const loginTab = document.querySelector('.tab-btn:nth-child(1)');
        if (loginForm) {
            loginForm.style.display = 'block';
            loginForm.classList.add('active');
        }
        if (loginTab) loginTab.classList.add('active');
    } else {
        const registerForm = document.getElementById('registerForm');
        const registerTab = document.querySelector('.tab-btn:nth-child(2)');
        if (registerForm) {
            registerForm.style.display = 'block';
            registerForm.classList.add('active');
        }
        if (registerTab) registerTab.classList.add('active');
    }
}

// 打开模态框
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        // 默认打开登录tab
        if (modalId === 'loginModal') {
            switchTab('login');
        }
    }
}

// 关闭模态框
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// 显示消息
function showMessage(text, type = 'info') {
    // 创建或获取消息容器
    let messageDiv = document.getElementById('message');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'message';
        messageDiv.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 10px;
            color: white;
            font-weight: 500;
            z-index: 3000;
            animation: slideInRight 0.3s, fadeOut 0.3s 2.7s forwards;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        `;
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
                to { opacity: 0; visibility: hidden; }
            }
            .message.success { background: #66BB6A; }
            .message.error { background: #f44336; }
            .message.info { background: #4A90E2; }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(messageDiv);
    }
    
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    
    // 3秒后自动消失
    setTimeout(() => {
        messageDiv.className = 'message';
        messageDiv.textContent = '';
    }, 3000);
}

// 导航函数
function goHome() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToPets() {
    const petsSection = document.getElementById('pets');
    if (petsSection) {
        petsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// 用户菜单 - 修改这个函数！
function showUserMenu() {
    if (!currentUser) return;
    
    // 移除现有菜单
    const oldMenu = document.querySelector('.user-menu-popup');
    if (oldMenu) oldMenu.remove();
    
    // 创建新菜单
    const menu = document.createElement('div');
    menu.className = 'user-menu-popup';
    menu.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: white;
        box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        border-radius: 12px;
        padding: 15px 0;
        min-width: 220px;
        z-index: 1001;
        border: 1px solid rgba(0,0,0,0.08);
        animation: fadeIn 0.2s;
    `;
    
    menu.innerHTML = `
        <div style="padding: 15px 20px; border-bottom: 1px solid #eee;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <div style="background: linear-gradient(135deg, #4A90E2, #3a80d2); color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold;">
                    ${currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                    <div style="font-weight: 600; color: #212121; font-size: 1rem;">${currentUser.username}</div>
                    <div style="color: #666; font-size: 0.85rem; margin-top: 2px;">${currentUser.email || '未设置邮箱'}</div>
                </div>
            </div>
        </div>
        <div style="padding: 8px 0;">
            <button onclick="showProfile()" style="width: 100%; text-align: left; padding: 12px 20px; background: none; border: none; cursor: pointer; color: #212121; font-size: 0.95rem; display: flex; align-items: center; gap: 10px; transition: all 0.2s;">
                <span style="font-size: 1.1rem;">👤</span>
                个人中心
            </button>
            <button onclick="showMyPets()" style="width: 100%; text-align: left; padding: 12px 20px; background: none; border: none; cursor: pointer; color: #212121; font-size: 0.95rem; display: flex; align-items: center; gap: 10px; transition: all 0.2s;">
                <span style="font-size: 1.1rem;">🐾</span>
                我发布的宠物
            </button>
            <button onclick="showMyApplications()" style="width: 100%; text-align: left; padding: 12px 20px; background: none; border: none; cursor: pointer; color: #212121; font-size: 0.95rem; display: flex; align-items: center; gap: 10px; transition: all 0.2s;">
                <span style="font-size: 1.1rem;">📋</span>
                我的申请
            </button>
            <div style="border-top: 1px solid #eee; margin: 8px 0;"></div>
            <button onclick="logout()" style="width: 100%; text-align: left; padding: 12px 20px; background: none; border: none; cursor: pointer; color: #f44336; font-size: 0.95rem; display: flex; align-items: center; gap: 10px; transition: all 0.2s;">
                <span style="font-size: 1.1rem;">👋</span>
                退出登录
            </button>
        </div>
    `;
    
    document.body.appendChild(menu);
    
    // 添加动画样式
    if (!document.querySelector('#user-menu-animation')) {
        const style = document.createElement('style');
        style.id = 'user-menu-animation';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .user-menu-popup button:hover {
                background: linear-gradient(135deg, #E3F2FD, #F3E5F5);
                color: #4A90E2 !important;
                padding-left: 25px !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 点击外部关闭菜单
    setTimeout(() => {
        const closeHandler = function(e) {
            if (!e.target.closest('.user-menu-container') && !e.target.closest('.user-menu-popup')) {
                menu.remove();
                document.removeEventListener('click', closeHandler);
            }
        };
        document.addEventListener('click', closeHandler);
    }, 0);
}

// 查看我的申请
function viewMyApplications() {
    showMessage('功能开发中...', 'info');
}

// 查看我发布的宠物
function viewMyPets() {
    showMessage('功能开发中...', 'info');
}

// 退出登录
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    updateLoginUI(false);
    showMessage('已退出登录', 'info');
    
    // 移除用户菜单
    const menu = document.querySelector('.user-menu');
    if (menu) menu.remove();
}

// 调试函数（可选）
function debugLogin() {
    console.log('=== 调试信息 ===');
    console.log('当前用户:', currentUser);
    console.log('登录表单:', document.getElementById('loginForm'));
    console.log('邮箱输入框:', document.getElementById('loginEmail') || document.getElementById('email'));
    console.log('密码输入框:', document.getElementById('loginPassword') || document.getElementById('password'));
    
    // 测试API
    fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email: "1329354413@qq.com", 
            password: "123456" 
        })
    })
    .then(res => res.json())
    .then(data => console.log('API测试结果:', data))
    .catch(err => console.error('API错误:', err));
}

// 页面加载后自动调试
setTimeout(debugLogin, 1000);



// 显示个人中心
function showProfile() {
    if (!currentUser) {
        showMessage('请先登录', 'error');
        return;
    }
    
    // 创建个人中心模态框
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>👤 个人中心</h2>
            
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="background: linear-gradient(135deg, #4A90E2, #FFA726); color: white; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold; margin: 0 auto 20px;">
                    ${currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <h3 style="color: #212121; margin-bottom: 8px;">${currentUser.username}</h3>
                <p style="color: #666;">${currentUser.email || '未设置邮箱'}</p>
                <div style="background: #E3F2FD; color: #4A90E2; padding: 6px 15px; border-radius: 15px; display: inline-block; margin-top: 10px; font-size: 0.9rem;">
                    注册用户
                </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
                <h4 style="color: #212121; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 8px;">📊 我的统计</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                    <div style="text-align: center; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 3px 10px rgba(0,0,0,0.05);">
                        <div style="font-size: 1.8rem; color: #4A90E2;">0</div>
                        <div style="color: #666; font-size: 0.9rem;">发布的宠物</div>
                    </div>
                    <div style="text-align: center; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 3px 10px rgba(0,0,0,0.05);">
                        <div style="font-size: 1.8rem; color: #FFA726;">0</div>
                        <div style="color: #666; font-size: 0.9rem;">领养申请</div>
                    </div>
                </div>
            </div>
            
            <button onclick="logout()" style="width: 100%; padding: 15px; background: linear-gradient(135deg, #f44336, #d32f2f); color: white; border: none; border-radius: 10px; font-size: 1.1rem; font-weight: 600; cursor: pointer; margin-top: 20px;">
                退出登录
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 显示我发布的宠物
function showMyPets() {
    if (!currentUser) {
        showMessage('请先登录', 'error');
        return;
    }
    
    showMessage('正在加载您发布的宠物...', 'info');
    
    // 在实际项目中，这里会调用API获取用户发布的宠物
    // 现在先显示一个示例
    setTimeout(() => {
        showMessage('您还没有发布过宠物，快去发布一只吧！', 'info');
    }, 1000);
    
    // 关闭菜单
    const menu = document.querySelector('.user-menu-popup');
    if (menu) menu.remove();
}