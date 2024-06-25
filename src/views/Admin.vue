<template>
  <div class="container">
    <div v-if="!auth">
      <h1>请输入密码</h1>
      <input type="password" v-model="password" placeholder="输入密码"/>
      <button @click="handleAuth">提交</button>
    </div>
    <div v-else>
      <h1>新增项目</h1>
      <input type="text" placeholder="标题" v-model="newProject.title" />
      <textarea placeholder="简介" v-model="newProject.description"></textarea>
      <input type="text" placeholder="图标URL" v-model="newProject.icon" />
      <input type="text" placeholder="项目URL" v-model="newProject.url" />
      <div class="toggle-row">
        <label>
          自建项目
          <button @click="toggleMine" :class="{'active': newProject.mine}">
            {{ newProject.mine ? '是' : '否' }}
          </button>
        </label>
      </div>
      <div class="tags">
        <span v-for="(tag, index) in newProject.tags" :key="index" class="tag">
          {{ tag }}
          <span class="tag-remove" @click="handleRemoveTag(index)">✖</span>
        </span>
        <input
          type="text"
          placeholder="添加标签"
          v-model="newTag"
          @keydown.enter.prevent="handleAddTag"
        />
      </div>
      <button @click="handleSubmit">新增项目</button>
    </div>
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
      newTag: ''
    };
  },
  async created() {
    const res = await axios.get(
      'https://cdn.jsdelivr.net/gh/YangguangZhou/Tools@main/public/projects.json'
    );
    this.projects = res.data;
  },
  methods: {
    handleAuth() {
      if (this.password === process.env.VUE_APP_PASSWD) {
        this.auth = true;
      } else {
        alert('密码错误');
      }
    },
    handleAddTag() {
      if (this.newTag) {
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
      const newId = parseInt(this.projects[this.projects.length - 1].id) + 1;
      const updatedProject = { ...this.newProject, id: newId.toString() };
      const updatedProjects = [...this.projects, updatedProject];
      const githubToken = process.env.VUE_APP_GITHUB_TOKEN;

      try {
        await axios.put(
          'https://api.github.com/repos/YangguangZhou/Tools/contents/public/projects.json',
          {
            message: 'Add new project',
            content: btoa(JSON.stringify(updatedProjects, null, 2)),
            sha: 'your_sha_value' // Replace with the SHA value of the file
          },
          {
            headers: {
              Authorization: `Bearer ${githubToken}`
            }
          }
        );
        alert('项目添加成功');
      } catch (error) {
        console.error(error);
        alert('添加项目失败');
      }
    }
  }
};
</script>

<style>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

input, textarea {
  width: 100%;
  padding: 0.8rem;
  margin-top: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.toggle-row {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.tag {
  background-color: #e0f7fa;
  padding: 0.3rem 0.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
}

.tag-remove {
  background: none;
  border: none;
  margin-left: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  color: #ff5e57;
  border-radius: 50%;
  width: 1.2rem;
  height: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.tag-remove:hover {
  background-color: #ffcdd2;
}

button {
  padding: 0.8rem 1.5rem;
  background-color: #0070f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #005bb5;
}

button.active {
  background-color: #28a745;
}

button.active:hover {
  background-color: #218838;
}

label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

input[type="text"]::placeholder,
textarea::placeholder {
  color: #999;
}
</style>
