from datetime import datetime
from itertools import chain
from django.http import JsonResponse
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from crm.api_authenticate import Auth
from crm.models import Account, Subscription, Clients, Chats, Messages, Orders, Tasks
from crm.serializers import AccountSerializer, SubscriptionSerializer, ClientsSerializer, ChatsSerializer, \
    OrdersSerializer, TasksSerializer


def to_dict(instance):
    opts = instance._meta
    data = {}
    for f in chain(opts.concrete_fields, opts.private_fields):
        if f.name != 'password':
            data[f.name] = f.value_from_object(instance)
    for f in opts.many_to_many:
        data[f.name] = [i.id for i in f.value_from_object(instance)]
    return data


class AccountViewSet(viewsets.ModelViewSet):
    # authentication_classes = (Auth,)
    queryset = Account.objects.all()
    permission_classes = [
        permissions.AllowAny
    ]
    serializer_class = AccountSerializer

    def list(self, request, *args, **kwargs):
        user = Auth().authenticate(request)[0]
        if type(user) != Exception:
            response = {
                'id': user.id,
                'users': [to_dict(x) for x in Account.objects.all()]
            }
            return JsonResponse(response, status=200)
        else:
            return JsonResponse({"Authentication failed": "401"}, safe=False, status=401)

    def retrieve(self, request, pk):
        user = Auth().authenticate(request)[0]
        if type(user) != Exception:
            if user.isadmin and pk == 'search':
                search = self.request.query_params.get('find')
                list = []
                for account in Account.objects.all():
                    if search.lower() in account.login.lower():
                        list.append(to_dict(account))
                return JsonResponse(list, safe=False, status=200)
            return super().retrieve(request, pk)
        else:
            return JsonResponse({"Authentication failed": "401"}, safe=False, status=401)

    def update(self, request, pk):
        user = Account.objects.get(id=pk)
        if 'login' not in request.data:
            request.data['login'] = user.login
        if 'FIO' not in request.data:
            request.data['FIO'] = user.FIO
        if 'sub' not in request.data:
            request.data['sub'] = user.sub.id
        if 'email' not in request.data:
            request.data['email'] = user.email
        if 'phone' not in request.data:
            request.data['phone'] = user.phone
        if 'password' not in request.data:
            request.data['password'] = user.password
        if 'isadmin' not in request.data:
            request.data['isadmin'] = user.isadmin
        if 'sub_expires' not in request.data:
            request.data['sub_expires'] = user.sub_expires
        return super().update(request, pk)


class SubsViewSet(viewsets.ModelViewSet):
    authentication_classes = (Auth,)
    queryset = Subscription.objects.all()
    permission_classes = [
        permissions.AllowAny
    ]
    serializer_class = SubscriptionSerializer


class ClientsViewSet(viewsets.ModelViewSet):
    authentication_classes = (Auth,)
    queryset = Clients.objects.all()
    permission_classes = [
        permissions.AllowAny
    ]
    serializer_class = ClientsSerializer

    def list(self, request):
        clients = [to_dict(client) for client in Clients.objects.filter(account=request.user)]
        return JsonResponse(clients, safe=False, status=200)


