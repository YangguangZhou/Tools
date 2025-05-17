<template>
  <div class="dashboard-container">
    <!-- 登录表单 -->
    <div v-if="!auth" class="auth-form-container">
      <div class="auth-form">
        <div class="auth-header">
          <i class="fas fa-lock"></i>
          <h1>管理员登录</h1>
        </div>
        <div class="input-group">
          <input type="password" v-model="password" @keyup.enter="handleAuth" placeholder="请输入密码" />
          <button @click="handleAuth" class="primary-btn btn-with-icon">
            <i class="fas fa-sign-in-alt"></i> 登录
          </button>
        </div>
      </div>
    </div>

    <!-- 管理界面 -->
    <div v-else class="management-container">
      <!-- 切换视图按钮 -->
      <div class="view-toggle">
        <button 
          @click="activeView = 'list'" 
          :class="{'active': activeView === 'list'}" 
          class="toggle-btn"
        >
          <i class="fas fa-list"></i> 项目列表
        </button>
        <button 
          @click="switchToAddView()" 
          :class="{'active': activeView === 'form'}"
          class="toggle-btn"
        >
          <i class="fas fa-plus"></i> {{ isEditing ? '编辑项目' : '新增项目' }}
        </button>
      </div>
      
      <!-- 项目列表视图 -->
      <div v-if="activeView === 'list'" class="project-list">
        <div class="panel-header">
          <h1><i class="fas fa-tasks"></i> 项目管理</h1>
        </div>
        
        <div v-if="isLoading" class="loading">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>
        
        <div v-else class="projects-table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>标题</th>
                <th>简介</th>
                <th>类型</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="project in projects" :key="project.id">
                <td>{{ project.id }}</td>
                <td>{{ project.title }}</td>
                <td class="description">{{ project.description }}</td>
                <td>
                  <span :class="{'tag': true, 'tag-primary': project.mine, 'tag-secondary': !project.mine}">
                    {{ project.mine ? '自建项目' : '外部项目' }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn-small btn-edit" @click="editProject(project)" title="编辑">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-small btn-delete" @click="confirmDelete(project)" title="删除">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- 添加/编辑项目表单 -->
      <div v-else-if="activeView === 'form'" class="project-form panel">
        <div class="panel-header">
          <h1>
            <i :class="isEditing ? 'fas fa-edit' : 'fas fa-plus-circle'"></i>
            {{ isEditing ? '编辑项目' : '新增项目' }}
          </h1>
        </div>
        
        <div class="form-content">
          <div class="form-group">
            <label for="title">标题</label>
            <input id="title" type="text" placeholder="请输入项目标题" v-model="currentProject.title" />
          </div>
          
          <div class="form-group">
            <label for="description">简介</label>
            <textarea id="description" placeholder="请输入项目简介" v-model="currentProject.description"></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group flex-1">
              <label for="icon">
                图标
                <a href="https://fontawesome.com/search" target="_blank" class="external-link">
                  Font Awesome <i class="fas fa-external-link-alt"></i>
                </a>
              </label>
              <div class="icon-preview-container">
                <div class="icon-preview">
                  <i v-if="currentProject.icon" :class="currentProject.icon"></i>
                  <span v-else class="no-icon">无图标</span>
                </div>
                <input id="icon" type="text" placeholder="例如: fas fa-star" v-model="currentProject.icon" />
              </div>
            </div>
            
            <div class="form-group flex-1">
              <label for="url">URL</label>
              <input id="url" type="text" placeholder="https://example.com" v-model="currentProject.url" />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group mine-section flex-1">
              <label for="mine">自建项目</label>
              <div class="toggle-switch">
                <button id="mine" @click="toggleMine" :class="{'toggle-on': currentProject.mine, 'toggle-off': !currentProject.mine}">
                  <span class="toggle-indicator"></span>
                  <span class="toggle-text">{{ currentProject.mine ? '是' : '否' }}</span>
                </button>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label>标签</label>
            <div class="tag-input">
              <input
                type="text"
                placeholder="添加标签"
                v-model="newTag"
                @keydown.enter.prevent="handleAddTag"
              />
              <button @click="handleAddTag" class="tag-add-btn">
                <i class="fas fa-plus"></i> 添加
              </button>
            </div>
            <div class="tags-container">
              <div class="tags">
                <span v-for="(tag, index) in currentProject.tags" :key="index" class="tag tag-interactive">
                  {{ tag }}
                  <i class="fas fa-times tag-remove" @click="handleRemoveTag(index)"></i>
                </span>
                <span v-if="currentProject.tags.length === 0" class="no-tags">暂无标签</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-buttons">
          <button @click="resetForm" class="secondary-btn btn-with-icon">
            <i class="fas fa-redo"></i> 重置
          </button>
          <button @click="activeView = 'list'" class="secondary-btn btn-with-icon">
            <i class="fas fa-arrow-left"></i> 返回
          </button>
          <button 
            @click="handleSubmit" 
            :disabled="isSubmitting || !isFormValid" 
            :class="{'primary-btn': true, 'btn-with-icon': true, 'disabled': isSubmitting || !isFormValid}"
          >
            <i class="fas fa-save"></i> 
            {{ isSubmitting ? '提交中...' : (isEditing ? '更新项目' : '新增项目') }}
          </button>
        </div>
      </div>
      
      <!-- 底部操作区 -->
      <div class="admin-actions">
        <button @click="goHome" class="secondary-btn btn-with-icon">
          <i class="fas fa-home"></i> 返回主页
        </button>
        <button @click="logout" class="warning-btn btn-with-icon">
          <i class="fas fa-sign-out-alt"></i> 退出管理
        </button>
      </div>
    </div>
    
    <!-- 确认删除对话框 -->
    <div v-if="deleteDialogVisible" class="modal">
      <div class="modal-overlay" @click="deleteDialogVisible = false"></div>
      <div class="modal-content">
        <div class="modal-header">
          <i class="fas fa-exclamation-triangle warning-icon"></i>
          <h3>确认删除</h3>
        </div>
        <div class="modal-body">
          <p>确定要删除项目 "<strong>{{ projectToDelete?.title || '' }}</strong>" 吗？</p>
          <p class="warning-text">此操作不可逆!</p>
        </div>
        <div class="modal-buttons">
          <button @click="deleteDialogVisible = false" class="secondary-btn btn-with-icon">
            <i class="fas fa-times"></i> 取消
          </button>
          <button @click="deleteProject" :disabled="isDeletingProject" class="danger-btn btn-with-icon">
            <i class="fas fa-trash"></i> {{ isDeletingProject ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <div class="copyright">
    Copyright &copy; 2023-{{ new Date().getFullYear() }}
    <a href="https://jerryz.com.cn" target="_blank">Jerry Zhou</a>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      auth: false,
      password: '',
      projects: [],
      activeView: 'list',
      currentProject: {
        title: '',
        description: '',
        icon: '',
        tags: [],
        url: '',
        mine: false
      },
      originalProject: null,
      newTag: '',
      isSubmitting: false,
      isLoading: false,
      isEditing: false,
      errorMessage: '',
      deleteDialogVisible: false,
      projectToDelete: null,
      isDeletingProject: false
    };
  },
  computed: {
    isFormValid() {
      return this.currentProject.title && this.currentProject.description && this.currentProject.url;
    }
  },
  created() {
    this.checkAuth();
    if (this.auth) {
      this.fetchProjects();
    }
  },
  methods: {
    // 认证相关
    checkAuth() {
      const authStatus = localStorage.getItem('authStatus');
      if (authStatus === 'true') {
        this.auth = true;
      }
    },
    handleAuth() {
      if (this.password === process.env.VUE_APP_PASSWD) {
        this.auth = true;
        localStorage.setItem('authStatus', 'true');
        this.fetchProjects();
        this.showMessage('登录成功', 'success');
      } else {
        this.showMessage('密码错误', 'error');
      }
    },
    logout() {
      localStorage.removeItem('authStatus');
      this.auth = false;
      this.showMessage('已退出管理界面');
    },
    
    // 显示消息提示
    showMessage(message, type = 'info') {
      this.errorMessage = message;
      alert(message);
    },

    // 获取项目列表
    async fetchProjects() {
      this.isLoading = true;
      try {
        const timestamp = new Date().getTime();
        const res = await axios.get(
          `https://raw.githubusercontent.com/YangguangZhou/Tools/refs/heads/main/public/projects.json?t=${timestamp}`
        );
        this.projects = res.data;
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        this.showMessage('获取项目列表失败，请刷新页面重试', 'error');
      } finally {
        this.isLoading = false;
      }
    },

    // 切换到添加视图
    switchToAddView() {
      if (!this.isEditing) {
        this.resetForm();
      }
      this.activeView = 'form';
    },

    // 标签相关方法
    handleAddTag() {
      if (this.newTag && !this.currentProject.tags.includes(this.newTag)) {
        this.currentProject.tags.push(this.newTag);
        this.newTag = '';
      }
    },
    handleRemoveTag(index) {
      this.currentProject.tags.splice(index, 1);
    },
    toggleMine() {
      this.currentProject.mine = !this.currentProject.mine;
    },

    // 编辑项目
    editProject(project) {
      this.isEditing = true;
      this.originalProject = { ...project };
      // 深拷贝确保不直接修改原对象
      this.currentProject = JSON.parse(JSON.stringify(project));
      this.activeView = 'form';
    },

    // 重置表单
    resetForm() {
      if (this.isEditing) {
        // 恢复到原始值
        this.currentProject = JSON.parse(JSON.stringify(this.originalProject));
      } else {
        this.currentProject = {
          title: '',
          description: '',
          icon: '',
          tags: [],
          url: '',
          mine: false
        };
      }
      this.newTag = '';
      this.errorMessage = '';
    },

    // 确认删除对话框
    confirmDelete(project) {
      this.projectToDelete = project;
      this.deleteDialogVisible = true;
    },

    // 删除项目
    async deleteProject() {
      if (!this.projectToDelete) return;

      this.isDeletingProject = true;
      try {
        // 1. 移除项目
        const projectIndex = this.projects.findIndex(p => p.id === this.projectToDelete.id);
        if (projectIndex === -1) {
          throw new Error('项目不存在');
        }
        
        const updatedProjects = [...this.projects];
        updatedProjects.splice(projectIndex, 1);
        
        // 2. 重新排序ID
        const reorderedProjects = updatedProjects.map((project, index) => ({
          ...project,
          id: (index + 1).toString()
        }));
        
        // 3. 获取最新文件内容和SHA
        const currentFileContent = await this.getCurrentFileContent();
        
        // 4. 提交更改到GitHub
        const githubToken = process.env.VUE_APP_GITHUB_TOKEN;
        const response = await axios.put(
          'https://api.github.com/repos/YangguangZhou/Tools/contents/public/projects.json',
          {
            message: `删除项目: ${this.projectToDelete.title}`,
            content: btoa(unescape(encodeURIComponent(JSON.stringify(reorderedProjects, null, 2)))),
            sha: currentFileContent.sha
          },
          {
            headers: {
              Authorization: `Bearer ${githubToken}`
            }
          }
        );

        if (response.status === 200) {
          this.projects = reorderedProjects;
          this.showMessage('项目删除成功', 'success');
        } else {
          throw new Error('Unexpected response status');
        }
      } catch (error) {
        console.error('Failed to delete project:', error);
        this.showMessage(`删除项目失败: ${error.message}`, 'error');
      } finally {
        this.isDeletingProject = false;
        this.deleteDialogVisible = false;
        this.projectToDelete = null;
      }
    },

    // 提交表单
    async handleSubmit() {
      if (this.isSubmitting || !this.isFormValid) return;

      this.isSubmitting = true;
      const githubToken = process.env.VUE_APP_GITHUB_TOKEN;

      if (!githubToken) {
        this.errorMessage = 'GitHub token is not set';
        this.showMessage('GitHub token未设置', 'error');
        this.isSubmitting = false;
        return;
      }

      try {
        // 获取当前文件内容和SHA
        const currentFileContent = await this.getCurrentFileContent();
        let updatedProjects;
        
        if (this.isEditing) {
          // 编辑现有项目
          updatedProjects = this.projects.map(project => 
            project.id === this.currentProject.id ? this.currentProject : project
          );
        } else {
          // 添加新项目
          const newId = (parseInt(this.projects[this.projects.length - 1].id) + 1).toString();
          const newProject = { id: newId, ...this.currentProject };
          updatedProjects = [...this.projects, newProject];
        }

        // 提交更新
        const response = await axios.put(
          'https://api.github.com/repos/YangguangZhou/Tools/contents/public/projects.json',
          {
            message: this.isEditing ? `更新项目: ${this.currentProject.title}` : `添加项目: ${this.currentProject.title}`,
            content: btoa(unescape(encodeURIComponent(JSON.stringify(updatedProjects, null, 2)))),
            sha: currentFileContent.sha
          },
          {
            headers: {
              Authorization: `Bearer ${githubToken}`
            }
          }
        );

        if (response.status === 200) {
          this.showMessage(this.isEditing ? '项目更新成功' : '项目添加成功', 'success');
          this.projects = updatedProjects;
          
          // 重置状态和表单
          this.resetForm();
          this.isEditing = false;
          this.originalProject = null;
          this.activeView = 'list';
        } else {
          throw new Error('Unexpected response status');
        }
      } catch (error) {
        console.error('Failed to submit project:', error);
        this.showMessage(`${this.isEditing ? '更新' : '添加'}项目失败: ${error.message}`, 'error');
      } finally {
        this.isSubmitting = false;
      }
    },

    // 获取当前文件内容
    async getCurrentFileContent() {
      const githubToken = process.env.VUE_APP_GITHUB_TOKEN;
      try {
        const timestamp = new Date().getTime();
        const response = await axios.get(
          `https://api.github.com/repos/YangguangZhou/Tools/contents/public/projects.json?t=${timestamp}`,
          {
            headers: {
              Authorization: `Bearer ${githubToken}`
            }
          }
        );
        return response.data;
      } catch (error) {
        console.error('Failed to get current file content:', error);
        this.showMessage(`获取当前文件内容失败: ${error.message}`, 'error');
        throw error;
      }
    },

    // 返回主页
    goHome() {
      window.location.href = '/';
    }
  }
};
</script>

