import matplotlib.pyplot as plt
import numpy as np
from shapely import geometry
import fiona
import os
from descartes import PolygonPatch
import geopandas as gpd
import json
import time

# https://www.geeksforgeeks.org/how-to-measure-elapsed-time-in-python/
start = time.time()
fileResXY = open("../../../public/Data/nice1_resultat.json", 'r')
dataResXY = json.load(fileResXY)
# nx & ny
LEN_ROW = len(dataResXY)
LEN_COL = len(dataResXY[0])

print(LEN_ROW, LEN_COL)
# Des matrices de zéro
X = np.zeros((LEN_ROW, LEN_COL))
Y = np.zeros((LEN_ROW, LEN_COL))
Z = np.zeros((LEN_ROW, LEN_COL))
for i in range(LEN_ROW):
    for j in range(LEN_COL):
        X[i][j] = dataResXY[i][j][0]
        Y[i][j] = dataResXY[i][j][1]
        Z[i][j] = dataResXY[i][j][2]

print("Max of Z : ", np.max(Z))
levels = np.arange(0, np.max(Z), 5)
cs = plt.contour(X, Y, Z, levels=levels)
# create lookup table for levels
lvl_lookup = dict(zip(cs.collections, cs.levels))

# loop over collections (and polygons in each collection), store in list for fiona
PolyList = []

# print(cs.levels)
# print(cs.collections)
for col in cs.collections:
    z = lvl_lookup[col]  # the value of this level
    # Loop through all polygons that have the same intensity level
    for contour_path in col.get_paths():
        # Create the polygon for this intensity level
        # The first polygon in the path is the main one, the following ones are "holes"
        for ncp, cp in enumerate(contour_path.to_polygons()):
            # print(len(cp))

            new_shape = geometry.Polygon([(i[0], i[1]) for i in cp])
            if ncp == 0:
                poly = new_shape  # first shape
            else:
                # Remove the holes if there are any
                poly = poly.difference(new_shape)  # Remove the holes
                # Can also be left out if you want to include all rings
            PolyList.append({'poly': poly, 'props': {'z': z}})

# print(PolyList)
# do something with polygon
# outname = "C:/Users/marti/Documents/PS2F/python"
outname = "../../../public/Data/geoData/"
outfi = os.path.join(outname, 'shaped_contour.shp')
# outfi = outname + 'shaped_contour3.shp'
schema = {'geometry': 'Polygon', 'properties': {'z': 'float'}}

with fiona.open(outfi, mode='w', driver="ESRI Shapefile", schema=schema) as output:
    for p in PolyList:
        output.write({'properties': p['props'],
                      'geometry': geometry.mapping(p['poly'])})

# Convert shapefile to GeoJson
myshpfile = gpd.read_file(outfi)
gdf = gpd.GeoDataFrame(myshpfile, crs=2154)
gdf = gdf.to_crs(4326)
outjson = os.path.join(outname, 'converted.geojson')
gdf.to_file(outjson, driver='GeoJSON')
end = time.time()
print(end - start)
# outjson = os.path.join(outname, 'converted.geojson')
# myshpfile.to_file(outjson, driver='GeoJSON')
