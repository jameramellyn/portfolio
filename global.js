console.log("IT'S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'resume/', title: 'Resume' },
    { url: 'contact/', title: 'Contact' },
    { url: 'https://github.com/jameramellyn', title: 'Github' },
  ];

const nav = document.createElement('nav');
document.body.prepend(nav); 

const BASE_PATH =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "/"
    : "/portfolio/";

    for (let p of pages) {
        let url = p.url;
        let title = p.title;
      
        url = !url.startsWith('http') ? BASE_PATH + url : url;
      
        let a = document.createElement('a');
        a.href = url;
        a.textContent = title;
      
        a.classList.toggle(
          'current',
          a.host === location.host && a.pathname === location.pathname
        );
      
        if (a.host !== location.host) {
          a.target = "_blank";
        }
      
        nav.append(a);
      }    
// ==========================
// THEME SWITCHER UI
// ==========================

document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <label class="color-scheme">
      Theme:
      <select>
        <option value="light dark">Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
    `
  );
  
  const select = document.querySelector('.color-scheme select');
  
  function setColorScheme(scheme) {
    document.documentElement.style.setProperty('color-scheme', scheme);
  }
  
  
  select.addEventListener('input', function (event) {
    const value = event.target.value;
    console.log('color scheme changed to', value);
  
    setColorScheme(value);
  
    localStorage.colorScheme = value;
  });
  
  
  if ('colorScheme' in localStorage) {
    const saved = localStorage.colorScheme;
  
    setColorScheme(saved);
    select.value = saved;
  }



    const form = document.querySelector('form');

    form?.addEventListener('submit', function (event) {
    event.preventDefault();

    const data = new FormData(form);
    let url = form.action + '?';
    let params = [];

    for (let [name, value] of data) {
        params.push(`${name}=${encodeURIComponent(value)}`);
    }

    url += params.join('&');
    location.href = url;
    });

// const $$ = (selector, context = document) =>
//     Array.from(context.querySelectorAll(selector));
  
//   const navLinks = $$("nav a");
  
//   let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname,
//   );
  
//   currentLink?.classList.add('current');