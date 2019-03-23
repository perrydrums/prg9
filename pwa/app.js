// Settings.
const baseUrl = 'https://cmgt.hr.nl:8000/';
const DB_NAME = 'cmgt';
const DB_VERSION = 1;
let db;

// Register serviceworker and start app.
window.addEventListener('load', () => {

  // Create new indexedDB.
  const request = indexedDB.open(DB_NAME, DB_VERSION);

  request.onupgradeneeded = e => {
    console.log('IndexedDB:', 'Updating...');
    request.result.createObjectStore('projects', { keyPath: '_id' });
    request.result.createObjectStore('tags');
  };

  request.onsuccess = e => {
    db = request.result;
    console.log('IndexedDB:', 'Success.');
  };
  request.onerror = e => console.log('IndexedDB:', 'Error: ' + e.message);


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
  try {
    const res = await fetch(`${baseUrl}api/projects?tag=${tag}`);
    const json = await res.json();

    console.log('IndexedDB:', 'Online, saving projects to DB...');
    const transaction = db.transaction('projects', 'readwrite');
    const projectOS = transaction.objectStore('projects');

    json.projects.forEach(p => {
      projectOS.add(p);
    });
  }
  catch (e) {
    console.log('IndexedDB:', 'Offline, getting projects from DB...');
  }

  const transaction = db.transaction('projects', 'readonly');
  const projectOS = transaction.objectStore('projects');

  projectOS.getAll().onsuccess = e => {
    if (e.target.result.length) {
      document.getElementById('projects').innerHTML = e.target.result.map(buildProject).join('\n');
    }
    else {
      document.getElementById('projects').innerHTML = buildProject({fallback: true});
    }
  }
};

// Get all tags and place them in the tags container.
const getTags = async () => {
  try {
    const res = await fetch(`${baseUrl}api/projects/tags/`);
    const json = await res.json();

    console.log('IndexedDB:', 'Online, saving tags to DB...');
    const transaction = db.transaction('tags', 'readwrite');
    const tagsOS = transaction.objectStore('tags');

    json.tags.forEach(t => {
      tagsOS.add(t, t);
    });
  }
  catch (e) {
    console.log('IndexedDB:', 'Offline, getting tags from DB...');
  }

  const transaction = db.transaction('tags', 'readonly');
  const tagsOS = transaction.objectStore('tags');

  tagsOS.getAll().onsuccess = e => {
    document.getElementById('tags').innerHTML += e.target.result.map(buildTag).join('\n');
  }
};

// Build the project HTML.
const buildProject = project => {
  if (project.fallback) {
    return `
      <div class="project">
        <h2>Geen projecten gevonden.</h2>
      </div>
    `;
  }
  return `
    <div class="project">
      <h2>${project.title}</h2>
      <img class="headerImage" src="${baseUrl}${project.headerImage}" onerror="setPlaceholder(this)" />
      <p>${project.description}</p>
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

const setPlaceholder = img => {
  img.src = './images/placeholder.gif';
};
