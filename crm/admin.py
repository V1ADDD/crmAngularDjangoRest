from django.contrib import admin

from crm.models import Subscription, Account, Clients, Orders, Tasks, Chats, Messages

# Register your models here.
admin.site.register(Subscription)
admin.site.register(Account)
admin.site.register(Clients)
admin.site.register(Orders)
admin.site.register(Tasks)
admin.site.register(Chats)
admin.site.register(Messages)