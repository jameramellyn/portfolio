import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

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
        author,
        date,
        time,
        timezone,
        datetime,
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
    });
}

function renderCommitInfo(data, commits) {
  console.log("rendering stats");

  const stats = d3.select("#stats");
  console.log("stats element:", stats.node());

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
  
    if (!commit || Object.keys(commit).length === 0) return;
  
    link.href = commit.url;
    link.textContent = commit.id;
  
    date.textContent = commit.datetime?.toLocaleString("en", {
      dateStyle: "full",
    });
  
    time.textContent = commit.datetime?.toLocaleString("en", {
      timeStyle: "short",
    });
  
    author.textContent = commit.author;
    lines.textContent = commit.totalLines;
  }
  
  function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById("commit-tooltip");
    tooltip.hidden = !isVisible;
  }
  
  function updateTooltipPosition(event) {
    const tooltip = document.getElementById("commit-tooltip");
    tooltip.style.left = `${event.clientX + 12}px`;
    tooltip.style.top = `${event.clientY + 12}px`;
  }

function renderScatterPlot(data, commits) {
    const width = 1000;
    const height = 600;

    const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

    const xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width])
    .nice();

    const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

    const dots = svg.append('g').attr('class', 'dots');

    const margin = { top: 10, right: 10, bottom: 30, left: 20 };

    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
      };
      
      // Update scales with new ranges
      xScale.range([usableArea.left, usableArea.right]);
      yScale.range([usableArea.bottom, usableArea.top]);
      
      const gridlines = svg
        .append('g')
        .attr('class', 'gridlines')
        .attr('transform', `translate(${usableArea.left}, 0)`);

        // Create gridlines as an axis with no labels and full-width ticks
        gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

      // Create the axes
      const xAxis = d3.axisBottom(xScale);
      const yAxis = d3
        .axisLeft(yScale)
        .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

      // Add X axis
      svg
        .append('g')
        .attr('transform', `translate(0, ${usableArea.bottom})`)
        .call(xAxis);
    
      // Add Y axis
      svg
        .append('g')
        .attr('transform', `translate(${usableArea.left}, 0)`)
        .call(yAxis);

      const colorScale = d3.scaleLinear()
        .domain([0, 6, 12, 18, 24])
        .range([
          '#1e3a8a',
          '#60a5fa',
          '#f59e0b',
          '#fb923c',
          '#1e3a8a'
        ]);
      
        dots
        .selectAll("circle")
        .data(commits)
        .join("circle")
        .attr("cx", (d) => xScale(d.datetime))
        .attr("cy", (d) => yScale(d.hourFrac))
        .attr("r", 5)
        .attr("fill", (d) => colorScale(d.hourFrac))
        .on("mouseover", (event, commit) => {
            renderTooltipContent(commit);
            updateTooltipVisibility(true);
            updateTooltipPosition(event);
        })
        .on("mousemove", (event) => {
            updateTooltipPosition(event);
        })
        .on("mouseout", () => {
            updateTooltipVisibility(false);
        });

  }

  

let data = await loadData();
let commits = processCommits(data);

console.log("commits:", commits);

renderCommitInfo(data, commits);
renderScatterPlot(data, commits);