<style>
:root {
  --primary-color: #3a86ff;
  --primary-hover: #2667cc;
  --secondary-color: #8338ec;
  --success-color: #06d6a0;
  --warning-color: #ffbe0b;
  --danger-color: #ef476f;
  --light-color: #f8f9fa;
  --dark-color: #212529;
  --gray-color: #6c757d;
  --light-gray: #e9ecef;
  --border-radius: 8px;
  --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
  --font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-family);
  background-color: #f5f7fa;
  color: var(--dark-color);
  line-height: 1.6;
}

.dashboard-container {
  max-width: 1000px;
  margin: 2rem auto;
  padding: 0;
  position: relative;
}

h1, h2, h3, h4 {
  color: var(--dark-color);
  font-weight: 600;
  line-height: 1.2;
}

h1 {
  margin-bottom: 0;
  font-size: 1.8rem;
}

/* ===== 认证表单样式 ===== */
.auth-form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.auth-form {
  width: 400px;
  padding: 2.5rem;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  text-align: center;
  animation: fadeIn 0.5s ease;
}

.auth-header {
  margin-bottom: 2rem;
}

.auth-header i {
  font-size: 3rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.auth-form h1 {
  color: var(--dark-color);
  margin-bottom: 0.5rem;
}

.input-group {
  margin-top: 1.5rem;
}

.auth-form input {
  width: 100%;
  padding: 12px 15px;
  margin-bottom: 1.5rem;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  font-size: 1rem;
  transition: var(--transition);
}

.auth-form input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(58, 134, 255, 0.2);
  outline: none;
}

