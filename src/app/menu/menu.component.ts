import { Component } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Router} from "@angular/router";
import {httpOptions} from "../app.component";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {

  constructor(private http: HttpClient, private router: Router) {
    if ('Authorization' in localStorage){

    }
    else
      this.router.navigate(['/signin']);
  }
  Exit(){
    localStorage.removeItem('Authorization');
    localStorage.removeItem('Id');
    this.router.navigate(['/']);
  }

}
