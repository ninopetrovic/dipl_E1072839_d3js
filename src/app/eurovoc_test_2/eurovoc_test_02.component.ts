import { Component, ViewEncapsulation, OnInit, EventEmitter, Input, Output } from '@angular/core';

import * as d3 from 'd3';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Axis from 'd3-axis';
import * as d3Zoom from 'd3-zoom';
import * as d3Brush from 'd3-brush';
import * as d3Array from 'd3-array';
import * as d3TimeFormat from 'd3-time-format';
import {TestService} from '../test/test.service';

declare const $: any;
declare const ej: any;

@Component({
    selector: 'app-eurovoc-test2',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './eurovoc_test_02.component.html',
    styleUrls: []
})
export class EurovocTestComponentTwo implements OnInit {
    @Input() dataSource;
    @Input() lang;

    data: any;
    width = 1024;
    radius = 100;
    hoveredElem = '';

    @Output() svgLoaded = new EventEmitter();
    @Output() selectedLeaf = new EventEmitter();

    constructor(private testService: TestService) {}

    public ngOnInit(): void {
        // $.getJSON('https://raw.githubusercontent.com/d3/d3-hierarchy/v1.1.8/test/data/flare.json', (res) => {
        //     console.log(res);
        //     this.data = res;
        // }).done(() => {
        //     console.log('data', this.data);
        //     this.buildChart(this.data);
        //     console.log(this);
        // });

        this.testService.getThesaurus('Gemet').subscribe(data => {
            // console.log(data);
            this.data = data;
            this.remapData(this.data);
            // console.log(this.data);
            this.buildChart(this.data);
        });
        this.svgLoaded.subscribe(loaded => {
            $('path').hover((e) => {
                // console.log(e);
                const hoversplit = $(e.target.children[0])[0].textContent.split('->');

                if ( this.hoveredElem !== hoversplit[hoversplit.length - 1]) {
                    document.getElementById('displayHover').style.left = (e.originalEvent.pageX + 20 ).toString() + 'px';
                    document.getElementById('displayHover').style.top = (e.originalEvent.pageY + 20 ).toString() + 'px';
                    document.getElementById('displayHover').style.display = 'block';
                }
                this.hoveredElem = hoversplit[hoversplit.length - 1] ? hoversplit[hoversplit.length - 1] : '';
                if (e.handleObj.type === 'mouseout') {
                    document.getElementById('displayHover').style.display = 'none';
                }
            });
        });
    }

    remapData(entity) {
        entity['children'] = entity.member.length > 0 ? entity.member : undefined;
        if (entity.labels.length > 0) {
            if (entity.labels.find(l => l.lang === this.lang && l.type === 'prefLabel')) {
                entity['name'] = entity.labels.find(l => l.lang === this.lang && l.type === 'prefLabel').label;
            } else {
                entity['name'] = '**' + entity.labels.find(l => l.lang === 'en' && l.type === 'prefLabel').label + '**';
            }
        } else {
            entity['name'] = 'Gemet';
        }
        entity.member.forEach(member => {
            this.remapData(member);
        });
        // return data.member;
    }

