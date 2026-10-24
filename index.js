// Replace null with each project's exact GitHub URL. Unconfigured cards stay
// non-clickable instead of sending visitors to the wrong repository.
const projects = [
  {title:'Low Price Center', image:'images/project-low-price.svg', url:'https://github.com/CSES-Open-Source/LowPriceCenter'},
  {title:'Where Droughts Hide', image:'images/project-drought.svg', url:'https://github.com/pemam238/DSC-106-Final-Project'},
  {title:'OnWise', image:'images/project-onwise.svg', url:'https://github.com/speechara18/cal-hacks-fa25-submission'},
  {title:'Predicting Food Recipe Origins', image:'images/project-food.svg', url:'https://github.com/ColecamC/recipes-predictive-project'}
];
const grid = document.getElementById('project-grid');
projects.forEach(project => {
  const card = document.createElement(project.url ? 'a' : 'div');
  card.className = 'project-card';
  if(project.url){card.href=project.url;card.target='_blank';card.rel='noopener noreferrer';card.setAttribute('aria-label',`${project.title} — view GitHub repository`);}
  else card.title='Add the project GitHub URL in index.js';
  const title=document.createElement('span');title.className='titlebar';title.textContent=project.title;
  const image=document.createElement('img');image.src=project.image;image.alt=`${project.title} preview placeholder`;image.loading='lazy';
  card.append(title,image);grid.append(card);
});

// Put your full-size art here; thumbnails and arrows use this same list.
const artworks = Array.from({length:8},(_,i)=>({src:`images/art-${String(i+1).padStart(2,'0')}.svg`,title:`Artwork ${i+1}`,alt:`Artwork ${i+1} placeholder — replace with your art`}));
let current=0;
const mainImage=document.getElementById('art-main');
const caption=document.getElementById('art-caption');
const thumbnails=document.getElementById('thumbnails');
function showArtwork(index){current=(index+artworks.length)%artworks.length;mainImage.src=artworks[current].src;mainImage.alt=artworks[current].alt;caption.textContent=`${artworks[current].title} · ${current+1} / ${artworks.length}`;thumbnails.querySelectorAll('button').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===current)));}
artworks.forEach((art,i)=>{const button=document.createElement('button');button.className='thumbnail';button.type='button';button.setAttribute('aria-label',`Show ${art.title}`);button.setAttribute('aria-pressed',String(i===0));const image=document.createElement('img');image.src=art.src;image.alt='';image.loading='lazy';button.append(image);button.addEventListener('click',()=>showArtwork(i));thumbnails.append(button);});
document.querySelector('.previous').addEventListener('click',()=>showArtwork(current-1));
document.querySelector('.next').addEventListener('click',()=>showArtwork(current+1));
const carousel=document.querySelector('.carousel');
carousel.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();showArtwork(current-1);}if(event.key==='ArrowRight'){event.preventDefault();showArtwork(current+1);}});
let startX=null;
carousel.addEventListener('touchstart',event=>{startX=event.changedTouches[0].clientX;},{passive:true});
carousel.addEventListener('touchend',event=>{if(startX===null)return;const delta=event.changedTouches[0].clientX-startX;if(Math.abs(delta)>45)showArtwork(current+(delta<0?1:-1));startX=null;},{passive:true});
const positions=[[125,10],[285,20],[160,130],[260,205],[105,315],[290,345],[210,425]];
positions.forEach(([x,y],i)=>{const file=document.createElement('div');file.className='photo-file';file.style.left=`${x/430*100}%`;file.style.top=`${y}px`;const image=document.createElement('img');image.src=`images/art-${String(i+1).padStart(2,'0')}.svg`;image.alt=`Personal photo ${i+1} placeholder`;image.loading='lazy';const label=document.createElement('span');label.textContent=i===5?'San Diego.jpg':i===3?'me.jpg':'Culture.jpg';file.append(image,label);document.getElementById('desktop-photos').append(file);});
