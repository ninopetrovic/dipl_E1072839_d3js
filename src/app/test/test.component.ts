import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {TestService} from './test.service';
import {TreeViewComponent} from '@syncfusion/ej2-angular-navigations';
import {TreeView} from '@syncfusion/ej2-navigations';
import * as d3 from 'd3';

declare const $: any;
declare const ej: any;

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit, AfterViewInit {
    @ViewChild('thesTreeView') thesTreeView: TreeViewComponent;
    dataSource = [];
    thesDataSource = [];
    thesLoading = false;
    vizualsLoaded = false;
    treeViewMappedData = [];
    fields: Object;
    lang = 'ar';
    thesName = 'Gemet';
    selectedEntity: Object;
    selectedEntityUri = '';
    selectedEntityLabel = '';

    constructor(private testService: TestService) { }

    ngOnInit() {
        $.getJSON('https://raw.githubusercontent.com/d3/d3-hierarchy/v1.1.8/test/data/flare.json', (res) => {
            console.log(res);
            this.dataSource = res;
            // this.fields = { dataSource: this.dataSource['children'], id: 'name', text: 'name', child: 'children' };
        }).done(() => {
            console.log('data', this.dataSource);
        });

        // TEST SERVICE
        // this.testService.loginWithCredentials('user1', 'user1').subscribe(token => {
        //     console.log('getToken', token);
        // });
        this.thesLoading = true;
        this.testService.getThesaurus('Gemet').subscribe((thesData) => {
            console.log('thesData', thesData);

            this.thesDataSource = thesData;
            this.treeViewMapper(this.thesDataSource);

            this.fields = { dataSource: this.thesDataSource['member'], id: 'uri', text: 'showLabel', child: 'member', type: 'type' };
            this.thesLoading = false;
            console.log(this.thesTreeView);
        });

        this.getEntityByUri('concept/2712');
    }

    ngAfterViewInit(): void {
        console.log('thesTreeView', this.thesTreeView);
    }

    treeViewMapper(thesData) {
        if (thesData.member.length > 0) {
            thesData.member.forEach(m => {
                if (m.labels.find(l => l.lang === this.lang && l.type === 'prefLabel')) {
                    m['showLabel'] = m.labels.find(l => l.lang === this.lang && l.type === 'prefLabel').label;
                } else {
                    m['showLabel'] = '**' + m.labels.find(l => l.lang === 'en' && l.type === 'prefLabel').label + '**';
                }
                this.treeViewMapper(m);
            });
        }
    }

    labelMapper(entity) {
        if (entity.labels.find(l => l.lang === this.lang && l.type === 'prefLabel')) {
            entity['showLabel'] = entity.labels.find(l => l.lang === this.lang && l.type === 'prefLabel').label;
        } else {
            entity['showLabel'] = '**' + entity.labels.find(l => l.lang === 'en' && l.type === 'prefLabel').label + '**';
            console.log('ta labela nima izraza v tem jeziku: ', entity.labels.find(l => l.lang === 'en' && l.type === 'prefLabel').label);
        }
        console.log(entity['showLabel']);
        entity.member.forEach(m => {
            this.labelMapper(m);
        });
        entity.broader.forEach(b => {
            this.labelMapper(b);
        });
        entity.narrower.forEach(n => {
            this.labelMapper(n);
        });
        entity.related.forEach(r => {
            this.labelMapper(r);
        });
    }

    // TREE VIEW EVENTS
    nodeSelected(args) {
        console.log('nodeSelected', args);
        // this.selectedEntityLabel = args.nodeData.text;
        this.getEntityByUri(args.nodeData.id);
    }

    termSelect(term) {
        console.log(term);
        this.getEntityByUri(term.uri);
    }

    selectedLeaf(args) {
        this.getEntityByUri(args);
    }

    getEntityByUri(uri) {
        this.selectedEntityUri = uri;
        this.testService.getEntityByUri(this.selectedEntityUri).subscribe(entity => {
            this.selectedEntity = entity
            this.labelMapper(this.selectedEntity);
            console.log(this.selectedEntity);
        });
    }

}
