from django.db import models

# Create your models here.
class Graph(models.Model):
    
    graph_string = models.TextField()
    title = models.TextField()
