import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects-grid');
const searchInput = document.querySelector('.searchBar');

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let colors = d3.scaleOrdinal(d3.schemeTableau10);
let selectedIndex = -1;
let currentQuery = '';

function filterProjects() {
  let filteredProjects = projects;

  if (currentQuery) {
    filteredProjects = filteredProjects.filter((project) => {
      let values = Object.values(project).join('\n').toLowerCase();
      return values.includes(currentQuery.toLowerCase());
    });
  }

  if (selectedIndex !== -1) {
    let selectedYear = d3.rollups(
      filteredProjects,
      (v) => v.length,
      (d) => d.year,
    )[selectedIndex]?.[0];

    filteredProjects = filteredProjects.filter(
      (project) => project.year === selectedYear,
    );
  }

  return filteredProjects;
}

function renderPieChart(projectsGiven) {
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );

  let newData = newRolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(newData);
  let newArcs = newArcData.map((d) => arcGenerator(d));

  let svg = d3.select('#projects-pie-plot');
  let legend = d3.select('.legend');

  svg.selectAll('path').remove();
  legend.selectAll('li').remove();

  newArcs.forEach((arc, idx) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('style', `--color:${colors(idx)}`)
      .attr('fill', 'var(--color)')
      .attr('class', idx === selectedIndex ? 'selected' : '')
      .on('click', () => {
        selectedIndex = selectedIndex === idx ? -1 : idx;
        updatePage();
      });
  });

  newData.forEach((d, idx) => {
    legend
      .append('li')
      .attr('class', idx === selectedIndex ? 'legend-item selected' : 'legend-item')
      .attr('style', `--color:${colors(idx)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

function updatePage() {
  let searchedProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(currentQuery.toLowerCase());
  });

  let rolledData = d3.rollups(
    searchedProjects,
    (v) => v.length,
    (d) => d.year,
  );

  let selectedYear = selectedIndex === -1 ? null : rolledData[selectedIndex]?.[0];

  let filteredProjects =
    selectedIndex === -1
      ? searchedProjects
      : searchedProjects.filter((project) => project.year === selectedYear);

  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(searchedProjects);
}

searchInput.addEventListener('input', (event) => {
  currentQuery = event.target.value;
  selectedIndex = -1;
  updatePage();
});

updatePage();