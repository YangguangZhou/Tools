<template>
  <div class="container">
    <div v-if="!auth" class="auth-form">
      <h1>请输入密码</h1>
      <input type="password" v-model="password" @keyup.enter="handleAuth" />
      <button @click="handleAuth">登录</button>
    </div>
    <div v-else class="project-form">
      <h1>新增项目</h1>
      <div class="form-group">
        <label for="title">标题</label>
        <input id="title" type="text" placeholder="标题" v-model="newProject.title" />
      </div>
      <div class="form-group">
        <label for="description">简介</label>
        <textarea id="description" placeholder="简介" v-model="newProject.description"></textarea>
      </div>
      <div class="form-group">
        <label for="icon">
          图标
          <a href="https://fontawesome.com/search" target="_blank">Font Awesome</a>
        </label>
        <input id="icon" type="text" placeholder="图标" v-model="newProject.icon" />
      </div>
      <div class="form-group">
        <label for="url">URL</label>
        <input id="url" type="text" placeholder="URL" v-model="newProject.url" />
      </div>
      <div class="form-group mine-section">
        <label for="mine">自建项目</label>
        <button id="mine" @click="toggleMine" :class="{'active': newProject.mine}">
          {{ newProject.mine ? '是' : '否' }}
        </button>
      </div>
      <div class="form-group">
        <label>标签</label>
        <input
          type="text"
          placeholder="添加标签"
          v-model="newTag"
          @keydown.enter.prevent="handleAddTag"
        />
        <div class="tags">
          <span v-for="(tag, index) in newProject.tags" :key="index" class="tag">
            {{ tag }}
            <i class="fas fa-xmark tag-remove" @click="handleRemoveTag(index)"></i>
          </span>
        </div>
      </div>
      <button @click="handleSubmit" :disabled="isSubmitting">
        {{ isSubmitting ? '提交中...' : '新增项目' }}
      </button>
      <button @click="goHome" class="go-home-button">回到主页</button>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    </div>
  </div>
  <div class="copyright">
    Copyright &copy; 2023-2024
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
      newProject: {
        title: '',
        description: '',
        icon: '',
        tags: [],
        url: '',
        mine: false
      },
      newTag: '',
      isSubmitting: false,
      errorMessage: ''
    };
  },
  async created() {
    this.checkAuth();
    try {
      const res = await axios.get(
        'https://cdn.jsdelivr.net/gh/YangguangZhou/Tools@main/public/projects.json'
      );
      this.projects = res.data;
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      alert('获取项目列表失败，请刷新页面重试');
    }
  },
  methods: {
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
      } else {
        alert('密码错误');
      }
    },
    handleAddTag() {
      if (this.newTag && !this.newProject.tags.includes(this.newTag)) {
        this.newProject.tags.push(this.newTag);
        this.newTag = '';
      }
    },
    handleRemoveTag(index) {
      this.newProject.tags.splice(index, 1);
    },
    toggleMine() {
      this.newProject.mine = !this.newProject.mine;
    },
    async handleSubmit() {
      if (this.isSubmitting) return;

      this.isSubmitting = true;
      const newId = (parseInt(this.projects[this.projects.length - 1].id) + 1).toString();
      const updatedProject = { id: newId, ...this.newProject };
      const githubToken = process.env.VUE_APP_GITHUB_TOKEN;

      if (!githubToken) {
        this.errorMessage = 'GitHub token is not set';
        console.error('GitHub token is not set');
        this.isSubmitting = false;
        return;
      }

      try {
        // Re-fetch the current file content and its SHA before submitting
        const currentFileContent = await this.getCurrentFileContent();
        console.log('Current file content fetched:', currentFileContent);

        const updatedProjects = [...this.projects, updatedProject];
        const response = await axios.put(
          'https://api.github.com/repos/YangguangZhou/Tools/contents/public/projects.json',
          {
            message: 'Add new project',
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
          alert('项目添加成功');
          this.resetForm();
          // Update the local projects array with the new project
          this.projects = updatedProjects;
        } else {
          throw new Error('Unexpected response status');
        }
      } catch (error) {
        console.error('Failed to add project:', error);
        this.errorMessage = `添加项目失败，请重试: ${error.message}`;
      } finally {
        this.isSubmitting = false;
      }
    },
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
        this.errorMessage = `获取当前文件内容失败: ${error.message}`;
        throw error;
      }
    },
    resetForm() {
      this.newProject = {
        title: '',
        description: '',
        icon: '',
        tags: [],
        url: '',
        mine: false
      };
      this.newTag = '';
      this.errorMessage = '';
    },
    goHome() {
      window.location.href = '/';
    }
  }
};
</script>

<style scoped>
:root {
  --primary-color: #279cff;
  --secondary-color: #2180d8;
  --background-color: #f5f5f5;
  --text-color: #333;
  --border-color: #e0e0e0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: var(--background-color);
  margin: 0;
  padding: 0;
  color: var(--text-color);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.container {
  width: 90%;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  box-sizing: border-box;
}

h1 {
  color: var(--primary-color);
  margin-bottom: 2rem;
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-color);
}

input,
textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background-color: #fff;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(39, 156, 255, 0.2);
}

textarea {
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
}

.tags {
  display: flex;
  flex-wrap: