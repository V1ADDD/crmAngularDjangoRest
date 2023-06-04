import {Component} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {httpOptions} from "../app.component";
import * as moment from "moment/moment";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent {
  orders: any;
  client = new FormControl();
  backendURL: string = 'https://crmdiplom.pythonanywhere.com';
  // backendURL: string = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {
    if ('Authorization' in localStorage) {
      httpOptions.headers = new HttpHeaders({'Authorization': <string>localStorage.getItem('Authorization')});
      this.http.get(this.backendURL+'/accounts/' + localStorage.getItem('Id'), httpOptions).subscribe(
        {
          next: (response: any) => {
            let user = response;
            this.route.queryParams.subscribe(params => {
              if (Object.keys(params).length !== 0) {
                let form = <HTMLFormElement>document.getElementById('add_order');
                form.style.display = 'block';
                this.client.setValue(params['client']);
              }
            });
            if (user.sub == 1) {
              if (!user.isadmin) {
                alert("Для доступа к данному разделу, нужна подписка уровня ТЕЛЕГРАМ и выше.")
                router.navigate(['/menu']);
              }
            }
          }
        });
      this.http.get(this.backendURL+'/orders', httpOptions).subscribe(
        {
          next: (response: any) => {
            this.orders = response.orders;
            for (let order of this.orders) {
              this.http.get(this.backendURL+'/clients/' + order.client, httpOptions).subscribe(
                {
                  next: (response: any) => {
                    order.clientname = response.name;
                  }
                }
              );
              order.postdate = moment(order.postdate).format('M.DD.YYYY / H:mm:ss')
            }
          }
        }
      );
    } else
      this.router.navigate(['/signin']);
  }

  add_order() {
    let form = <HTMLFormElement>document.getElementById('add_order');
    if (form.style.display === 'none')
      form.style.display = 'block';
    else
      form.style.display = 'none';
  }

  order_open(id: string) {
    let descr = <HTMLDivElement>document.getElementById('desc' + id);
    if (descr.style.display === 'none')
      descr.style.display = 'block';
    else
      descr.style.display = 'none';
  }

  update_status(id: string) {
    const url = this.backendURL+'/orders/' + id;
    let data = {}
    this.http.put(url, data, httpOptions).subscribe(
      response => {
        this.http.get(this.backendURL+'/orders', httpOptions).subscribe(
          {
            next: (response: any) => {
              this.orders = response.orders;
              for (let order of this.orders) {
                this.http.get(this.backendURL+'/clients/' + order.client, httpOptions).subscribe(
                  {
                    next: (response: any) => {
                      order.clientname = response.name;
                    }
                  }
                );
                order.postdate = moment(order.postdate).format('M.DD.YYYY / H:mm:ss')
              }
            }
          }
        );
      }
    )
  }

  new_order(form_add: any, ev: any) {
    ev.preventDefault();
    const url = this.backendURL+'/clients';
    let clientId: number = -1;
    this.http.get(url, httpOptions).subscribe(
      {
        next: (response: any) => {
          const clients = response.filter((client: { name: string; }) => client.name == this.client.value);
          clientId = clients[0].id;
          if (clientId == -1) {
            const clientinfo = {
              name: form_add.client.value,
              account: localStorage.getItem('Id')
            }
            this.http.post(url, clientinfo, httpOptions).subscribe(
              {
                next: (response: any) => {
                  const orderinfo = {
                    name: form_add.name.value,
                    desc: form_add.desc.value,
                    client: response.id
                  };
                  const url2 = this.backendURL + '/orders';
                  this.http.post(url2, orderinfo, httpOptions).subscribe(
                    {
                      next: (response: any) => {
                        this.http.get(this.backendURL+'/orders', httpOptions).subscribe(
                          {
                            next: (response: any) => {
                              this.orders = response.orders;
                              for (let order of this.orders) {
                                this.http.get(this.backendURL+'/clients/' + order.client, httpOptions).subscribe(
                                  {
                                    next: (response: any) => {
                                      order.clientname = response.name;
                                    }
                                  }
                                );
                                order.postdate = moment(order.postdate).format('M.DD.YYYY / H:mm:ss')
                              }
                              form_add.reset();
                              form_add.style.display = 'none';
                            }
                          }
                        );
                      }
                    }
                  )
                }
              }
            );
          } else {
            const orderinfo = {
              name: form_add.name.value,
              desc: form_add.desc.value,
              client: clientId
            };
            const url2 = this.backendURL + '/orders';
            this.http.post(url2, orderinfo, httpOptions).subscribe(
              {
                next: (response: any) => {
                  this.http.get(this.backendURL+'/orders', httpOptions).subscribe(
                    {
                      next: (response: any) => {
                        this.orders = response.orders;
                        for (let order of this.orders) {
                          this.http.get(this.backendURL+'/clients/' + order.client, httpOptions).subscribe(
                            {
                              next: (response: any) => {
                                order.clientname = response.name;
                              }
                            }
                          );
                          order.postdate = moment(order.postdate).format('M.DD.YYYY / H:mm:ss')
                        }
                        form_add.reset();
                        form_add.style.display = 'none';
                      }
                    }
                  );
                }
              }
            )
          }
        }
      }
    )

  }
}
