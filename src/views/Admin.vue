<template>
    <div class="container">
      <div v-if="!auth">
        <h1>Please enter the password</h1>
        <input type="password" v-model="password" />
        <button @click="handleAuth">Submit</button>
      </div>
      <div v-else>
        <h1>New Project</h1>
        <input type="text" placeholder="Title" v-model="newProject.title" />
        <textarea placeholder="Description" v-model="newProject.description"></textarea>
        <input type="text" placeholder="Icon" v-model="newProject.icon" />
        <input type="text" placeholder="URL" v-model="newProject.url" />
        <label>
          Mine
          <input type="checkbox" v-model="newProject.mine" />
        </label>
        <div class="tags">
          <span
            v-for="(tag, index) in newProject.tags"
            :key="index"
            class="tag"
          >
            {{ tag }}
            <button @click="handleRemoveTag(index)">x</button>
          </span>
          <input
            type="text"
            placeholder="Add a tag"
            v-model="newTag"
            @keydown.enter.prevent="handleAddTag"
          />
        </div>
        <button @click="handleSubmit">Add Project</button>
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
          alert('Incorrect password');
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
          alert('Project added successfully');
        } catch (error) {
          console.error(error);
          alert('Failed to add project');
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
    padding: 0.5rem;
    margin: 0.5rem 0;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .tag {
    background-color: #e0f7fa;
    padding: 0.5rem;
    border-radius: 4px;
    display: flex;
    align-items: center;
  }
  
  .tag button {
    background: none;
    border: none;
    margin-left: 0.5rem;
    cursor: pointer;
  }
  
  button {
    padding: 0.5rem 1rem;
    background-color: #0070f3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #005bb5;
  }
  </style>
  