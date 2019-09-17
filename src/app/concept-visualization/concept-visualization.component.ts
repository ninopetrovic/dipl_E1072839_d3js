import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import * as d3 from 'd3';
import {TestService} from '../test/test.service';

declare const $: any;
declare const ej: any;

@Component({
  selector: 'app-concept-visualization',
  templateUrl: './concept-visualization.component.html',
  styleUrls: ['./concept-visualization.component.css']
})
export class ConceptVisualizationComponent implements OnInit {
    @Input() data = [];
    private _uri = '';
    @Input()
    get uri() { return this._uri; }
    set uri(val) {
        if (val && val !== this._uri) {
            this._uri = val;
            this.getData(val);
        }
    }
    @Input() thesName = '';
    @Input() lang = 'sl';
    // @Output() visualsLoaded = new EventEmitter();
    loading = false;

    @Output() uriSelected = new EventEmitter();
    hoverText = '';
    @Output() textHovered = new EventEmitter();

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
                if (!d3.event.active) { simulation.alphaTarget(0); }
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
    }

    getData(uri) {
        this.loading = true;
        this.testService.getConceptVizualizationData(uri).subscribe((data) => {
            console.log(data);
            this.data = {...data};
            this.remapData(this.data['nodes']);
            const node = this.getVisualization(data);
            console.log(node);
            const container = document.getElementById('conceptVisualizationContainer');
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            container.appendChild(node);
        });
    }

    getVisualization(data) {
        const links = this.data['links'].map(d => Object.create(d));
        const nodes = this.data['nodes'].map(d => Object.create(d));
        nodes[0]['mainUri'] = 'mainUri';

        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id))
            .force('charge', d3.forceManyBody())
            .force('center', d3.forceCenter(this.width / 2, this.height / 2));

        const svg = d3.create('svg')
            .attr('viewBox', [0, 0, this.width, this.height]);

        svg.call(d3.zoom().on('zoom', () => {
            const transform = d3.event.transform;
            d3.selectAll('.main-group')
                .attr('transform', transform);
        }));

        const link = svg.append('g')
            .attr('class', 'main-group')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.9)
            .selectAll('line')
            .data(links).enter()
            .append('line')
            .attr('stroke-width', d => Math.sqrt(d.value))
            .attr('class', (d) => 'lineType' +  d.type );

        const node = svg.append('g')
            .attr('class', 'main-group')
            .attr('stroke', '#fff')
            .attr('stroke-width', 1)
            .selectAll('circle')
            .data(nodes).enter()
            .append('g').attr('class', 'circleGroup')
            .append('circle')
            .attr('class', (d) =>  d.mainUri ? d.mainUri : null)
            .attr('r', (d) => d.size)
            .attr('fill', (d) => '#83bdb9')
            .call(this.drag(simulation));

        node.on('dblclick', (d) => this.nodeClicked(d.id));

        const tekst = svg.append('g')
            .attr('class', 'main-group')
            .selectAll('text')
            .data(nodes)
            .enter()
            .append('text')
            .attr('class', 'textLabel')
            .text((d) => d.name);

        node.append("title")
            .text(d => d.name);

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
                .attr("x", d => d.x + 3)
                .attr("y", d => d.y - 3);
        });

        // invalidation.then(() => simulation.stop());
        this.loading = false;
        this.hoverInit();
        return svg.node();
    }

    nodeClicked(uri) {
        this.uriSelected.emit(uri);
    }

    hoverInit() {
        setTimeout(() => {
            $('circle').hover((e) => {
                console.log(e);
                if (e.target && e.target.children[0] && $(e.target.children[0])[0]) {
                    const text = $(e.target.children[0])[0].textContent;
                    this.hoverText = text ? text : '';
                    this.textHovered.emit(this.hoverText);
                    if (e.handleObj.type === 'mouseout') {
                        this.textHovered.emit('');
                    }
                } else {
                    this.textHovered.emit('');
                }
            });
        }, 500);
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

    remapData(nodes) {
        nodes.forEach(node => {
            if (node.labels.length > 0) {
                if (node.labels.find(l => l.lang === this.lang && l.type === 'prefLabel')) {
                    node['name'] = node.labels.find(l => l.lang === this.lang && l.type === 'prefLabel').label;
                } else {
                    node['name'] = '**' + node.labels.find(l => l.lang === 'en' && l.type === 'prefLabel').label + '**';
                }
            } else {
                node['name'] = this.thesName;
            }
        });
    }
}
