import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IndexComponent } from './index/index.component';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';
import { MenuComponent } from './menu/menu.component';
import { MessagesComponent } from './messages/messages.component';
import { MessageComponent } from './message/message.component';
import { ProfileComponent } from './profile/profile.component';
import { TodolistComponent } from './todolist/todolist.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from "@angular/common/http";
import { OrdersComponent } from './orders/orders.component';
import { CalendarComponent } from './calendar/calendar.component';
import { MarketingComponent } from './marketing/marketing.component';
import { ApiComponent } from './api/api.component';
@NgModule({
  declarations: [
    AppComponent,
    IndexComponent,
    SigninComponent,
    SignupComponent,
    MenuComponent,
    MessagesComponent,
    MessageComponent,
    ProfileComponent,
    TodolistComponent,
    OrdersComponent,
    CalendarComponent,
    MarketingComponent,
    ApiComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
