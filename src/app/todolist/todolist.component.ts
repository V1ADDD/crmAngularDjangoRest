import {Component} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { FormControl } from '@angular/forms';
import {ActivatedRoute, Router} from "@angular/router";
import {httpOptions} from "../app.component";

@Component({
  selector: 'app-todolist',
  templateUrl: './todolist.component.html',
  styleUrls: ['./todolist.component.css']
})
export class TodolistComponent {
  tasks: any;
  deadline = new FormControl();
  mindate: string = new Date().toISOString().slice(0, 10);
  backendURL: string = 'https://crmdiplom.pythonanywhere.com';
  // backendURL: string = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {
    if ('Authorization' in localStorage) {
      httpOptions.headers = new HttpHeaders({'Authorization': <string>localStorage.getItem('Authorization')});
      this.http.get(this.backendURL+'/tasks', httpOptions).subscribe(
        {
          next: (response: any) => {
            this.tasks = response.tasks;
            this.route.queryParams.subscribe(params => {
              if (Object.keys(params).length !== 0) {
                let form = <HTMLFormElement>document.getElementById('add_task');
                form.style.display = 'block';
                this.deadline.setValue(params['date'].substring(0, 10));
              }
            });
          }
        }
      );
    } else
      this.router.navigate(['/signin']);
  }

  add_task() {
    let form = <HTMLFormElement>document.getElementById('add_task');
    if (form.style.display === 'none')
      form.style.display = 'block';
    else
      form.style.display = 'none';
  }

  task_open(id: string) {
    let descr = <HTMLDivElement>document.getElementById('desc' + id);
    if (descr.style.display === 'none')
      descr.style.display = 'block';
    else
      descr.style.display = 'none';
  }

  update_status(id: string, status: any) {
    const url = this.backendURL+'/tasks/' + id;
    let data = {
      status: status
    }
    this.http.put(url, data, httpOptions).subscribe(
      response => {
      }
    )
  }

  new_task(form_add: any, ev: any) {
    ev.preventDefault();
    const url = this.backendURL + '/tasks';
    const taskinfo = {
      name: form_add.name.value,
      desc: form_add.desc.value,
      deadline: form_add.deadline.value
    };
    this.http.post(url, taskinfo, httpOptions).subscribe(
      {
        next: (response: any) => {
          this.http.get(this.backendURL+'/tasks', httpOptions).subscribe(
            {
              next: (response: any) => {
                this.tasks = response.tasks;
                window.location.reload();
              }
            }
          );
        }
      }
    );
  }
}
