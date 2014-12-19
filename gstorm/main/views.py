from django.views.generic import View
from django.shortcuts import render
from gstorm.main.models import Graph
from django.http import HttpResponse
import json

# Create your views here.
class SingleGraphView(View):
    
    def get(self, request, *args, **kwargs):
        
        graph = Graph.objects.get(id=request.GET['id'])
        return render(request, "index.html", {"graph_string": graph.graph_string, "id": graph.id})
    
    def post(self, request, *args, **kwargs):
        id = request.POST['id'] # id of the graph you are updating
        graph_string = request.POST['graph_string'] # the graph_string you will be updating
        graph = Graph.objects.get(id=id)
        graph.graph_string = graph_string
        graph.save()
        return HttpResponse(graph.graph_string, content_type="application/json")

class CreateGraphView(View):
    
    def post(self, request, *args, **kwargs):
        g = Graph()
        title = request.POST['title']
        g.graph_string = '{\"ideas\": [], \"links\": []}';
        g.title = title
        g.save()
        data = json.dumps({"id": g.id})
        return HttpResponse(data, content_type="application/json")
    
    def get(self, request, *args, **kwargs):
        graphs = Graph.objects.filter()
        return render(request, "create.html", {"graphs": graphs})
