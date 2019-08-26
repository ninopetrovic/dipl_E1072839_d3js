import { Component, OnInit } from '@angular/core';

declare const $: any;
declare const ej: any;

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
    dataSource = [];
    constructor() { }
    ngOnInit() {
        $.getJSON('https://raw.githubusercontent.com/d3/d3-hierarchy/v1.1.8/test/data/flare.json', (res) => {
            console.log(res);
            this.dataSource = res;
        }).done(() => {
            console.log('data', this.dataSource);
        });
    }

}