/* ===== 管理容器样式 ===== */
.management-container {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
  margin-bottom: 2rem;
}

/* ===== 视图切换按钮 ===== */
.view-toggle {
  display: flex;
  background: #f8fafc;
  border-bottom: 1px solid #eaedf2;
}

.toggle-btn {
  flex: 1;
  padding: 1rem 1.25rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--gray-color);
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.toggle-btn.active {
  color: var(--primary-color);
  background-color: white;
}

.toggle-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--primary-color);
}

.toggle-btn:hover:not(.active) {
  background-color: #edf2f7;
  color: var(--dark-color);
}

.toggle-btn i {
  margin-right: 8px;
}

/* ===== 面板标题样式 ===== */
.panel-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eaedf2;
  display: flex;
  align-items: center;
}

.panel-header h1 {
  font-weight: 600;
  color: var(--dark-color);
  margin: 0;
}

.panel-header h1 i {
  margin-right: 10px;
  color: var(--primary-color);
}

.panel {
  border-radius: var(--border-radius);
  background-color: white;
}

/* ===== 项目表格样式 ===== */
.projects-table-container {
  padding: 0 1.5rem 1.5rem;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
  font-size: 0.95rem;
}

th, td {
  padding: 1rem 0.75rem;
  text-align: left;
  vertical-align: middle;
}

