import { Component } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {httpOptions} from "../app.component";
import {Router} from "@angular/router";
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent {
  login: string | undefined;
  password: string | undefined;
  backendURL: string = 'https://crmdiplom.pythonanywhere.com';
  // backendURL: string = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient, private router: Router) {
    if ('Authorization' in localStorage)
      this.router.navigate(['/menu']);
  }
  signIn() {
    const hash = CryptoJS.MD5(this.password + "d3289rfh28");
    httpOptions.headers = new HttpHeaders({'Authorization': 'Basic ' + btoa(this.login+':'+hash.toString())});
    this.http.get(this.backendURL+'/accounts', httpOptions).subscribe(
      {
        next: (response: any) => {
          console.log(response)
          localStorage.setItem('Id', response.id);
          localStorage.setItem('Authorization', 'Basic ' + btoa(this.login + ':' + hash.toString()));
          this.router.navigate(['/menu']);
        },
        error: (error: any)=>
        {
          alert("Неверные логин или пароль!")
          httpOptions.headers = new HttpHeaders();
        }
      }
    );
  }
}
