window.addEventListener('load', () => {
  getTags();
  getProjects();

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

const getProjects = async (tag = '') => {
  const res = await fetch(`http://cmgt.hr.nl:8000/api/projects?tag=${tag}`);
  const json = await res.json();

  document.getElementById('projects').innerHTML = json.projects.map(buildProject).join('\n');
};

const getTags = async () => {
  const res = await fetch('http://cmgt.hr.nl:8000/api/projects/tags/');
  const json = await res.json();

  document.getElementById('tags').innerHTML += json.tags.map(buildTag).join('\n');
};

const buildProject = project => {
  return `
    <div class="project">
      <h2>${project.title}</h2>
    </div>
  `;
};

const buildTag = tag => {
  return `
    <li>
      <a onclick="getProjects('${tag}')">${tag}</a>
    </li>
  `;
};
