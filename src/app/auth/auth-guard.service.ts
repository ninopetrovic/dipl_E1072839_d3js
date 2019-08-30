import { Injectable } from '@angular/core';
import {Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import {Observable, of} from 'rxjs';
@Injectable({
    providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
    constructor(public router: Router, private cookieService: CookieService) {}
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>|Promise<boolean>|boolean {
        if (!this.cookieService.get('token')) {
            this.router.navigate(['/login']);
            return of(false);
        }
        return of(true);
    }
}
