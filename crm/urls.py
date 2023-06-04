from rest_framework import routers
from .api import AccountViewSet, SubsViewSet, ClientsViewSet, ChatsViewSet, OrdersViewSet, TasksViewSet

router = routers.DefaultRouter(trailing_slash=False)
router.register('accounts', AccountViewSet, 'accounts')
router.register('subscriptions', SubsViewSet, 'subs')
router.register('clients', ClientsViewSet, 'clients')
router.register('chats', ChatsViewSet, 'chats')
router.register('tasks', TasksViewSet, 'tasks')
router.register('orders', OrdersViewSet, 'orders')
urlpatterns = router.urls