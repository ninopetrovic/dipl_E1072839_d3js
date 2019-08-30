import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import {LoginService} from './login.service';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
      BrowserModule,
      FormsModule
  ],
  declarations: [LoginComponent],
    exports: [LoginComponent],
    providers: [LoginService]
})
export class LoginModule { }
