import { Component, ViewEncapsulation, OnInit } from '@angular/core';

import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';

import { POPULATION } from '../shared';

@Component({
    selector: 'app-pie-chart',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './pie-chart.component.html',
    styleUrls: ['./pie-chart.component.css']
})
export class PieChartComponent implements OnInit {

    title = 'Pie Chart';

    private margin = {top: 0, right: 0, bottom: 0, left: 0};
    private width: number;
    private height: number;
    private radius: number;

    private arc: any;
    private labelArc: any;
    private pie: any;
    private color: any;
    private svg: any;

    constructor() {
        this.width = 960 - this.margin.left - this.margin.right;
        this.height = 500 - this.margin.top - this.margin.bottom;
        this.radius = Math.min(this.width, this.height) / 2;
    }

    ngOnInit() {
        this.initSvg();
        this.drawPie();
    }

    private initSvg() {
        d3.select('svg').style('background-color', '#AFAFAF');
        this.color = d3Scale.scaleOrdinal()
            .range(['#98abc5', '#8a89a6', '#7b6888', '#20e23f', '#a05d56', '#d0743c', '#ff8c00']);
        this.arc = d3Shape.arc()
            .outerRadius(this.radius - 10)
            .innerRadius(20);
        this.labelArc = d3Shape.arc()
            .outerRadius(this.radius - 40)
            .innerRadius(this.radius - 40);
        this.pie = d3Shape.pie()
            .sort(null)
            .value((d: any) => d.population);
        this.svg = d3.select('svg')
            .append('g')
            .attr('transform', 'translate(' + this.width / 2 + ',' + this.height / 2 + ')');
    }

    private drawPie() {
        let g = this.svg.selectAll('.arc')
            .data(this.pie(POPULATION))
            .enter()
            .append('g')
            .attr('class', 'arc');

        g.append('path')
            .attr('d', this.arc)
            .style('fill', (d: any) => this.color(d.data.age) );
        g.append('text')
            .attr('class', 'nd-label')
            .attr('transform', (d: any) => 'translate(' + this.labelArc.centroid(d) + ')')
            .attr('dy', '.35em')
            .text((d: any) => d.data.age + ' (' + d.data.population + ')');
    }

}