th {
  color: var(--gray-color);
  font-weight: 600;
  background-color: #f9fafc;
  border-bottom: 2px solid #eaedf2;
  white-space: nowrap;
}

td {
  border-bottom: 1px solid #eaedf2;
}

tr:hover {
  background-color: #f7fafc;
}

.description {
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--gray-color);
}

/* ===== 标签样式 ===== */
.tag {
  display: inline-block;
  padding: 0.35rem 0.8rem;
  margin: 3px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  line-height: 1;
}

.tag-primary {
  background-color: rgba(58, 134, 255, 0.15);
  color: var(--primary-color);
}

.tag-secondary {
  background-color: rgba(108, 117, 125, 0.15);
  color: var(--gray-color);
}

.tag-interactive {
  display: flex;
  align-items: center;
  padding-right: 0.4rem;
}

.tag-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.8rem;
}

.tag-remove:hover {
  background: rgba(0, 0, 0, 0.2);
}

.no-tags {
  color: #aab0b7;
  font-style: italic;
  display: inline-block;
  padding: 0.5rem 0;
}

/* ===== 表单样式 ===== */
.form-content {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.flex-1 {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
  font-size: 0.95rem;
}

.external-link {
  font-size: 0.85rem;
  color: var(--primary-color);
  margin-left: 0.5rem;
  text-decoration: none;
  opacity: 0.8;
  transition: var(--transition);
}

.external-link:hover {
  opacity: 1;
  text-decoration: underline;
}

input, textarea, select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  font-size: 0.95rem;
  transition: var(--transition);
  background-color: #f9fafc;
  color: var(--dark-color);
}

