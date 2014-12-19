from django.conf.urls import patterns, include, url
from django.contrib import admin
from gstorm.main import views

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'gstorm.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
    url(r'^edit/', views.SingleGraphView.as_view(), name='single-graph'),
    url(r'^/', views.CreateGraphView.as_view(), name='add-graph-index'),
    url(r'^add/', views.CreateGraphView.as_view(), name='add-graph')
)
