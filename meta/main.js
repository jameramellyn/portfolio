import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import scrollama from "https://cdn.jsdelivr.net/npm/scrollama@3.2.0/+esm";

console.log("main.js loaded");

async function loadData() {
  const data = await d3.csv("./loc.csv", (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + "T00:00" + row.timezone),
    datetime: new Date(row.datetime),
  }));
  console.log("data loaded:", data);
  return data;
}

function processCommits(data) {
  return d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: "https://github.com/vis-society/lab-7/commit/" + commit,
        author, date, time, timezone, datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };
      Object.defineProperty(ret, "lines", {
        value: lines,
        configurable: false,
        writable: false,
        enumerable: false,
      });
      return ret;
    })
    .sort((a, b) => a.datetime - b.datetime);
}

function renderCommitInfo(data, commits) {
  const stats = d3.select("#stats");
  stats.html("");
  const dl = stats.append("dl").attr("class", "stats");

  dl.append("dt").html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append("dd").text(data.length);
  dl.append("dt").text("Total commits");
  dl.append("dd").text(commits.length);

  const numFiles = d3.group(data, (d) => d.file).size;
  dl.append("dt").text("Number of files");
  dl.append("dd").text(numFiles);

  const maxDepth = d3.max(data, (d) => d.depth);
  dl.append("dt").text("Maximum depth");
  dl.append("dd").text(maxDepth);

  const avgLineLength = d3.mean(data, (d) => d.length);
  dl.append("dt").text("Average line length");
  dl.append("dd").text(avgLineLength.toFixed(2));
}

function renderTooltipContent(commit) {
  const link = document.getElementById("commit-link");
  const date = document.getElementById("commit-date");
  const time = document.getElementById("commit-time");
  const author = document.getElementById("commit-author");
  const lines = document.getElementById("commit-lines");
  if (!commit) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime.toLocaleString("en", { dateStyle: "full" });
  time.textContent = commit.datetime.toLocaleString("en", { timeStyle: "short" });
  author.textContent = commit.author;
  lines.textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
  document.getElementById("commit-tooltip").hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById("commit-tooltip");
  tooltip.style.left = `${event.clientX + 12}px`;
  tooltip.style.top = `${event.clientY + 12}px`;
}

let xScale, yScale;
let commits = [];
let filteredCommits = [];

