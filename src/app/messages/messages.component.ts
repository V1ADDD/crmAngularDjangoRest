import {Component} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Router} from "@angular/router";
import {httpOptions} from "../app.component";
import * as moment from 'moment';
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent {
  chats: any;
  socials: string[] = [];
  socnet: string = "all";
  telegramId: string = "";
  backendURL: string = 'https://crmdiplom.pythonanywhere.com';
  // backendURL: string = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient, private router: Router) {
    if ('Authorization' in localStorage) {
      httpOptions.headers = new HttpHeaders({'Authorization': <string>localStorage.getItem('Authorization')});
      this.http.get(this.backendURL+'/accounts/' + localStorage.getItem('Id'), httpOptions).subscribe(
      {
        next: (response: any) => {
          let user = response;
          if (user.sub == 1) {
            if (!user.isadmin) {
              alert("Для доступа к данному разделу нужна подписка уровня ТЕЛЕГРАМ и выше.")
              router.navigate(['/menu']);
            }
          }
          this.telegramId = user.apiKey;
          this.http.get('https://api.telegram.org/bot' + this.telegramId + "/getUpdates").subscribe(
            {
            next: (responseTg: any) => {
              this.analyzeTelegramMessages(responseTg.result);
            }
          });
          if (user.sub < 3) {
            if (!user.isadmin) {
              this.socials.push("Telegram");
            }
          }
          if (user.sub >= 3 || user.isadmin) {
            this.socials.push("Telegram");
            // this.socials.push("Gmail");
          }
        }
      });
      this.http.get(this.backendURL+'/chats', httpOptions).subscribe(
        {
          next: (response: any) => {
            this.chats = response;
            for (let chat of this.chats) {
              this.http.get(this.backendURL+'/clients/' + chat.client, httpOptions).subscribe(
                {
                  next: (response: any) => {
                    chat.clientname = response.name;
                  }
                }
              );
              this.http.get(this.backendURL+'/chats/' + chat.id + '/messages', httpOptions).subscribe(
                {
                  next: (response: any) => {
                    chat.lastdate = moment(response.messages[0].date).format('M.DD.YYYY / H:mm:ss');
                  }
                }
              );
            }
            this.chats.sort((a: any, b: any) => {
              if (a.lastdate > b.lastdate) {
                return -1;
              } else if (a.lastdate < b.lastdate) {
                return 1;
              } else {
                if (a.read && !b.read) {
                  return 1;
                } else if (!a.read && b.read) {
                  return -1;
                } else {
                  return 0;
                }
              }
            });
          }
        }
      );
    } else
      this.router.navigate(['/signin']);
  }

  analyzeTelegramMessages(results: any) {
    console.log(results);
    this.http.get(this.backendURL+'/clients', httpOptions).subscribe(
      {
        next: (response: any) => {
          let addedNames: string[] = [];
          for (let result of results) {
            if (response.findIndex((item: { name: string; }) => item.name === result.message.from.username) == -1 &&
            addedNames.findIndex(item => item === result.message.from.username) == -1) {
              addedNames.push(result.message.from.username);
              let firstClientsEntry: number = results.findIndex(
                (item: { message: any; }) => item.message.from.username === result.message.from.username);
              let lastClientsEntry: number = results.reverse().findIndex(
                (item: { message: any; }) => item.message.from.username === result.message.from.username);

              if (lastClientsEntry !== -1)
                lastClientsEntry = results.length - 1 - lastClientsEntry;
              const newClient = {
                name: result.message.from.username,
                info: result.message.from.id,
                account: localStorage.getItem('Id')
              };
              this.http.post(this.backendURL+'/clients', newClient, httpOptions).subscribe(
                {
                  next: (response: any) => {
                    console.log(response);
                    console.log(results[firstClientsEntry].message.date)
                    console.log(new Date(results[firstClientsEntry].message.date * 1000))
                    const newChat = {
                      user: localStorage.getItem('Id'),
                      client: response.id,
                      date_begin: new DatePipe('en-US').transform(new Date(results[firstClientsEntry].message.date * 1000), 'yyyy-MM-dd HH:mm:ss.SSSSSSZ', '+0300')
                    };
                    this.http.post(this.backendURL+'/chats', newChat, httpOptions).subscribe(
                      {
                        next: (response: any) => {
                          console.log(response);
                          for (let resultMessage of results.filter((res: any) => res.message.from.username == result.message.from.username)) {
                            const newMessage = {
                              message: resultMessage.message.text,
                              to_client: false,
                              date: new DatePipe('en-US').transform(new Date(resultMessage.message.date * 1000), 'yyyy-MM-dd HH:mm:ss.SSSSSSZ', '+0300')
                            }
                            this.http.post(this.backendURL+'/chats/'+response.id+'/messages', newMessage, httpOptions).subscribe(
                              {
                                next: (response: any) => {
                                  console.log(response);
                                }
                              });
                          }
                        }
                      });
                  }
                }
              );
            }
            else {
              this.http.get(this.backendURL+'/chats', httpOptions).subscribe(
                {
                  next: (chats: any) => {
                    let client: any = response.filter((res: { name: string; }) => res.name == result.message.from.username);
                    chats = chats.filter((res: { client: number; }) => res.client == client[0].id);

                    this.http.get(this.backendURL+'/chats/'+chats[0].id+'/messages', httpOptions).subscribe(
                      {
                        next: (messages: any) => {
                          const lastMessageTimestamp = new Date(messages.messages[0].date).getTime() / 1000;
                          if (lastMessageTimestamp < result.message.date) {
                            const newMessage = {
                              message: result.message.text,
                              to_client: false,
                              date: new DatePipe('en-US').transform(new Date(result.message.date * 1000), 'yyyy-MM-dd HH:mm:ss.SSSSSSZ', '+0300')
                            }
                            this.http.post(this.backendURL+'/chats/'+chats[0].id+'/messages', newMessage, httpOptions).subscribe(
                            {
                              next: (response: any) => {
                                let data = {
                                  read: false
                                }
                                this.http.put(this.backendURL+'/chats/' + chats[0].id, data, httpOptions).subscribe(
                                  response => {
                                  }
                                )
                              }
                            });
                          }
                        }
                      }
                    )
                  }
                }
              );
            }
          }
        }
      }
    );
  }

  to_mess(id: any) {
    const url = this.backendURL+'/chats/' + id;
    let data = {
      read: true
    }
    this.http.put(url, data, httpOptions).subscribe(
      response => {
        this.router.navigate(['/messages/' + id]);
      }
    )
  }

  saveTelegramId() {
    if (this.telegramId != "") {
      const url = this.backendURL+'/accounts/' + localStorage.getItem('Id');
      const data = {
        apiKey: this.telegramId
      };
      this.http.put(url, data, httpOptions).subscribe(
        response => {
          window.location.reload();
        },
        error => {
          console.log(error);
        }
      )
    }
  }

  saveEmailId() {
    // if (this.emailId != "") {
    //   const url = this.backendURL+'/accounts/' + localStorage.getItem('Id');
    //   const data = {
    //     apiEmailKey: this.emailId
    //   };
    //   this.http.put(url, data, httpOptions).subscribe(
    //     response => {
    //       window.location.reload();
    //     },
    //     error => {
    //     }
    //   )
    // }
  }
}
