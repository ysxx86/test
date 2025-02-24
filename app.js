// 初始化 LeanCloud
AV.init({
    appId: "L0MSyA5ehj72PclaWpaWZaAG-gzGzoHsz",
    appKey: "yueA3R2oKwScK3IizeJTFTpU",
    serverURL: "https://l0msya5e.lc-cn-n1-shared.com"
});

// 用户类
const User = AV.Object.extend('UserInfo');

// DOM 元素
const userForm = document.getElementById('userForm');
const userTableBody = document.getElementById('userTableBody');
const objectIdInput = document.getElementById('objectId');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

// 加载用户列表
async function loadUsers() {
    try {
        const query = new AV.Query('UserInfo');
        const users = await query.find();
        
        userTableBody.innerHTML = '';
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.get('username')}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editUser('${user.id}')">编辑</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')">删除</button>
                </td>
            `;
            userTableBody.appendChild(row);
        });
    } catch (error) {
        alert('加载用户列表失败：' + error.message);
    }
}

// 保存用户
userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        let user;
        if (objectIdInput.value) {
            // 更新现有用户
            user = AV.Object.createWithoutData('UserInfo', objectIdInput.value);
        } else {
            // 创建新用户
            user = new User();
        }

        user.set('username', usernameInput.value);
        user.set('password', passwordInput.value);
        
        await user.save();
        resetForm();
        loadUsers();
    } catch (error) {
        alert('保存失败：' + error.message);
    }
});

// 编辑用户
async function editUser(id) {
    try {
        const query = new AV.Query('UserInfo');
        const user = await query.get(id);
        
        objectIdInput.value = user.id;
        usernameInput.value = user.get('username');
        passwordInput.value = user.get('password');
    } catch (error) {
        alert('加载用户信息失败：' + error.message);
    }
}

// 删除用户
async function deleteUser(id) {
    if (!confirm('确定要删除这个用户吗？')) return;
    
    try {
        const user = AV.Object.createWithoutData('UserInfo', id);
        await user.destroy();
        loadUsers();
    } catch (error) {
        alert('删除失败：' + error.message);
    }
}

// 重置表单
function resetForm() {
    objectIdInput.value = '';
    userForm.reset();
}

// 页面加载时获取用户列表
document.addEventListener('DOMContentLoaded', loadUsers);

// 实时查询对象
let liveQuery;

// 初始化实时查询
async function initLiveQuery() {
    try {
        const query = new AV.Query('UserInfo');
        liveQuery = await query.subscribe();

        // 监听数据创建事件
        liveQuery.on('create', () => {
            loadUsers();
        });

        // 监听数据更新事件
        liveQuery.on('update', () => {
            loadUsers();
        });

        // 监听数据删除事件
        liveQuery.on('delete', () => {
            loadUsers();
        });

    } catch (error) {
        console.error('实时查询初始化失败：', error);
    }
}

// 页面加载时初始化实时查询
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    initLiveQuery();
});

// 页面关闭时取消订阅
window.addEventListener('beforeunload', () => {
    if (liveQuery) {
        liveQuery.unsubscribe();
    }
});