    buildChart(data): void {
        const rootPartition = this.partition(data);
        // console.log('root partition', rootPartition);

        rootPartition.each(d => d.current = d);
        d3.select('g').remove();
        // nastavimo sirino in višino canvasa ter font;
        const svg = d3.select('#testChartNinoTwo')
            .attr('viewBox', [0, 0, this.width, this.width])
            .style('font', '10px sans-serif');
        // ZOOM EVENT
        svg.call(d3.zoom().on('zoom', () => {
            // console.log(d3.event, this.width);
            const transform = d3.event.transform;
            // transform.y /= 2;
            // transform.x /= 2;
            d3.select('g').attr('transform', transform);
        }));

        // dodamo g (skupina elementov) element ter ga postavimo v sredino canvasa;
        const g = svg.append('g')
            .attr('transform', 'translate(' + this.width / 2 + ',' + this.width / 2 + ')');

        // barvna lestvica (mavrica)
        const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow , data.children.length + 1));

        // tukaj bomo dodali "path"-e (pot nekega geometrijskega telesa) za naše kroŽne odseke
        const path = g.append('g') // glavni skupini dodamo skupino za vsak elem
            .selectAll('path') // vedno prvo selektiramo sele nato 'loop'-amo skozi podatke
            .data(rootPartition.descendants().slice(1)) // tukaj loopamo cez podatke;
        // .descendants() nam naredi array iz vseh elementov.. torej gre cez vse otroke itd in jih postavi v linearni array;
        // .slice(1) pa zato ker nočemo prvega objekta ki je vbistvu root;
            .enter() // z entrom loopamo skozi podatke. V angularju tezave z enter funkcijo do verzije ang6
            .append('path') // sedaj appendamo path na 'g';
            .attr('fill', d => {
                while (d.depth > 1) { // torej dokler ima node (d) childrene
                    d = d.parent;
                }
                if (!d.data.color) {
                    d.data['color'] = color(d.data.name).toString();
                    return color(d.data.name);
                } else {
                    return d.data.color;
                }
            })
            .attr('fill-opacity', d => d.children ? '1' : '0.5')
            .attr( 'd', d => this.getArc()(d.current)); // d attribut je dejsnki 'path' (pot) ki ga bo element zavzel / narisal
        // d ki pride zgoraj kot value je objekt iz arreja skozi katerega loopamo

        path // zamenjamo standardni cursor za rokico in dodamo event listener za "click"
            .style('cursor', 'pointer')
            .on('click', clicked);

        path.append('title') // dodamo title ki se izpise ob mouseHover (HTML standardni title je to)
        // ancestors() je array prednikov skozi katerega mapiramo.. reverse za to da je od roota -> childu;
            .text(d => '' + d.ancestors().map(f => f.data.name).reverse().join(' -> ') + '');

        // console.log(rootPartition);
        // dodajanje napisa na krozne loke
        const label = g.append('g')
            .attr('pointer-events', 'none')
            .attr('text-anchor', 'middle')
            .style('user-select', 'none')
            .selectAll('text')
            .data(rootPartition.descendants())
            .enter()
            .append('text')
            .attr('dy', '0.35em')
            .attr('fill-opacity',d =>  +this.labelVisible(d.current))
            .attr('transform', (d) => this.labelTransform(d) )
            .text(d => d.data.name);

        label.filter(d => !d.children)
            .style('font-size', '5px');
        label.filter(d => d.children)
            .style('font-size', '6px');

        // krog na sredini za pot nazaj;
        const parent = g.append('circle')
            .datum(rootPartition)
            .attr('r', this.radius)
            .attr('fill', '#d2d2d2')
            .attr('pointer-events', 'all') // nam pove če je lahko elemnet effectan s misko;
            .on('click', clicked);
        const parentText = g.append('text')
            .attr('transform', 'translate(' + -20 + ',' + 5 + ')')
            .datum(rootPartition)
            .style('font-size', '20px')
            .text(d => d.data.name);

        const that = this;
        function clicked(p) {
            // that.nodeClick(p);
            parent.datum(p.parent || rootPartition);
            parentText.text(p.data.name);
            if (p.data.uri) {
                that.selectedLeaf.emit(p.data.uri);
            }


            // TODO
            rootPartition.each(d => d.target = {
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
            // TWEENing je torej kako se bodo podatki skozi čas preslikali iz zacetne vrednosti v koncno
            // recimo da imamo podatek z zacetno vrednostjo 'a' in koncno vrednostjo 'e' bo
            // tweening poskrbel da bo tranzicija tekoča: -> a - B - C - D - e
                .tween('data', d => {
                    const i = d3.interpolate(d.current, d.target);
                    return t => d.current = i(t);
                })
                .filter(function(d) {
                    return +this.getAttribute('fill-opacity') || that.arcVisible(d.target);
                })
                .attr('fill-opacity', d => d.children ? 1 : 0.5)
                .attrTween('d', d => () => that.getArc()(d.current));

            // label.attr('fill-opacity', '0');

            label.filter(function(d) {
                return +this.getAttribute('fill-opacity') || that.labelVisible(d.target);
            }).transition(t)
                .attr('fill-opacity', d => +that.labelVisible(d.target))
                .attrTween('transform', d => () => that.labelTransform(d.current));
        }
        this.svgLoaded.emit(true);
    }

    nodeClick(node) {
        // console.log(node);
        this.data = node.data;
        this.buildChart(this.data);
    }

    labelTransform(node) {
        // SOURCE TEGA IZ INTERNETA (precej komplexna transformacija)
        // x0 x1 sta start in end angle... delimo s 360 in se s PI
        const x = (node.x0 + node.x1) / 2 * 180 / Math.PI;
        // 100 = radius, y0 in y1 gre od 0 pa do toliko koliko je nivojev / delimo vedno s 2 da dobimo pol in na to s rediusomm
        const y = (node.y0 + node.y1) / 2 * this.radius;
        // tukaj je zelo pomemben vrstni red...
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }

    labelVisible(d) {
        // return (d.x1 - d.x0) > 0;
        // console.log(d);
        // return d.data.name.length < 20 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.00;
        // return false;
        return (d.y1 - d.y0) * (d.x1 - d.x0) > 0.00;
    }

    arcVisible(d) {
        /* y-loni so vedno za 1 vsak nivo za 1 vecji...
            torej 10 nam predstavlja v koliko nivo globine hocemo videti ... 1 pa od katerega dalje */
        // x-i so kot v tockah od npr 0 do 6.28 (za cel krog)
        return d.y1 <= 10 && d.y0 >= 0 && d.x1 > d.x0;
    }

    getArc() {
        return d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .innerRadius(d => (d.y0 * this.radius) + 2)
            .outerRadius(d => d.y1 * this.radius)
            .padAngle(0.003)
            .cornerRadius(5);
    }

    getColor(data, string) {
        // scale za mavrično barvo
        const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));
        return color(string);
    }

    getFormat() {
        return d3.format(',d');
    }

    partition(data) {
        const root = d3.hierarchy(data).sum(d => {
            if (!d.children) { return 1; }
        }).sort((a, b) => b.value - a.value);
        return d3.partition().size([2 * Math.PI, root.height + 1])(root);
    }
}
