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
.container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

h1 {
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #555;
}

input,
textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #279cff;
}

textarea {
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
  box-sizing: border-box; /* Ensures the padding and border are included in the element's total width and height */
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tag {
  background-color: #e1f5fe;
  color: #0288d1;
  padding: 0.4rem 0.8rem;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  font-size: 0.9rem;
  line-height: 1.1rem; /* Ensures vertical alignment */
  transition: background-color 0.3s ease;
}

.tag:hover {
  background-color: #b3e5fc;
}

.tag-remove {
  background: none;
  border: none;
  margin-left: 0.5rem;
  cursor: pointer;
  font-size: 0.8rem;
  color: #0288d1;
  transition: color 0.3s ease;
}

.tag-remove:hover {
  color: #01579b;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #279cff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
  margin-bottom: 0.5rem; /* Added to separate buttons */
}

button:hover:not(:disabled) {
  background-color: #2180d8;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.go-home-button {
  margin-top: 0; /* Remove extra margin from the go-home button */
}

.mine-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mine-section button {
  width: auto;
  padding: 0.5rem 1rem;
}

.mine-section button.active {
  background-color: #4CAF50;
}

.auth-form input {
  margin-bottom: 1rem;
}

input[type="text"] {
  margin-bottom: 0.5rem;
}

.error-message {
  color: red;
  margin-top: 1rem;
  text-align: center;
}

a {
  text-decoration: none;
  font-weight: bold;
  color: #999;
  transition: opacity 0.2s;
}

a:hover {
  opacity: 0.5;
}

@media (max-width: 768px) {
  .container {
    margin: 1rem;
    padding: 1.5rem;
  }
}

/* Added styles for copyright section */
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
</style>