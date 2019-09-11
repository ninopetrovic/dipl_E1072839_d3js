import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class TestService {
    private prePath = 'http://localhost:5000';
    httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    httpOptionsToken = {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
    };

    constructor(private http: HttpClient, private cookieService: CookieService) {
        this.httpOptions.headers.append('Authorization', 'Bearer ' +  this.cookieService.get('token'));
    }

    // loginWithCredentials(username: string, password: string): Observable<any> {
    //     // const creds = {'username': username, 'password': password};
    //     const addPath = '?username=' + username + '&password=' +  password;
    //     return this.http.post<any>(this.prePath + '/connect/token' + addPath, null, this.httpOptionsToken).pipe(tap(credData => {
    //         this.cookieService.set('token', credData['access_token'], credData['expires_in']);
    //
    //     }));
    // }

    getThesaurus(name: string): Observable<any> {
        return this.http.get<any>(this.prePath + '/api/dictionary', this.httpOptions);
    }

    getEntityByUri(uri: string): Observable<any> {
        const creds = {
            uri: uri
        };
        return this.http.post<any>(this.prePath + '/api/dictionary/entity', creds, this.httpOptions);
    }

    searchByLabel(label: string): Observable<any> {
        return this.http.get<any>(this.prePath + '/api/dictionary/search/' + label, this.httpOptions);
    }

    getEntityByLabel(label: string) {
    }
}
