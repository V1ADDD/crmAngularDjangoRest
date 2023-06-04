import base64
from datetime import datetime

from rest_framework import authentication, exceptions
from crm.models import Account, Subscription


class Auth(authentication.BaseAuthentication):
    def authenticate(self, request):
        try:
            if 'HTTP_AUTHORIZATION' in request.META:
                auth = request.META['HTTP_AUTHORIZATION'].split()
                if len(auth) == 2 and auth[0].lower() == "basic":
                    login, password = str(base64.b64decode(auth[1])).split(':')
                    login = login[2::]
                    password = password[:-1]
                    try:
                        user = Account.objects.get(login=login, password=password)
                        if user is not None:
                            if not user.isadmin:
                                if user.sub.name != "ПРОБНАЯ":
                                    if user.sub_expires:
                                        if str(user.sub_expires)[:16] < str(datetime.now())[:16]:
                                            user.sub = Subscription.objects.get(id=1)
                                            user.save()
                            return (user, user)
                        raise exceptions.AuthenticationFailed('Ошибка')
                    except Account.DoesNotExist:
                        raise exceptions.AuthenticationFailed('Аккаунт не существует!')
        except:
            raise exceptions.AuthenticationFailed('Неизвестная ошибка аутентификации!')

    def authenticate_header(self, request):
        return '{"username" : <username>, "password" : <password>}'
