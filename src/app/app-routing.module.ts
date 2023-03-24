import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {IndexComponent} from "./index/index.component";
import {SigninComponent} from "./signin/signin.component";
import {SignupComponent} from "./signup/signup.component";
import {MenuComponent} from "./menu/menu.component";
import {MessagesComponent} from "./messages/messages.component";
import {MessageComponent} from "./message/message.component";
import {TodolistComponent} from "./todolist/todolist.component";
import {ProfileComponent} from "./profile/profile.component";
const routes: Routes = [
  {
    path: '',
    component: IndexComponent,
    title: 'CRM для бизнеса'
  },
  {
    path: 'signin',
    component: SigninComponent,
    title: 'Скорей войдите!'
  },
  {
    path: 'signup',
    component: SignupComponent,
    title: 'Скорей регистрируйтесь!'
  },
  {
    path: 'menu',
    component: MenuComponent,
    title: 'С чем работаем сегодня?'
  },
  {
    path: 'messages',
    component: MessagesComponent,
    title: 'Свяжитесь с клиентами!'
  },
  {
    path: 'messages/:id',
    component: MessageComponent,
    title: 'Свяжитесь с клиентами!'
  },
  {
    path: 'todolist',
    component: TodolistComponent,
    title: 'Выполняйте задачи!'
  },
  {
    path: 'profile',
    component: ProfileComponent,
    title: 'Профиль'
  }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
