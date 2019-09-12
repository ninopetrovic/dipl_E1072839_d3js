import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import { Query, DataManager, Predicate } from '@syncfusion/ej2-data';
import {TestService} from './test.service';
import {TreeViewComponent} from '@syncfusion/ej2-angular-navigations';
import {TreeView} from '@syncfusion/ej2-navigations';
import {LabelFilterPipe} from '../shared/label.pipe';
import * as d3 from 'd3';
import { isoLangs } from '../shared/isoLangs';
import { thesAboutTexts } from '../shared/thesAboutTexts';

declare const $: any;
declare const ej: any;

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit, AfterViewInit {
    thesName = 'EuroVoc';
    // languages
    private _lang = 'sl';
    get lang() { return this._lang; }
    set lang(val: string) {
        if (val !== this._lang) {
            this._lang = val;
            // TODO reftesh all data
            if (this.thesDataSource) {
                this.activateAllLoaders();
                this.treeViewMapper(this.thesDataSource);
                this.thesDataSource = {...this.thesDataSource};
                this.fields = { dataSource: [...this.thesDataSource['children']], id: 'uri', text: 'showLabel', child: 'children', type: 'type' };
            }
            if (this.selectedEntity) {
                this.labelMapper(this.selectedEntity);
            }
            if (this.searchData && this.searchData.length > 0) {
                this.searchLangMap(this.searchData);
            }
        }
    }
    langName = 'slovenščina';
    isoLangs = isoLangs;
    thesDropDownDataSource =  [
        { id: 'EuroVoc', thesName: 'EuroVoc' },
        { id: 'Unescothes', thesName: 'Unescothes' },
        { id: 'Gemet', thesName: 'Gemet' },
        { id: 'STW', thesName: 'STW' },
        { id: 'AgroVoc', thesName: 'AgroVoc' }
    ];
    thesDropDownFields = {text: 'thesName', value: 'id'};

    // treeView
    @ViewChild('thesTreeView') thesTreeView: TreeViewComponent;
    dataSource = [];
    thesDataSource = [];
    thesFlatData = [];
    thesLoading = false;

    treeViewMappedData = [];
    fields: Object;
    selectedEntity: Object;
    selectedEntityUri = '';
    selectedEntityLabel = '';

    // vizuals
    vizualsLoaded = false;
    vizualsHovered = '';

    // search
    searchLoading = false;
    searchString = '';
    searchData;

    // pipeFilterArgs
    labelFilterArgs = {'lang': !'LINKED'};

    // THES ABOUTS
    thesAboutTexts = thesAboutTexts;

    constructor(private testService: TestService) { }

    ngOnInit() {
        this.getThesaurus(this.thesName);
    }

    ngAfterViewInit(): void {
        console.log('thesTreeView', this.thesTreeView);
        console.log('thesData', this.thesDataSource);
    }

    getThesaurus(thesName = 'EuroVoc') {
        console.log('getThesaurus', thesName);
        this.thesLoading = true;
        this.thesDataSource = null;
        this.testService.getThesaurus(thesName).subscribe((thesData) => {
            console.log('thesData', thesData);

            this.thesDataSource = thesData;
            this.treeViewMapper(this.thesDataSource);

            this.fields = { dataSource: this.thesDataSource['children'], id: 'uri', text: 'showLabel', child: 'children', type: 'type' };
            this.thesLoading = false;
            console.log(this.thesTreeView);
        });
    }

    activateAllLoaders() {
    }

    treeViewMapper(thesData) {
        if (thesData.children && thesData.children.length > 0) {
            thesData.children.forEach(m => {
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
        this.thesFlatData.push(thesData);
    }

    labelMapper(entity) {
        if (!entity) { return; }
        if (entity.labels.find(l => l.lang === this.lang && l.type === 'prefLabel')) {
            entity['showLabel'] = entity.labels.find(l => l.lang === this.lang && l.type === 'prefLabel').label;
        } else {
            if (entity.labels.find(l => l.lang === 'en' && l.type === 'prefLabel')) {
                entity['showLabel'] = '**' + entity.labels.find(l => l.lang === 'en' && l.type === 'prefLabel').label + '**';
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
    expendOrCollapseAll() {
        this.thesTreeView.expandAll();
        // this.thesTreeView.collapseAll();
    }
    nodeSelected(args) {
        console.log('nodeSelected', args);
        console.log(this.selectedEntityUri);
        this.getEntityByUri(args.nodeData.id);
    }
    treeViewdataBound() {
        console.log('treeViewdataBound');
        // this.thesTreeView.expandAll();
        if (this.thesDataSource.length > 0) {
            this.thesLoading = false;
        }
    }

    termSelect(term) {
        console.log(term);
        this.getEntityByUri(term.uri);
    }

    selectedLeaf(uri) {
        console.log('selectedLeaf', uri);
        this.getEntityByUri(uri);
        this.thesTreeView.collapseAll();
        setTimeout(() => {
            this.thesTreeView.ensureVisible(uri);
            setTimeout(() => {
                this.thesTreeView.selectedNodes = [uri];
            }, 500);
        }, 500);

    }

    getEntityByUri(uri) {
        if (this.selectedEntityUri === uri) { return; }
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
        if (!this.searchString || this.searchString.length === 0) {
            this.searchData = [];
            return;
        }
        this.searchLoading = true;
        this.searchData = [];
        this.testService.searchByLabel(this.searchString).subscribe(data => {
            this.searchData = data;
            console.log(this.searchData);
            this.searchLangMap(this.searchData);
            this.searchLoading = false;
        });
    }
    searchLangMap(data) {
        data.forEach((item) => {
            this.labelMapper(item);
        });
    }

    // language
    langSelect(args) {
        console.log('langSelect', args);

        this.lang = args.itemData.code;
    }

    // thes select
    thesNameSelected(args) {
        console.log('thesNameSelected', args);
        if (args.isInteracted) {
            this.selectedEntity = null;
            this.thesName = args.itemData.id;
            this.getThesaurus(this.thesName);
        }
    }
}