function renderScatterPlot(data, commitsToRender) {
  const width = 1000;
  const height = 600;
  const margin = { top: 10, right: 10, bottom: 30, left: 20 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  d3.select("#chart").html("");

  const svg = d3.select("#chart").append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("overflow", "visible");

  xScale = d3.scaleTime()
    .domain(d3.extent(commitsToRender, (d) => d.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();

  yScale = d3.scaleLinear()
    .domain([0, 24])
    .range([usableArea.bottom, usableArea.top]);

  const gridlines = svg.append("g")
    .attr("class", "gridlines")
    .attr("transform", `translate(${usableArea.left}, 0)`);
  gridlines.call(d3.axisLeft(yScale).tickFormat("").tickSize(-usableArea.width));

  svg.append("g").attr("class", "x-axis")
    .attr("transform", `translate(0, ${usableArea.bottom})`)
    .call(d3.axisBottom(xScale));

  svg.append("g").attr("class", "y-axis")
    .attr("transform", `translate(${usableArea.left}, 0)`)
    .call(d3.axisLeft(yScale).tickFormat((d) => String(d % 24).padStart(2, "0") + ":00"));

  svg.append("g").attr("class", "dots");

  svg.call(
    d3.brush()
      .extent([[usableArea.left, usableArea.top], [usableArea.right, usableArea.bottom]])
      .on("start brush end", brushed)
  );

  // Raise dots AND overlay so dots are clickable above brush
  svg.selectAll(".dots, .overlay ~ *").raise();
  svg.select(".dots").raise();

  updateScatterPlot(data, commitsToRender);
}

function updateScatterPlot(data, commitsToRender) {
  filteredCommits = commitsToRender;

  const svg = d3.select("#chart").select("svg");
  xScale.domain(d3.extent(commitsToRender, (d) => d.datetime)).nice();

  const [minLines, maxLines] = d3.extent(commitsToRender, (d) => d.totalLines);
  const rScale = d3.scaleSqrt()
    .domain([minLines || 0, maxLines || 1])
    .range([2, 30]);

  svg.select("g.x-axis").call(d3.axisBottom(xScale));

  const colorScale = d3.scaleLinear()
    .domain([0, 6, 12, 18, 24])
    .range(["#1e3a8a", "#60a5fa", "#f59e0b", "#fb923c", "#1e3a8a"]);

  const sortedCommits = d3.sort(commitsToRender, (d) => -d.totalLines);

  svg.select("g.dots")
    .selectAll("circle")
    .data(sortedCommits, (d) => d.id)
    .join("circle")
    .attr("cx", (d) => xScale(d.datetime))
    .attr("cy", (d) => yScale(d.hourFrac))
    .attr("r", (d) => rScale(d.totalLines))
    .attr("fill", (d) => colorScale(d.hourFrac))
    .style("fill-opacity", 0.7)
    .on("mouseenter", (event, commit) => {
      d3.select(event.currentTarget).style("fill-opacity", 1);
      renderTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on("mousemove", updateTooltipPosition)
    .on("mouseleave", (event) => {
      d3.select(event.currentTarget).style("fill-opacity", 0.7);
      updateTooltipVisibility(false);
    });
}

function isCommitSelected(selection, commit) {
  if (!selection) return false;
  const [[x0, y0], [x1, y1]] = selection;
  const x = xScale(commit.datetime);
  const y = yScale(commit.hourFrac);
  return x >= x0 && x <= x1 && y >= y0 && y <= y1;
}

function renderSelectionCount(selection) {
  const selectedCommits = selection
    ? filteredCommits.filter((d) => isCommitSelected(selection, d))
    : [];
  document.querySelector("#selection-count").textContent =
    `${selectedCommits.length || "No"} commits selected`;
  return selectedCommits;
}

function renderLanguageBreakdown(selection) {
  const selectedCommits = selection
    ? filteredCommits.filter((d) => isCommitSelected(selection, d))
    : [];
  const container = document.getElementById("language-breakdown");
  if (selectedCommits.length === 0) { container.innerHTML = ""; return; }

  const lines = selectedCommits.flatMap((d) => d.lines);
  const breakdown = d3.rollup(lines, (v) => v.length, (d) => d.type);
  container.innerHTML = "";
  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format(".1~%")(proportion);
    container.innerHTML += `<dt>${language}</dt><dd>${count} lines (${formatted})</dd>`;
  }
}

function brushed(event) {
  const selection = event.selection;
  d3.selectAll("circle").classed("selected", (d) => isCommitSelected(selection, d));
  renderSelectionCount(selection);
  renderLanguageBreakdown(selection);
}

function setupTimeSlider() {
  const slider = document.getElementById("commit-progress");
  const timeDisplay = document.getElementById("commit-progress-time");

  const timeScale = d3.scaleTime()
    .domain([d3.min(commits, (d) => d.datetime), d3.max(commits, (d) => d.datetime)])
    .range([0, 100]);

  function onTimeSliderChange() {
    const commitMaxTime = timeScale.invert(Number(slider.value));
    timeDisplay.textContent = commitMaxTime.toLocaleString("en", {
      dateStyle: "long",
      timeStyle: "short",
    });
    filteredCommits = commits.filter((d) => d.datetime <= commitMaxTime);
    updateScatterPlot(data, filteredCommits);
    renderCommitInfo(filteredCommits.flatMap((d) => d.lines), filteredCommits);
  }

  slider.addEventListener("input", onTimeSliderChange);
  onTimeSliderChange();
}

function setupScrollytelling() {
  d3.select("#scatter-story")
    .selectAll(".step")
    .data(commits)
    .join("div")
    .attr("class", "step")
    .html((d, i) => `
      On ${d.datetime.toLocaleString("en", { dateStyle: "full", timeStyle: "short" })},
      I made <a href="${d.url}" target="_blank">${
        i > 0 ? "another glorious commit" : "my first commit, and it was glorious"
      }</a>.
      I edited ${d.totalLines} lines across ${
        d3.rollups(d.lines, (D) => D.length, (d) => d.file).length
      } files.
      Then I looked over all I had made, and I saw that it was very good.
    `);

  function onStepEnter(response) {
    const commitMaxTime = response.element.__data__.datetime;
    filteredCommits = commits.filter((d) => d.datetime <= commitMaxTime);
    updateScatterPlot(data, filteredCommits);
    renderCommitInfo(filteredCommits.flatMap((d) => d.lines), filteredCommits);
  }

  const scroller = scrollama();
  scroller
    .setup({ container: "#scrolly-1", step: "#scrolly-1 .step" })
    .onStepEnter(onStepEnter);
}

let data = await loadData();
commits = processCommits(data);
filteredCommits = commits;

renderCommitInfo(data, commits);
renderScatterPlot(data, commits);
setupTimeSlider();
setupScrollytelling();