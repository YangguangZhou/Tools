<template>
  <div class="admin-container">
    <!-- 认证区域 -->
    <el-card v-if="!auth" class="auth-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h2><i class="fas fa-lock"></i> 管理员登录</h2>
        </div>
      </template>
      <el-form>
        <el-form-item>
          <el-input
            type="password"
            v-model="password"
            placeholder="请输入密码"
            show-password
            prefix-icon="el-icon-lock"
            @keyup.enter="handleAuth"
          ></el-input>
        </el-form-item>
        <el-button type="primary" @click="handleAuth" class="full-width-btn">
          <i class="fas fa-sign-in-alt"></i> 登录
        </el-button>
      </el-form>
    </el-card>

    <!-- 管理界面 -->
    <div v-else class="admin-dashboard">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 项目列表选项卡 -->
        <el-tab-pane label="项目管理" name="projects">
          <div class="tab-header">
            <h2><i class="fas fa-project-diagram"></i> 项目管理</h2>
            <el-button type="primary" size="small" @click="activeTab = 'add'">
              <i class="fas fa-plus"></i> 新增项目
            </el-button>
          </div>
          
          <el-table
            :data="projects"
            style="width: 100%"
            border
            stripe
            v-loading="isLoading"
            row-key="id"
          >
            <el-table-column prop="id" label="ID" width="70"></el-table-column>
            <el-table-column label="图标" width="70">
              <template #default="scope">
                <i :class="scope.row.icon"></i>
              </template>
            </el-table-column>
            <el-table-column prop="title" label="标题"></el-table-column>
            <el-table-column prop="description" label="简介" show-overflow-tooltip></el-table-column>
            <el-table-column label="类型" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.mine ? 'success' : 'info'">
                  {{ scope.row.mine ? '自建项目' : '外部项目' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button
                  type="primary"
                  size="small"
                  @click="editProject(scope.row)"
                  icon="el-icon-edit"
                  circle
                ></el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click="confirmDelete(scope.row)"
                  icon="el-icon-delete"
                  circle
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 添加项目选项卡 -->
        <el-tab-pane :label="isEditing ? '编辑项目' : '新增项目'" name="add">
          <h2 class="tab-title">
            <i :class="isEditing ? 'fas fa-edit' : 'fas fa-plus-circle'"></i>
            {{ isEditing ? '编辑项目' : '新增项目' }}
          </h2>
          
          <el-form ref="projectForm" :model="currentProject" label-position="top">
            <el-form-item label="标题" required>
              <el-input v-model="currentProject.title" placeholder="项目标题"></el-input>
            </el-form-item>
            
            <el-form-item label="简介" required>
              <el-input
                type="textarea"
                v-model="currentProject.description"
                rows="4"
                placeholder="项目简介"
              ></el-input>
            </el-form-item>
            
            <el-form-item label="图标">
              <div class="icon-input-group">
                <el-input v-model="currentProject.icon" placeholder="Font Awesome 图标类名">
                  <template #prepend>
                    <i :class="currentProject.icon || 'fas fa-question'"></i>
                  </template>
                </el-input>
                <a href="https://fontawesome.com/search" target="_blank" class="icon-link">
                  <i class="fas fa-external-link-alt"></i> 浏览图标
                </a>
              </div>
            </el-form-item>
            
            <el-form-item label="URL" required>
              <el-input v-model="currentProject.url" placeholder="项目链接"></el-input>
            </el-form-item>
            
            <el-form-item label="项目类型">
              <el-switch
                v-model="currentProject.mine"
                active-text="自建项目"
                inactive-text="外部项目"
                active-color="#13ce66"
                inactive-color="#909399"
              ></el-switch>
            </el-form-item>
            
            <el-form-item label="标签">
              <div class="tag-input-group">
                <el-input
                  v-model="newTag"
                  placeholder="输入标签后按Enter添加"
                  @keydown.enter.prevent="handleAddTag"
                >
                  <template #append>
                    <el-button @click="handleAddTag">添加</el-button>
                  </template>
                </el-input>
              </div>
              
              <div class="tags-container">
                <el-tag
                  v-for="(tag, index) in currentProject.tags"
                  :key="index"
                  closable
                  @close="handleRemoveTag(index)"
                  class="project-tag"
                >
                  {{ tag }}
                </el-tag>
                <div v-if="currentProject.tags.length === 0" class="no-tags">
                  暂无标签，请添加
                </div>
              </div>
            </el-form-item>
            
            <div class="form-actions">
              <el-button @click="resetForm" plain>重置</el-button>
              <el-button @click="activeTab = 'projects'">返回列表</el-button>
              <el-button
                type="primary"
                @click="handleSubmit"
                :loading="isSubmitting"
                :disabled="!isFormValid"
              >
                {{ isSubmitting ? '提交中...' : (isEditing ? '更新项目' : '新增项目') }}
              </el-button>
            </div>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      
      <div class="admin-footer">
        <el-button type="info" @click="goHome" plain icon="el-icon-s-home">
          返回首页
        </el-button>
        <el-button type="warning" @click="logout" plain icon="el-icon-switch-button">
          退出管理
        </el-button>
      </div>
    </div>

    <!-- 确认删除对话框 -->
    <el-dialog
      title="确认删除"
      v-model="deleteDialogVisible"
      width="30%"
      :close-on-click-modal="false"
    >
      <span>确定要删除项目 "{{ projectToDelete?.title || '' }}" 吗？此操作不可逆!</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="deleteProject" :loading="isDeletingProject">
            确认删除
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
  
  <div class="copyright">
    Copyright &copy; 2023-{{ new Date().getFullYear() }}
    <a href="https://jerryz.com.cn" target="_blank">Jerry Zhou</a>
  </div>
</template>

<script>
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';

export default {
  data() {
    return {
      auth: false,
      password: '',
      projects: [],
      activeTab: 'projects',
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
  async created() {
    this.checkAuth();
    await this.fetchProjects();
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
        ElMessage.success('登录成功');
      } else {
        ElMessage.error('密码错误');
      }
    },
    logout() {
      localStorage.removeItem('authStatus');
      this.auth = false;
      ElMessage.info('已退出管理界面');
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
        ElMessage.error('获取项目列表失败，请刷新页面重试');
      } finally {
        this.isLoading = false;
      }
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

    // 编辑项目
    editProject(project) {
      this.isEditing = true;
      this.originalProject = { ...project };
      this.currentProject = JSON.parse(JSON.stringify(project)); // 深拷贝
      this.activeTab = 'add';
    },

    // 重置表单
    resetForm() {
      if (this.isEditing) {
        this.currentProject = JSON.parse(JSON.stringify(this.originalProject)); // 恢复到原始值
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
          ElMessage.success('项目删除成功');
        } else {
          throw new Error('Unexpected response status');
        }
      } catch (error) {
        console.error('Failed to delete project:', error);
        ElMessage.error(`删除项目失败: ${error.message}`);
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
        ElMessage.error('GitHub token未设置');
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
          ElMessage.success(this.isEditing ? '项目更新成功' : '项目添加成功');
          this.projects = updatedProjects;
          
          // 重置状态和表单
          this.resetForm();
          this.isEditing = false;
          this.originalProject = null;
          this.activeTab = 'projects';
        } else {
          throw new Error('Unexpected response status');
        }
      } catch (error) {
        console.error('Failed to submit project:', error);
        ElMessage.error(`${this.isEditing ? '更新' : '添加'}项目失败: ${error.message}`);
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
        ElMessage.error(`获取当前文件内容失败: ${error.message}`);
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
.admin-container {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.auth-card {
  max-width: 400px;
  margin: 4rem auto;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.auth-card .card-header {
  text-align: center;
}

.auth-card h2 {
  margin: 0;
  color: #409EFF;
}

.full-width-btn {
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
  margin-top: 10px;
}

.admin-dashboard {
  animation: fadeIn 0.5s ease-out;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.tab-title {
  text-align: center;
  color: #409EFF;
  margin-bottom: 2rem;
}

.icon-input-group {
  display: flex;
  align-items: center;
}

.icon-link {
  margin-left: 10px;
  color: #409EFF;
  font-size: 0.9rem;
}

.tag-input-group {
  margin-bottom: 10px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
  min-height: 32px;
  padding: 5px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
}

.project-tag {
  margin-right: 0;
}

.no-tags {
  color: #909399;
  font-size: 0.9rem;
  padding: 5px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 2rem;
}

.admin-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #ebeef5;
}

/* Copyright section */
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

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive styling */
@media (max-width: 768px) {
  .admin-container {
    margin: 1rem;
    padding: 0;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions button {
    margin-bottom: 10px;
  }
  
  .admin-footer {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