input:focus, textarea:focus, select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(58, 134, 255, 0.15);
  outline: none;
  background-color: white;
}

textarea {
  min-height: 120px;
  resize: vertical;
}

/* 开关按钮 */
.toggle-switch {
  display: flex;
  align-items: center;
}

.toggle-switch button {
  position: relative;
  width: 100px;
  height: 38px;
  border-radius: 19px;
  border: none;
  cursor: pointer;
  padding: 0 10px;
  font-weight: 500;
  transition: var(--transition);
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.toggle-off {
  background: #eaedf2;
  color: #90949a;
}

.toggle-on {
  background: var(--success-color);
  color: white;
}

.toggle-indicator {
  position: absolute;
  left: 4px;
  top: 4px;
  width: 30px;
  height: 30px;
  background: white;
  border-radius: 50%;
  transition: var(--transition);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-on .toggle-indicator {
  left: calc(100% - 34px);
}

.toggle-text {
  margin-left: 10px;
  font-size: 0.9rem;
  transition: var(--transition);
}

/* 图标预览 */
.icon-preview-container {
  position: relative;
}

.icon-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  width: 50px;
  margin: 0.5rem 0;
  border-radius: var(--border-radius);
  background: #f9fafc;
  font-size: 1.5rem;
  color: var(--primary-color);
}

.no-icon {
  color: #aab0b7;
  font-size: 0.85rem;
}

/* 标签输入 */
.tag-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.tag-input input {
  flex: 1;
}

.tag-add-btn {
  padding: 0.75rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.9rem;
  transition: var(--transition);
  display: flex;
  align-items: center;
}

.tag-add-btn i {
  margin-right: 0.25rem;
}

.tag-add-btn:hover {
  background: var(--primary-hover);
}

.tags-container {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  background: #f9fafc;
  min-height: 80px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* 按钮样式 */
.form-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #eaedf2;
}

button {
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 500;
  font-size: 0.95rem;
  transition: var(--transition);
}

button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-with-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.primary-btn {
  background-color: var(--primary-color);
  color: white;
}

.primary-btn:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.secondary-btn {
  background-color: #edf2f7;
  color: #4a5568;
}

.secondary-btn:hover:not(:disabled) {
  background-color: #e2e8f0;
  color: #2d3748;
}

.danger-btn, .btn-delete {
  background-color: var(--danger-color);
  color: white;
}

.danger-btn:hover:not(:disabled), .btn-delete:hover:not(:disabled) {
  background-color: #d93a5d;
}

.warning-btn {
  background-color: var(--warning-color);
  color: white;
}

.warning-btn:hover:not(:disabled) {
  background-color: #e8ac0a;
}

.btn-small {
  padding: 0.25rem 0.5rem;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-edit {
  background-color: var(--primary-color);
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 4px;
}

.btn-edit:hover {
  background-color: var(--primary-hover);
}

.btn-delete {
  background-color: var(--danger-color);
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 4px;
}

/* 管理操作区域 */
.admin-actions {
  display: flex;
  justify-content: space-between;
  padding: 1.5rem;
  margin-top: 0;
  border-top: 1px solid #eaedf2;
}

/* 加载状态 */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--gray-color);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(58, 134, 255, 0.3);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 模态框样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  border-radius: var(--border-radius);
  max-width: 450px;
  width: 100%;
  z-index: 1001;
  overflow: hidden;
  animation: modalFade 0.3s ease;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: #f9fafc;
  border-bottom: 1px solid #eaedf2;
}

