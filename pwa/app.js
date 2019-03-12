// Settings.
const baseUrl = 'https://cmgt.hr.nl:8000/';

// Register serviceworker and start app.
window.addEventListener('load', () => {
  getTags();
  getProjects();

  // Get projects whe tag selector updates.
  document.getElementById('tags').addEventListener('change', event => {
    getProjects(event.target.value);
  });

  // Register serviceworker.
  if ('serviceWorker' in navigator) {
    try {
      navigator.serviceWorker.register('service-worker.js');
      console.log('Service Worker Registered!');
    }
    catch (e) {
      console.log('Service Worker registration failed');
    }
  }
});

// Get all projects and place them in the projects container.
const getProjects = async (tag = '') => {
  const res = await fetch(`${baseUrl}api/projects?tag=${tag}`);
  const json = await res.json();

  document.getElementById('projects').innerHTML = json.projects.map(buildProject).join('\n');
};

// Get all tags and place them in the tags container.
const getTags = async () => {
  const res = await fetch(`${baseUrl}api/projects/tags/`);
  const json = await res.json();

  document.getElementById('tags').innerHTML += json.tags.map(buildTag).join('\n');
};

// Build the project HTML.
const buildProject = project => {
  if (project.fallback) {
    return `
      <div class="project">
        <h2>${project.message}</h2>
      </div>
    `;
  }
  return `
    <div class="project">
      <h2>${project.title}</h2>
      <div class="headerImage" style="background-image: url(${baseUrl}${project.headerImage})" />
    </div>
  `;
};

// Build the tag HTML.
const buildTag = tag => {
  const capitalized = tag.charAt(0).toUpperCase() + tag.slice(1);
  return `
    <option value="${tag}">${capitalized}</option>
  `;
};
