import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {TestService} from './test.service';
import {TreeViewComponent} from '@syncfusion/ej2-angular-navigations';
import {TreeView} from '@syncfusion/ej2-navigations';

declare const $: any;
declare const ej: any;

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit, AfterViewInit {
    @ViewChild('thesTreeView') thesTreeView: TreeViewComponent;
    dataSource = [];
    fields: Object;
    constructor(private testService: TestService) { }

    public hierarchicalData: Object[] = [
        { id: '01', name: 'Music', expanded: true,
            subChild: [
                {id: '01-01', name: 'Gouttes.mp3'},
            ]
        },
        {
            id: '02', name: 'Videos',
            subChild: [
                {id: '02-01', name: 'Naturals.mp4'},
                {id: '02-02', name: 'Wild.mpeg'}
            ]
        },
        {
            id: '03', name: 'Documents',
            subChild: [
                {id: '03-01', name: 'Environment Pollution.docx'},
                {id: '03-02', name: 'Global Water, Sanitation, & Hygiene.docx'},
                {id: '03-03', name: 'Global Warming.ppt'},
                {id: '03-02', name: 'Social Network.pdf'},
                {id: '03-03', name: 'Youth Empowerment.pdf'},
            ]
        }
    ];
    public field = { dataSource: this.hierarchicalData, id: 'name', text: 'name', child: 'subChild' };

    ngOnInit() {
        $.getJSON('https://raw.githubusercontent.com/d3/d3-hierarchy/v1.1.8/test/data/flare.json', (res) => {
            console.log(res);
            this.dataSource = res;
            const dummyData = {'name': 'bla bla'};
            this.field.dataSource = [this.dataSource];
            this.field.child = 'children';
            this.fields = this.field;
        }).done(() => {
            console.log('data', this.dataSource);
        });

        // TEST SERVICE
        this.testService.loginWithCredentials('user1', 'user1').subscribe(token => {
            console.log('getToken', token);
        });
    }

    ngAfterViewInit(): void {
        console.log('thesTreeView', this.thesTreeView);
    }

}
