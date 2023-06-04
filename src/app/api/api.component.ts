import {Component} from '@angular/core';
import {Router} from "@angular/router";
import {httpOptions} from "../app.component";
import {HttpClient, HttpHeaders} from "@angular/common/http";

interface Api {
  link: string,
  requestTypes: string[],
  description: string
}

@Component({
  selector: 'app-api',
  templateUrl: './api.component.html',
  styleUrls: ['./api.component.css']
})

export class ApiComponent {
  apis: Api[];
  backendURL: string = 'https://crmdiplom.pythonanywhere.com';
  // backendURL: string = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient, private router: Router) {
    httpOptions.headers = new HttpHeaders({'Authorization': <string>localStorage.getItem('Authorization')});
    this.http.get(this.backendURL+'/accounts/' + localStorage.getItem('Id'), httpOptions).subscribe(
    {
      next: (response: any) => {
        let user = response;
        if (user.sub != 4) {
          if (!user.isadmin) {
            alert("Для доступа к данному разделу, нужна подписка уровня ВСЕ ВКЛЮЧЕНО.")
            router.navigate(['/menu']);
          }
        }
      }
    });
    this.apis = [
      {
        link: this.backendURL+'/api/clients/{apiKey}',
        requestTypes: [
          'POST',
          'GET'
        ],
        description: 'С помощью данного запроса Вы сможете получить всех клиентов или создать нового. Для создания необходимо передать в POST-запроса параметры name (ФИО клиента) и info (информация о клиенте).'
      },
      {
        link: this.backendURL+'/api/clients/{apiKey}/{id}',
        requestTypes: [
          'PUSH',
          'DELETE'
        ],
        description: 'С помощью данного запроса Вы сможете изменить или удалить информацию о клиенте по его id.'
      },
      {
        link: this.backendURL+'/api/orders/{apiKey}',
        requestTypes: [
          'POST',
          'GET'
        ],
        description: 'С помощью данного запроса Вы сможете получить все заказы или создать новый. Для создания необходимо передать в POST-запроса параметры name (название), client (id клиента) и desc (информация о заказе).'
      },
      {
        link: this.backendURL+'/api/orders/{apiKey}/{id}',
        requestTypes: [
          'PUSH',
          'DELETE'
        ],
        description: 'С помощью данного запроса Вы сможете изменить (перейти к следующему пункту заказа) или удалить информацию о заказе по его id.'
      },
      {
        link: this.backendURL+'/api/chats/{apiKey}',
        requestTypes: [
          'POST',
          'GET'
        ],
        description: 'С помощью данного запроса Вы сможете получить все переписки или создать новую. Для создания необходимо передать в POST-запроса параметры socnet (Telegram/Email/Instagram) и client (id клиента).'
      },
      {
        link: this.backendURL+'/api/chats/{apiKey}/{id}',
        requestTypes: [
          'POST'
        ],
        description: 'С помощью данного запроса Вы сможете отправить новое сообщение.'
      }
    ]
  }
}
