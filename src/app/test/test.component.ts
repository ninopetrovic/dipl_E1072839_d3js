import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {TestService} from './test.service';
import {TreeViewComponent} from '@syncfusion/ej2-angular-navigations';
import {TreeView} from '@syncfusion/ej2-navigations';
import {LabelFilterPipe} from '../shared/label.pipe';
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
    thesFlatData = [];
    thesLoading = false;
    vizualsLoaded = false;
    treeViewMappedData = [];
    fields: Object;
    lang = 'sl';
    thesName = 'Gemet';
    selectedEntity: Object;
    selectedEntityUri = '';
    selectedEntityLabel = '';

    // search
    searchString = '';
    searchData = [];

    // pipeFilterArgs
    labelFilterArgs = {'lang': !'LINKED'};

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

            // FLAT DATA
            // this.mapToFlatData(thesData);
            // console.log(this.thesFlatData);
        });

        this.getEntityByUri('concept/2712');
    }

    ngAfterViewInit(): void {
        console.log('thesTreeView', this.thesTreeView);
    }

    treeViewMapper(thesData) {
        if (thesData.member && thesData.member.length > 0) {
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

    mapToFlatData(thesData) {
        if (thesData.member && thesData.member.length > 0) {
            thesData.member.forEach((m) => {
                this.mapToFlatData(m);
            });
        }
        // delete thesData.member;
        this.thesFlatData.push(thesData);
    }

    labelMapper(entity) {
        if (!entity) { return; }
        if (entity.labels.find(l => l.lang === this.lang && l.type === 'prefLabel')) {
            entity['showLabel'] = entity.labels.find(l => l.lang === this.lang && l.type === 'prefLabel').label;
        } else {
            if (entity.labels.find(l => l.lang === 'en' && l.type === 'prefLabel')) {
                entity['showLabel'] = '**' + entity.labels.find(l => l.lang === 'en' && l.type === 'prefLabel').label + '**';
                console.log('ta labela nima izraza v tem jeziku: ', entity.labels.find(l => l.lang === 'en' && l.type === 'prefLabel').label);
            } else {
                entity['showLabel'] = '*** labela ne obstaja ***';
            }
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
        console.log('selectedLeaf', args);
        this.getEntityByUri(args);
        // this.thesTreeView.ensureVisible(this.thesTreeView.getNode(args).id);
        this.thesTreeView.expandAll();
        console.log(this.thesTreeView.getNode(args));

    }

    getEntityByUri(uri) {
        this.selectedEntityUri = uri;
        this.testService.getEntityByUri(this.selectedEntityUri).subscribe(entity => {
            this.selectedEntity = entity
            this.labelMapper(this.selectedEntity);
            console.log(this.selectedEntity);
        });
    }

    // search
    searchByLabel() {
        console.log(this.searchString);
        this.testService.searchByLabel(this.searchString).subscribe(data => {
            this.searchData = data;
            console.log(this.searchData);
            this.searchData.forEach((item) => {
                this.labelMapper(item);
            });
        });
    }
}
