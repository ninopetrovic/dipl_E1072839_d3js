import { Component, ViewEncapsulation, OnInit } from '@angular/core';

import * as d3 from 'd3';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';

import { STOCKS } from '../shared';
declare const $: any;
declare const ej: any;
@Component({
    selector: 'app-line-chart',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './line-chart.component.html',
    styleUrls: ['./line-chart.component.css']
})
export class LineChartComponent implements OnInit {

    title = 'Line Chart';

    private margin = {top: 20, right: 20, bottom: 30, left: 50};
    private width: number;
    private height: number;
    private x: any;
    private y: any;
    private svg: any;
    private line: d3Shape.Line<[number, number]>;
    data = [];

    constructor() {
        this.width = 900 - this.margin.left - this.margin.right;
        this.height = 500 - this.margin.top - this.margin.bottom;
    }

    ngOnInit() {
        // Original demo from Mike Bostock: https://bl.ocks.org/mbostock/ad70335eeef6d167bc36fd3c04378048

        const margin = {top: 40, bottom: 10, left: 20, right: 20};
        const width = 800 - margin.left - margin.right;
        const height = 600 - margin.top - margin.bottom;

        // this.initSvg();
        // this.initAxis();
        // this.drawAxis();
        // this.drawLine();

// Creates sources <svg> element and inner g (for margins)
        const svg = d3.select('#povezanGraf').append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

/////////////////////////

        const simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id((d) => d.id))
            .force('charge', d3.forceManyBody())
            .force('center', d3.forceCenter(width / 2, height / 2));

        const color = d3.scaleOrdinal(d3.schemeCategory10);
            $.getJSON('https://rawgit.com/thinkh/d3tutorial/master/examples/miserables.json', (res) => {
                console.log(res);
                this.data = res;
            }).done((data) => {
            console.log(data);
            // Links data join
            const link = svg.selectAll('.link').data(data.links);
            const link_enter = link.enter().append('line')
                .attr('class', 'link');
            const link_update = link.merge(link_enter);

            link.exit().remove();


            // Nodes data join
            const node = svg.selectAll('.node').data(data.nodes);

            const node_enter = node.enter().append('circle')
                .attr('class', 'node')
                .attr('r', 10);
            node_enter.append('title').text((d) => d.id);

            const node_update = node.merge(node_enter);
            node_update.style('fill', (d) => color(d.group));

            node.exit().remove();

            simulation
                .nodes(data.nodes)
                .force('link').links(data.links);

            simulation.on('tick', (e) => {
                console.log(data.nodes[0]);
                link_update
                    .attr('x1', (d) => d.source.x * 1.5 - 200)
                    .attr('y1', (d) => d.source.y * 1.5 - 200)
                    .attr('x2', (d) => d.target.x * 1.5 - 200)
                    .attr('y2', (d) => d.target.y * 1.5 - 200);

                node_update
                    .attr('cx', (d) => d.x  * 1.5 - 200)
                    .attr('cy', (d) => d.y * 1.5 - 200);
            });
        });
    }

    private initSvg() {
        this.svg = d3.select('svg')
            .append('g')
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
    }

    private initAxis() {
        this.x = d3Scale.scaleTime().range([0, this.width]);
        this.y = d3Scale.scaleLinear().range([this.height, 0]);
        this.x.domain(d3Array.extent(STOCKS, (d) => d.date ));
        this.y.domain(d3Array.extent(STOCKS, (d) => d.value ));
    }

    private drawAxis() {

        this.svg.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', 'translate(0,' + this.height + ')')
            .call(d3Axis.axisBottom(this.x));

        this.svg.append('g')
            .attr('class', 'axis axis--y')
            .call(d3Axis.axisLeft(this.y))
            .append('text')
            .attr('class', 'axis-title')
            .attr('transform', 'rotate(-90)')
            .attr('y', 6)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text('Price ($)');
    }

    private drawLine() {
        console.log('drtaw line')
        this.line = d3Shape.line()
            .x( (d: any) => this.x(d.date) )
            .y( (d: any) => this.y(d.value) );

        this.svg.append('path')
            .datum(STOCKS)
            .attr('class', 'line')
            .attr('d', this.line);
    }
}
