import { Component, ChangeDetectionStrategy, inject, computed, signal, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { EmployeeService } from '../services/employee.service';
import { UserService } from '../services/user.service';

declare var d3: any;

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="space-y-6">
      <!-- Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div class="p-5 rounded-2xl shadow-lg bg-white/50 backdrop-blur-lg border border-white/20 text-slate-800 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
          <div class="flex items-start justify-between">
            <div class="p-3 bg-blue-100 rounded-xl text-blue-600"><svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg></div>
            <div class="text-right">
              <p class="font-bold text-lg">Employees</p>
              <p class="text-sm text-slate-500">Total Count</p>
            </div>
          </div>
          <p class="text-4xl font-bold mt-4 text-right">{{ employeeCount() }}</p>
        </div>
        <div class="p-5 rounded-2xl shadow-lg bg-white/50 backdrop-blur-lg border border-white/20 text-slate-800 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
           <div class="flex items-start justify-between">
            <div class="p-3 bg-emerald-100 rounded-xl text-emerald-600"><svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg></div>
            <div class="text-right">
              <p class="font-bold text-lg">Departments</p>
              <p class="text-sm text-slate-500">Total Count</p>
            </div>
          </div>
          <p class="text-4xl font-bold mt-4 text-right">{{ departmentCount() }}</p>
        </div>
        <div class="p-5 rounded-2xl shadow-lg bg-white/50 backdrop-blur-lg border border-white/20 text-slate-800 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
           <div class="flex items-start justify-between">
            <div class="p-3 bg-amber-100 rounded-xl text-amber-600"><svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg></div>
            <div class="text-right">
              <p class="font-bold text-lg">Assessments</p>
              <p class="text-sm text-slate-500">Total Count</p>
            </div>
          </div>
          <p class="text-4xl font-bold mt-4 text-right">{{ assessmentCount() }}</p>
        </div>
        <div class="p-5 rounded-2xl shadow-lg bg-white/50 backdrop-blur-lg border border-white/20 text-slate-800 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
           <div class="flex items-start justify-between">
            <div class="p-3 bg-rose-100 rounded-xl text-rose-600"><svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>
            <div class="text-right">
              <p class="font-bold text-lg">Users</p>
              <p class="text-sm text-slate-500">Total Count</p>
            </div>
          </div>
          <p class="text-4xl font-bold mt-4 text-right">{{ userCount() }}</p>
        </div>
        <div class="p-5 rounded-2xl shadow-lg bg-white/50 backdrop-blur-lg border border-white/20 text-slate-800 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
           <div class="flex items-start justify-between">
            <div class="p-3 bg-violet-100 rounded-xl text-violet-600"><svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>
            <div class="text-right">
              <p class="font-bold text-lg">Periods</p>
              <p class="text-sm text-slate-500">Total Count</p>
            </div>
          </div>
          <p class="text-4xl font-bold mt-4 text-right">{{ periodCount() }}</p>
        </div>
      </div>

      <!-- Main Chart Grid -->
      <div class="space-y-6">
        <!-- First row: Line Chart and Events -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- P&L Values Card -->
            <div class="lg:col-span-2 bg-white/50 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                <div class="flex justify-between items-center mb-4">
                  <h3 class="text-lg font-bold text-slate-800">P&L Values</h3>
                   <div class="flex items-center gap-1 text-slate-500">
                      <button class="p-1.5 hover:bg-slate-200/50 rounded-md"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path></svg></button>
                      <button class="p-1.5 hover:bg-slate-200/50 rounded-md"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg></button>
                      <button class="p-1.5 hover:bg-slate-200/50 rounded-md"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg></button>
                      <button class="p-1.5 hover:bg-slate-200/50 rounded-md"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path></svg></button>
                      <button class="p-1.5 hover:bg-slate-200/50 rounded-md"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg></button>
                      <button class="p-1.5 hover:bg-slate-200/50 rounded-md"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg></button>
                  </div>
                </div>
                <div #lineChartContainer></div>
            </div>

            <!-- Upcoming Events Card -->
            <div class="lg:col-span-1 bg-white/50 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6 flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <h3 class="text-lg font-bold text-slate-800 mb-4 flex-shrink-0">Upcoming Events</h3>
              <div class="space-y-4 overflow-y-auto">
                <div class="p-3 bg-white/40 rounded-lg border border-white/20">
                  <p class="font-semibold text-slate-700">Annual Company Dinner</p>
                  <p class="text-xs text-slate-500 mt-1">Hyatt Regency, 7:00 PM - Dec 25, 2025</p>
                </div>
                 <div class="p-3 bg-white/40 rounded-lg border border-white/20">
                  <p class="font-semibold text-slate-700">New Year Holiday</p>
                  <p class="text-xs text-slate-500 mt-1">Office Closed - Jan 01, 2026</p>
                </div>
                 <div class="p-3 bg-white/40 rounded-lg border border-white/20">
                  <p class="font-semibold text-slate-700">Q1 Planning Meeting</p>
                  <p class="text-xs text-slate-500 mt-1">Board Room, 10:00 AM - Jan 15, 2026</p>
                </div>
              </div>
            </div>
        </div>

        <!-- Second row: Bar Charts -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div class="bg-white/50 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <h3 class="text-lg font-bold text-slate-800 mb-4">December 2025 - Financial Summary</h3>
              <div #barChartSummaryContainer></div>
            </div>
            <div class="bg-white/50 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <h3 class="text-lg font-bold text-slate-800 mb-4">Financial Overview - Last 6 Months</h3>
              <div #barChartOverviewContainer></div>
            </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CurrencyPipe]
})
export class DashboardComponent implements AfterViewInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly userService = inject(UserService);
  
  @ViewChild('lineChartContainer') lineChartContainer!: ElementRef;
  @ViewChild('barChartSummaryContainer') barChartSummaryContainer!: ElementRef;
  @ViewChild('barChartOverviewContainer') barChartOverviewContainer!: ElementRef;

  employeeCount = computed(() => this.employeeService.employees().length);
  userCount = computed(() => this.userService.users().length);
  departmentCount = signal(8);
  assessmentCount = signal(87);
  periodCount = signal(5);

  ngAfterViewInit() {
    this.createLineChart();
    this.createBarChartSummary();
    this.createBarChartOverview();
  }

  private createLineChart() {
    const data = [
      { month: 'Jun-2025', Overall: -0.5, ENG: -1, SIM: -2, SUS: -4.5, ACC: -2, LAS: 1, 'O&G': -7 },
      { month: 'Jul-2025', Overall: -2.0, ENG: -0.5, SIM: -4, SUS: -6.0, ACC: -4, LAS: 0, 'O&G': -12 },
      { month: 'Aug-2025', Overall: -4.0, ENG: -0.8, SIM: -5, SUS: -7.0, ACC: -5, LAS: -1, 'O&G': -20.5 },
    ];

    const keys = ['Overall', 'ENG', 'SIM', 'SUS', 'ACC', 'LAS', 'O&G'];
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9', '#14b8a6'];
    
    const container = this.lineChartContainer.nativeElement;
    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    d3.select(container).select('svg').remove();

    const svg = d3.select(container)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("display", "block")
      .style("max-width", "100%")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
      
    const x = d3.scalePoint()
      .domain(data.map(d => d.month))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([-24, 2])
      .range([height, 0]);

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(0).tickPadding(15))
      .select(".domain").remove()
      .selectAll("text").style("fill", "#9ca3af").style("font-size", "12px");

    svg.append("g")
      .call(d3.axisLeft(y).ticks(6).tickSize(0).tickPadding(10))
      .select(".domain").remove()
      .selectAll("text").style("fill", "#9ca3af").style("font-size", "12px");

    const colorScale = d3.scaleOrdinal().domain(keys).range(colors);

    keys.forEach(key => {
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", colorScale(key))
            .attr("stroke-width", 2.5)
            .attr("d", d3.line()
                .x(d => x(d.month))
                .y(d => y(d[key]))
            );
    });

    const legend = d3.select(container).append('div').attr('class', 'flex justify-center items-center flex-wrap gap-x-4 gap-y-2 mt-4');
    keys.forEach((key, i) => {
        const legendItem = legend.append('div').attr('class', 'flex items-center gap-2');
        legendItem.append('div').attr('class', 'w-3 h-3 rounded-full').style('background-color', colors[i]);
        legendItem.append('span').attr('class', 'text-xs font-medium text-slate-600').text(key);
    });
  }

  private createBarChartSummary() {
    const data = [
        { name: 'Expenses', value: 20000 },
        { name: 'PO Value', value: 1062150 },
        { name: 'Invoice', value: 380000 },
        { name: 'Collection', value: 100000 },
    ];
    const keys = ['Expenses', 'PO Value', 'Invoice', 'Collection'];
    const colors = [
        { id: 'Expenses', start: '#c4b5fd', end: '#a78bfa' },
        { id: 'POValue', start: '#f9a8d4', end: '#f472b6' },
        { id: 'Invoice', start: '#fcd34d', end: '#fbbf24' },
        { id: 'Collection', start: '#6ee7b7', end: '#34d399' }
    ];
    const colorMap = new Map(colors.map(c => [c.id, `url(#summary-grad-${c.id})`]));

    const container = this.barChartSummaryContainer.nativeElement;
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    d3.select(container).select('svg').remove();
    d3.select('body').selectAll('.d3-tooltip').remove();
    d3.select(container).select('.legend').remove();

    const svg = d3.select(container).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("display", "block")
        .style("max-width", "100%")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const defs = svg.append("defs");
    colors.forEach(color => {
      const gradient = defs.append("linearGradient")
        .attr("id", `summary-grad-${color.id}`)
        .attr("x1", "0%")
        .attr("x2", "0%")
        .attr("y1", "0%")
        .attr("y2", "100%");
      gradient.append("stop").attr("offset", "0%").attr("stop-color", color.start).attr("stop-opacity", 0.8);
      gradient.append("stop").attr("offset", "100%").attr("stop-color", color.end).attr("stop-opacity", 1);
    });
        
    const x = d3.scaleBand().range([0, width]).domain(data.map(d => d.name)).padding(0.6);
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickSize(0).tickPadding(10))
        .select('.domain').remove()
        .selectAll("text").style("fill", "#9ca3af").style("font-size", "12px");

    const y = d3.scaleLinear().domain([0, 1200000]).range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y).ticks(7).tickFormat(d => `${d/1000}K`).tickSize(0).tickPadding(10))
        .select(".domain").remove()
        .selectAll("text").style("fill", "#9ca3af").style("font-size", "12px");

    const tooltip = d3.select('body')
        .append("div")
        .attr("class", "d3-tooltip absolute p-2 text-xs bg-slate-900/70 backdrop-blur-sm text-white rounded-md shadow-lg pointer-events-none")
        .style("opacity", 0);

    svg.selectAll("mybar")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => x(d.name))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", d => colorMap.get(d.name.replace(' ', '')))
        .on("mouseover", (event, d) => {
            tooltip.style("opacity", 1);
        })
        .on("mousemove", (event, d) => {
            const color = colors.find(c => c.id === d.name.replace(' ', ''))?.end || '#000';
            tooltip
                .html(`
                  <div class="font-bold text-center mb-1">${d.name}</div>
                  <div class="flex items-center">
                    <span class="w-3 h-3 rounded-full mr-2" style="background-color: ${color}"></span>
                    <span>SAR ${d3.format(",.0f")(d.value)}</span>
                  </div>
                `)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
        });

    const legend = d3.select(this.barChartSummaryContainer.nativeElement).append('div').attr('class', 'legend flex justify-center items-center flex-wrap gap-x-4 gap-y-1 mt-2');
    keys.forEach((key, i) => {
      const legendItem = legend.append('div').attr('class', 'flex items-center gap-2');
      legendItem.append('div').attr('class', 'w-3 h-3 rounded-full').style('background-color', colors[i].end);
      legendItem.append('span').attr('class', 'text-xs font-medium text-slate-600').text(key);
    });
  }

  private createBarChartOverview() {
    const data = [
        { month: 'Mar', Expenses: 800000, 'PO Value': 400000, Invoice: 1200000, Collection: 200000 },
        { month: 'Apr', Expenses: 1200000, 'PO Value': 700000, Invoice: 1300000, Collection: 300000 },
        { month: 'May', Expenses: 1100000, 'PO Value': 600000, Invoice: 900000, Collection: 800000 },
        { month: 'Jun', Expenses: 2100000, 'PO Value': 500000, Invoice: 500000, Collection: 2200000 },
        { month: 'Jul', Expenses: 2700000, 'PO Value': 700000, Invoice: 2200000, Collection: 1400000 },
        { month: 'Aug', Expenses: 2100000, 'PO Value': 1100000, Invoice: 200000, Collection: 2800000 },
    ];
    const keys = ['Expenses', 'PO Value', 'Invoice', 'Collection'];
    const colors = [
        { id: 'Expenses', start: '#a5b4fc', end: '#818cf8', solid: '#a78bfa' },
        { id: 'POValue', start: '#fbcfe8', end: '#f9a8d4', solid: '#f472b6' },
        { id: 'Invoice', start: '#fde68a', end: '#fcd34d', solid: '#fbbf24' },
        { id: 'Collection', start: '#99f6e4', end: '#5eead4', solid: '#34d399' }
    ];
    const colorMap = new Map(colors.map(c => [c.id, `url(#overview-grad-${c.id})`]));
    
    const container = this.barChartOverviewContainer.nativeElement;
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    d3.select(container).select('svg').remove();
    d3.select(container).select('.legend').remove();

    const svg = d3.select(container).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("display", "block")
        .style("max-width", "100%")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
        
    const defs = svg.append("defs");
    colors.forEach(color => {
        const gradient = defs.append("linearGradient")
            .attr("id", `overview-grad-${color.id}`)
            .attr("x1", "0%").attr("x2", "0%").attr("y1", "0%").attr("y2", "100%");
        gradient.append("stop").attr("offset", "0%").attr("stop-color", color.start).attr("stop-opacity", 0.7);
        gradient.append("stop").attr("offset", "100%").attr("stop-color", color.end).attr("stop-opacity", 1);
    });

    const x0 = d3.scaleBand().domain(data.map(d => d.month)).rangeRound([0, width]).paddingInner(0.2);
    const x1 = d3.scaleBand().domain(keys).rangeRound([0, x0.bandwidth()]).padding(0.1);
    const y = d3.scaleLinear().domain([0, 3000000]).range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0).tickSize(0).tickPadding(10))
        .select('.domain').remove()
        .selectAll("text").style("fill", "#9ca3af").style("font-size", "12px");
    
    svg.append("g")
        .call(d3.axisLeft(y).ticks(7).tickFormat(d => `${d/1000}K`).tickSize(0).tickPadding(10))
        .select(".domain").remove()
        .selectAll("text").style("fill", "#9ca3af").style("font-size", "12px");

    svg.append("g")
      .selectAll("g")
      .data(data)
      .join("g")
        .attr("transform", d => `translate(${x0(d.month)},0)`)
      .selectAll("rect")
      .data(d => keys.map(key => ({key: key, value: d[key]})))
      .join("rect")
        .attr("x", d => x1(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", d => colorMap.get(d.key.replace(' ', '')));

    const legend = d3.select(this.barChartOverviewContainer.nativeElement).append('div').attr('class', 'legend flex justify-center items-center flex-wrap gap-x-4 gap-y-1 mt-2');
    colors.forEach((color, i) => {
      const legendItem = legend.append('div').attr('class', 'flex items-center gap-2');
      legendItem.append('div').attr('class', 'w-3 h-3 rounded-full').style('background-color', color.solid);
      legendItem.append('span').attr('class', 'text-xs font-medium text-slate-600').text(keys[i]);
    });
  }
}