.modal-header .warning-icon {
  font-size: 1.5rem;
  color: var(--warning-color);
  margin-right: 0.75rem;
}

.modal-header h3 {
  margin: 0;
  font-weight: 600;
}

.modal-body {
  padding: 1.5rem;
}

.warning-text {
  color: var(--danger-color);
  font-weight: 500;
  margin-top: 0.75rem;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #eaedf2;
}

@keyframes modalFade {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 版权信息 */
.copyright {
  text-align: center;
  margin: 2rem 0 1.5rem;
  color: #a0aec0;
  font-size: 0.9rem;
}

.copyright a {
  color: #718096;
  text-decoration: none;
  font-weight: 500;
  transition: var(--transition);
}

.copyright a:hover {
  color: var(--primary-color);
}

/* 响应式样式 */
@media (max-width: 768px) {
  .dashboard-container {
    margin: 1rem;
  }
  
  .form-row {
    flex-direction: column;
    gap: 1rem;
  }
  
  .form-buttons, .admin-actions {
    flex-direction: column-reverse;
    gap: 0.75rem;
  }
  
  .form-buttons button, .admin-actions button, .modal-buttons button {
    width: 100%;
  }
  
  .toggle-btn {
    padding: 0.75rem 0.5rem;
    font-size: 0.9rem;
  }
  
  .toggle-btn i {
    margin-right: 4px;
  }
  
  .auth-form {
    width: 90%;
    max-width: 400px;
    padding: 2rem 1.5rem;
  }
  
  .modal-content {
    width: 90%;
    margin: 0 1rem;
  }
}
</style>