class ChatsViewSet(viewsets.ModelViewSet):
    authentication_classes = (Auth,)
    queryset = Chats.objects.all()
    permission_classes = [
        permissions.AllowAny
    ]
    serializer_class = ChatsSerializer

    def list(self, request):
        chats = [to_dict(chat) for chat in Chats.objects.filter(user=request.user)]
        return JsonResponse(chats, safe=False, status=200)

    def update(self, request, pk):
        chat = Chats.objects.get(id=pk)
        if 'socnet' not in request.data:
            request.data['socnet'] = chat.socnet
        if 'user' not in request.data:
            request.data['user'] = chat.user.id
        if 'client' not in request.data:
            request.data['client'] = chat.client.id
        if 'read' not in request.data:
            request.data['read'] = chat.read
        if 'date_begin' not in request.data:
            request.data['date_begin'] = chat.date_begin
        return super().update(request, pk)

    @action(methods=['get', 'post'], detail=True, url_path='messages')
    def messages(self, request, pk):
        if request.method == 'GET':
            response = {
                'messages': [to_dict(x) for x in Messages.objects.filter(chat_id=int(pk))]
            }
            return JsonResponse(response, status=200)
        elif request.method == 'POST':
            newMessage = Messages(
                chat=Chats.objects.get(id=int(pk)),
                message=request.data.get('message')
            )
            if 'to_client' in request.data:
                newMessage.to_client = request.data.get('to_client')
            if 'date' in request.data:
                newMessage.date = request.data.get('date')
            newMessage.save()
            return JsonResponse(to_dict(newMessage), status=201)

    @action(methods=['get', 'delete'], detail=True, url_path='message/(?P<messageId>[^/.]+)')
    def message(self, request, pk, messageId):
        if request.method == 'GET':
            return JsonResponse(to_dict(Messages.objects.get(id=int(messageId))), status=200)
        elif request.method == 'DELETE':
            Messages.objects.get(id=messageId).delete()
            return JsonResponse({}, status=200)


class OrdersViewSet(viewsets.ModelViewSet):
    authentication_classes = (Auth,)
    queryset = Orders.objects.all()
    permission_classes = [
        permissions.AllowAny
    ]
    serializer_class = OrdersSerializer

    def list(self, request):
        orders = [to_dict(order) for order in Orders.objects.filter(user=request.user)]
        choices = ['Заказано', 'Принято', 'Сделано', 'Отправлено', 'Доставлено', 'Оплачено']
        orders = sorted(orders, key=lambda obj: choices.index(obj['status']) == len(choices) - 1)
        return JsonResponse({'orders': orders}, status=200)

    def create(self, request):
        newOrder = Orders(
            user=request.user,
            name=request.data.get('name'),
            desc=request.data.get('desc'),
            client=Clients.objects.get(id=int(request.data.get('client')))
        )
        newOrder.save()
        return JsonResponse(to_dict(newOrder), status=201)

    def update(self, request, pk):
        newOrder = Orders.objects.get(id=int(pk))
        choices = ['Заказано', 'Принято', 'Сделано', 'Отправлено', 'Доставлено', 'Оплачено']
        if choices.index(newOrder.status) != len(choices) - 1:
            newOrder.status = choices[choices.index(newOrder.status) + 1]
        newOrder.save()
        return JsonResponse(to_dict(newOrder), status=200)


class TasksViewSet(viewsets.ModelViewSet):
    authentication_classes = (Auth,)
    queryset = Tasks.objects.all()
    permission_classes = [
        permissions.AllowAny
    ]
    serializer_class = TasksSerializer

    def create(self, request):
        newTask = Tasks(
            user=request.user,
            name=request.data.get('name'),
            desc=request.data.get('desc'),
            deadline=request.data.get('deadline')
        )
        newTask.save()
        return JsonResponse(to_dict(newTask), status=201)

    def list(self, request):
        tasks = [to_dict(task) for task in Tasks.objects.filter(user=request.user)]
        for task in tasks:
            task['deadline'] = int(
                (datetime.fromisoformat(str(task['deadline'])).timestamp() - datetime.now().timestamp()) / 86400)
        return JsonResponse({'tasks': tasks}, status=200)

    def update(self, request, pk):
        task = Tasks.objects.get(id=pk)
        if 'name' not in request.data:
            request.data['name'] = task.name
        if 'user' not in request.data:
            request.data['user'] = task.user.id
        if 'desc' not in request.data:
            request.data['desc'] = task.desc
        if 'status' not in request.data:
            request.data['status'] = task.status
        if 'deadline' not in request.data:
            request.data['deadline'] = task.deadline
        return super().update(request, pk)
