import { Component, OnInit } from '@angular/core';
import {LoginService} from './login.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    username = '';
    password = '';
    loginMessage = '';
    loading = false;

  constructor(private loginService: LoginService, private router: Router) { }

  ngOnInit() {
  }

  login() {
      console.log('try login with:', this.username, this.password);
      this.loginMessage = '';
      this.loading = true;
      this.loginService.loginWithCredentials(this.username, this.password).subscribe((res) => {
          console.log('success', res);
          if (res['access_token']) {
              this.router.navigate(['/test-component']);
          }
          this.loading = false;
      }, (err) => {
          console.log('error', err);
          this.loginMessage = 'Napaka ob prijavi.';
          this.loading = false;
          // TODO remove (testing only)
          setTimeout(() => {
              this.router.navigate(['/test-component']);
          }, 5000);
      }, () => {
          this.loading = false;
      });
  }

}
