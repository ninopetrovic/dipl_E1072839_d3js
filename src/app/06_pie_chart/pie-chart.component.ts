import {Component, ViewEncapsulation, OnInit, Input} from '@angular/core';
import * as d3 from 'd3';
import {text} from '@angular/core/src/render3/instructions';
import {TestService} from '../test/test.service';

declare var libraryVar: any;
declare const $: any;
declare const ej: any;

@Component({
    selector: 'app-pie-chart',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './pie-chart.component.html',
    styleUrls: ['./pie-chart.component.css']
})
export class PieChartComponent implements OnInit {
    @Input() data = [];
    @Input() uri = 'http://eurovoc.europa.eu/2720';

    drag;
    color;
    height = 600;
    width = 600;

    constructor(private testService: TestService) {
        this.color = (d) => {
            const scale = d3.scaleOrdinal(d3.schemeCategory10);
            return () => scale(d.group);
        };
        this.drag = (simulation) => {

            function dragstarted(d) {
                if (!d3.event.active) { simulation.alphaTarget(0.3).restart(); }
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(d) {
                d.fx = d3.event.x;
                d.fy = d3.event.y;
            }

            function dragended(d) {
                if (!d3.event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }

            return d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended);
        };
    }

    ngOnInit() {
        // $.getJSON('https://gist.githubusercontent.com/mbostock/4062045/raw/5916d145c8c048a6e3086915a6be464467391c62/miserables.json', (res) => {
        //     this.data = res;
        // }).done(() => {
        //     console.log('data', this.data);
        //     const node = this.getVisualization();
        //     console.log(node);
        //     document.getElementById('LinkedNodesSvg').appendChild(node);
        // });

        // MY DATA
        this.testService.getConceptVizualizationData(this.uri).subscribe((data) => {
            console.log(data);
            this.data = data;
            const node = this.getVisualization();
            console.log(node);
            document.getElementById('LinkedNodesSvg').appendChild(node);
        });
    }

    getVisualization() {
        const links = this.data['links'].map(d => Object.create(d));
        const nodes = this.data['nodes'].map(d => Object.create(d));

        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id))
            .force('charge', d3.forceManyBody())
            .force('center', d3.forceCenter(this.width / 2, this.height / 2));

        const svg = d3.create("svg")
            .attr("viewBox", [0, 0, this.width, this.height]);

        svg.call(d3.zoom().on('zoom', () => {
            const transform = d3.event.transform;
            d3.selectAll('.main-group')
                .attr('transform', transform);
        }));

        const link = svg.append("g")
            .attr('class', 'main-group')
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links).enter()
            .append("line")
            .attr("stroke-width", d => Math.sqrt(d.value))
            .attr('class', (d) => 'lineType' +  d.type );

        // const node = svg.append("g")
        //     .selectAll('g')
        //     .data(nodes)
        //     .enter()
        //     .append('g');
        //
        //
        // const circle = node.append('circle')
        //     .attr("stroke", "#fff")
        //     .attr("stroke-width", 1.5)
        //     .attr('class', (d) => 'nodeGroup' + d.group)
        //     .attr("r", (d) => this.getRandom(6))
        //     .attr("fill", (d) => this.getColor(d.group))
        //     // .call(this.drag(simulation));
        //     .attr('cx', (d) => d.x)
        //     .attr('cy', (d) => d.y);



        const node = svg.append("g")
            .attr('class', 'main-group')
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(nodes).enter()
            .append('g').attr('class', 'circleGroup')
            .append("circle")
            .attr('class', (d) => 'nodeGroup' + d.group)
            .attr("r", (d) => 7)
            .attr("fill", (d) => this.getColor(d.group))
            .call(this.drag(simulation));

        // console.log(d3.selectAll('.circleGroup'));
        const tekst = svg.append("g")
            .attr('class', 'main-group')
            .selectAll('text')
            .data(nodes)
            .enter()
            .append("text")
            .attr('class', 'textLabel')
            .text((d) => d.id);

        node.append("title")
            .text(d => d.id);

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            tekst
                .attr("x", d => d.x + 5)
                .attr("y", d => d.y - 5);
        });

        // invalidation.then(() => simulation.stop());

        return svg.node();
    }

    getColor(d) {
        const scale = d3.scaleOrdinal(d3.schemeCategory10);
        console.log(scale);
        return scale(d);
    }

    getRandom(max) {
        const rnd = Math.floor(Math.random() * max) + 1;
        console.log(rnd);
        return rnd;
    }
}
