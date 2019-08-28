import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {TestService} from './test.service';
import {TreeViewComponent} from '@syncfusion/ej2-angular-navigations';
import {TreeView} from '@syncfusion/ej2-navigations';

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
    fields: Object;
    constructor(private testService: TestService) { }

    ngOnInit() {
        $.getJSON('https://raw.githubusercontent.com/d3/d3-hierarchy/v1.1.8/test/data/flare.json', (res) => {
            console.log(res);
            this.dataSource = res;
            this.fields = { dataSource: this.dataSource['children'], id: 'name', text: 'name', child: 'children' };
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
