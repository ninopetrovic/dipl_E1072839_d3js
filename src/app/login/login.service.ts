import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
    providedIn: 'root'
})
export class LoginService {
    private prePath = 'http://localhost:5000';
    httpOptionsToken = {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
    };

    constructor(private http: HttpClient, private cookieService: CookieService) { }

    loginWithCredentials(username: string, password: string): Observable<any> {
        const addPath = '?username=' + username + '&password=' +  password;
        return this.http.post<any>(this.prePath + '/connect/token' + addPath, null, this.httpOptionsToken).pipe(tap(credData => {
            this.cookieService.set('token', credData['access_token'], credData['expires_in']);
        }));
    }
}
