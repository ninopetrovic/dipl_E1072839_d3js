import { Component, ViewEncapsulation, OnInit } from '@angular/core';

import * as d3 from 'd3';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Axis from 'd3-axis';
import * as d3Zoom from 'd3-zoom';
import * as d3Brush from 'd3-brush';
import * as d3Array from 'd3-array';
import * as d3TimeFormat from 'd3-time-format';

declare const $: any;
declare const ej: any;

@Component({
    selector: 'app-eurovoc-test',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './eurovoc_test_01.component.html',
    styleUrls: []
})
export class EurovocTestComponent implements OnInit {

    data: any;
    chart: any;
    width: any;
    radius: number;
    color: any;
    arc: any;
    format: any;

    constructor() {}

    public ngOnInit(): void {
        $.getJSON('https://raw.githubusercontent.com/d3/d3-hierarchy/v1.1.8/test/data/flare.json', (res) => {
            console.log(res);
            this.data = res;
        }).done(() => {
            console.log('data', this.data);
            this.initChartWhenDataBound();
            console.log(this);
        });
    }

    public initChartWhenDataBound() {
        this.width = 932;
        this.radius = this.width / 6;
        this.color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, this.data.children.length + 1));
        this.format = d3.format(',d');
        this.arc = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
            .padRadius(this.radius * 1.5)
            .innerRadius(d => d.y0 * this.radius)
            .outerRadius(d => Math.max(d.y0 * this.radius, d.y1 * this.radius - 1));
        this.getChart();
        d3.select('#testChartNino');
    }

    public getChart() {
        const root = this.partition(this.data);

        root.each(d => d.current = d);

        const svg = d3.select('#testChartNino')
            .attr('viewBox', [0, 0, this.width, this.width])
            .style('font', '10px sans-serif');

        const g = svg.append('g')
            .attr('transform', `translate(${this.width / 2},${this.width / 2})`);

        console.log('root', root.children);
        const arc = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
            .padRadius(this.radius * 1.5)
            .innerRadius(d => d.y0 * this.radius)
            .outerRadius(d => Math.max(d.y0 * this.radius, d.y1 * this.radius - 1));
        const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, this.data.children.length + 1));
        const format = d3.format(',d');
        // return;

        const path = g.append('g')
            .selectAll('path')
            .data(root.descendants().slice(1))
            .enter().append('path')
            .attr('fill', d => {
                while (d.depth > 1) {
                    d = d.parent;
                    return color(d.data.name);
                }
            })
            .attr('fill-opacity', d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
            .attr('d', d => arc(d.current));

        path.filter(d => d.children)
            .style('cursor', 'pointer')
            .on('click', clicked);

        path.append('title')
            .text(d => `${d.ancestors().map(d => d.data.name).reverse().join('/')}\n${format(d.value)}`);

        const label = g.append('g')
            .attr('pointer-events', 'none')
            .attr('text-anchor', 'middle')
            .style('user-select', 'none')
            .selectAll('text')
            .data(root.descendants().slice(1))
            .enter().append('text')
            .attr('dy', '0.35em')
            .attr('fill-opacity', d => +labelVisible(d.current))
            .attr('transform', d => labelTransform(d.current))
            .text(d => d.data.name);

        const parent = g.append('circle')
            .datum(root)
            .attr('r', this.radius)
            .attr('fill', 'none')
            .attr('pointer-events', 'all')
            .on('click', clicked);

        function clicked(p) {
            parent.datum(p.parent || root);

            root.each(d => d.target = {
                x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                y0: Math.max(0, d.y0 - p.depth),
                y1: Math.max(0, d.y1 - p.depth)
            });

            const t = g.transition().duration(750);

            // Transition the data on all arcs, even the ones that aren’t visible,
            // so that if this transition is interrupted, entering arcs will start
            // the next transition from the desired position.
            path.transition(t)
                .tween('data', d => {
                    const i = d3.interpolate(d.current, d.target);
                    return (t) => { d.current = i(t); };
                })
                .filter(function(d) {
                    return +this.getAttribute('fill-opacity') || arcVisible(d.target);
                })
                .attr('fill-opacity', d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
                .attrTween('d', d => () => arc(d.current));

            label.filter(function(d) {
                return +this.getAttribute('fill-opacity') || labelVisible(d.target);
            }).transition(t)
                .attr('fill-opacity', d => +labelVisible(d.target))
                .attrTween('transform', d => () => labelTransform(d.current));
        }

        function arcVisible(d) {
            return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
            // return true;
        }

        function labelVisible(d) {
            return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
            // return true;
        }

        function labelTransform(d) {
            const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
            const y = (d.y0 + d.y1) / 2 * 155.33333333333334; // this.radius
            return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
        }

        this.chart = svg.node();
        return svg.node();
    }

    public partition(data) {
        const root = d3.hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);
        return d3.partition()
            .size([2 * Math.PI, root.height + 1])
            (root);
    }
}
