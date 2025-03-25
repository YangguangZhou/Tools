<template>
  <div class="container">
    <!-- 登录表单 -->
    <div v-if="!auth" class="auth-form">
      <h1>管理员登录</h1>
      <input type="password" v-model="password" @keyup.enter="handleAuth" placeholder="请输入密码" />
      <button @click="handleAuth" class="primary-btn">登录</button>
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
        <h1>项目管理</h1>
        <div v-if="isLoading" class="loading">加载中...</div>
        
        <div v-else class="projects-table">
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
                  <span :class="{'tag': true, 'tag-primary': project.mine}">
                    {{ project.mine ? '自建项目' : '外部项目' }}
                  </span>
                </td>
                <td>
                  <button class="btn-small btn-edit" @click="editProject(project)">
                    <i class="fas fa-edit"></i> 编辑
                  </button>
                  <button class="btn-small btn-delete" @click="confirmDelete(project)">
                    <i class="fas fa-trash"></i> 删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- 添加/编辑项目表单 -->
      <div v-else-if="activeView === 'form'" class="project-form">
        <h1>{{ isEditing ? '编辑项目' : '新增项目' }}</h1>
        <div class="form-group">
          <label for="title">标题</label>
          <input id="title" type="text" placeholder="标题" v-model="currentProject.title" />
        </div>
        <div class="form-group">
          <label for="description">简介</label>
          <textarea id="description" placeholder="简介" v-model="currentProject.description"></textarea>
        </div>
        <div class="form-group">
          <label for="icon">
            图标
            <a href="https://fontawesome.com/search" target="_blank">Font Awesome</a>
          </label>
          <div class="icon-preview">
            <i v-if="currentProject.icon" :class="currentProject.icon"></i>
            <span v-else class="no-icon">无图标</span>
          </div>
          <input id="icon" type="text" placeholder="图标" v-model="currentProject.icon" />
        </div>
        <div class="form-group">
          <label for="url">URL</label>
          <input id="url" type="text" placeholder="URL" v-model="currentProject.url" />
        </div>
        <div class="form-group mine-section">
          <label for="mine">自建项目</label>
          <button id="mine" @click="toggleMine" :class="{'active': currentProject.mine}">
            {{ currentProject.mine ? '是' : '否' }}
          </button>
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
            <button @click="handleAddTag" class="tag-add-btn">添加</button>
          </div>
          <div class="tags">
            <span v-for="(tag, index) in currentProject.tags" :key="index" class="tag">
              {{ tag }}
              <i class="fas fa-xmark tag-remove" @click="handleRemoveTag(index)"></i>
            </span>
            <span v-if="currentProject.tags.length === 0" class="no-tags">暂无标签</span>
          </div>
        </div>
        <div class="form-buttons">
          <button @click="resetForm" class="secondary-btn">
            <i class="fas fa-redo"></i> 重置
          </button>
          <button @click="activeView = 'list'" class="secondary-btn">
            <i class="fas fa-arrow-left"></i> 返回
          </button>
          <button 
            @click="handleSubmit" 
            :disabled="isSubmitting || !isFormValid" 
            class="primary-btn"
          >
            <i class="fas fa-save"></i> 
            {{ isSubmitting ? '提交中...' : (isEditing ? '更新项目' : '新增项目') }}
          </button>
        </div>
      </div>
      
      <div class="admin-actions">
        <button @click="goHome" class="secondary-btn">
          <i class="fas fa-home"></i> 返回主页
        </button>
        <button @click="logout" class="warning-btn">
          <i class="fas fa-sign-out-alt"></i> 退出管理
        </button>
      </div>
    </div>
    
    <!-- 确认删除对话框 -->
    <div v-if="deleteDialogVisible" class="modal">
      <div class="modal-content">
        <h3>确认删除</h3>
        <p>确定要删除项目 "{{ projectToDelete?.title || '' }}" 吗？此操作不可逆!</p>
        <div class="modal-buttons">
          <button @click="deleteDialogVisible = false" class="secondary-btn">取消</button>
          <button @click="deleteProject" :disabled="isDeletingProject" class="danger-btn">
            {{ isDeletingProject ? '删除中...' : '确认删除' }}
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
        const res = await axios.get(
          'https://cdn.jsdelivr.net/gh/YangguangZhou/Tools@main/public/projects.json'
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
        const response = await axios.get(
          'https://api.github.com/repos/YangguangZhou/Tools/contents/public/projects.json',
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

<style scoped>
.container {
  max-width: 900px;
  margin: 2rem auto;
  padding: 1rem;
  position: relative;
}

h1 {
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
}

/* 认证表单样式 */
.auth-form {
  max-width: 400px;
  margin: 4rem auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  text-align: center;
}

.auth-form input {
  width: 100%;
  padding: 10px;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

/* 管理容器样式 */
.management-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  overflow: hidden;
  padding: 1rem;
}

/* 视图切换按钮 */
.view-toggle {
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 1.5rem;
}

.toggle-btn {
  flex: 1;
  padding: 0.75rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  transition: all 0.2s;
}

.toggle-btn.active {
  color: #279cff;
  border-bottom: 2px solid #279cff;
}

.toggle-btn:hover {
  background-color: #f9f9f9;
}

/* 项目表格样式 */
.projects-table {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f8f8f8;
  font-weight: bold;
}

tr:hover {
  background-color: #f5f5f5;
}

.description {
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 标签样式 */
.tag {
  display: inline-block;
  padding: 4px 8px;
  margin: 3px;
  background-color: #e1f5fe;
  color: #0288d1;
  border-radius: 16px;
  font-size: 14px;
}

.tag-primary {
  background-color: #e3f2fd;
  color: #1976d2;
}

.tag-remove {
  margin-left: 4px;
  cursor: pointer;
}

.no-tags {
  color: #999;
  font-style: italic;
}

/* 表单样式 */
.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #555;
}

input, textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.mine-section {
  display: flex;
  align-items: center;
}

.mine-section label {
  margin-right: 1rem;
  margin-bottom: 0;
}

.mine-section button {
  width: auto;
  padding: 8px 16px;
}

.mine-section button.active {
  background-color: #4CAF50;
}

.tag-input {
  display: flex;
  gap: 8px;
}

.tag-input input {
  flex: 1;
}

.tag-add-btn {
  padding: 8px 16px;
  background: #279cff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.tags {
  margin-top: 10px;
  min-height: 40px;
  padding: 8px;
  border: 1px dashed #ddd;
  border-radius: 4px;
}

.icon-preview {
  margin: 10px 0;
  font-size: 24px;
  color: #279cff;
}

.no-icon {
  color: #999;
  font-size: 14px;
}

/* 按钮样式 */
.form-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 1rem;
}

button {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.primary-btn {
  background-color: #279cff;
  color: white;
}

.primary-btn:hover:not(:disabled) {
  background-color: #2180d8;
}

.secondary-btn {
  background-color: #f2f2f2;
  color: #333;
}

.secondary-btn:hover {
  background-color: #e6e6e6;
}

.danger-btn, .btn-delete {
  background-color: #ff4d4f;
  color: white;
}

.danger-btn:hover:not(:disabled), .btn-delete:hover {
  background-color: #d9363e;
}

.warning-btn {
  background-color: #faad14;
  color: white;
}

.warning-btn:hover {
  background-color: #d48806;
}

.btn-small {
  padding: 4px 8px;
  font-size: 14px;
  margin-right: 4px;
}

.btn-edit {
  background-color: #279cff;
  color: white;
}

.btn-edit:hover {
  background-color: #2180d8;
}

/* 管理操作区域 */
.admin-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

/* 加载状态 */
.loading {
  text-align: center;
  padding: 2rem;
  color: #999;
}

/* 模态框样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  max-width: 400px;
  width: 100%;
}

.modal-content h3 {
  margin-top: 0;
  color: #333;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 1.5rem;
}

/* 版权信息 */
.copyright {
  text-align: center;
  margin: 2rem 0 1rem 0;
  color: #999;
  font-size: 14px;
}

.copyright a {
  text-decoration: none;
  font-weight: bold;
  color: unset;
  transition: opacity 0.2s;
}

.copyright a:hover {
  opacity: 0.5;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .container {
    margin: 1rem;
    padding: 0.5rem;
  }
  
  .form-buttons, .admin-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .form-buttons button, .admin-actions button {
    width: 100%;
  }
  
  .toggle-btn {
    padding: 8px;
    font-size: 14px;
  }
}
</style>
