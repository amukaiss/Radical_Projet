import matplotlib.pyplot as plt
import numpy as np
from shapely import geometry
import fiona
import os
from descartes import PolygonPatch
import geopandas as gpd
import sys
import json
from readJson import *


def generate_shape_file(project_name, resultat_path,  id_project):
    fileResXY = open(resultat_path, 'r')
    dataResXY = json.load(fileResXY)
    # nx & ny
    LEN_ROW = len(dataResXY)
    LEN_COL = len(dataResXY[0])

    # print(LEN_ROW, LEN_COL)
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

    # do something with polygon

    pwd = f"../files/tmp/{id_project}/"
    dest = os.path.join(os.getcwd(), pwd, 'shaped_contour.shp')
    schema = {'geometry': 'Polygon', 'properties': {'z': 'float'}}

    with fiona.open(dest, mode='w', driver="ESRI Shapefile", schema=schema) as output:
        for p in PolyList:
            output.write({'properties': p['props'],
                          'geometry': geometry.mapping(p['poly'])})

        # call function to convert shape file to geojson data
    shape_to_geojson(dest, pwd, project_name)


def shape_to_geojson(dest, pwd, project_name):
    # Convert to GEOJson
    myshpfile = gpd.read_file(dest)
    gdf = gpd.GeoDataFrame(myshpfile)
    gdf.set_crs(epsg=2154, inplace=True)
    gdf = gdf.to_crs(4326)
    outjson = os.path.join(os.getcwd(), pwd, f'{project_name}_converted.geojson')
    gdf.to_file(outjson, driver='GeoJSON')


if __name__ == '__main__':
    project_name = sys.argv[1]
    resultat_path = sys.argv[2]
    id_project = sys.argv[3]

    n = len(sys.argv)
    print("Arguments passed: ", end=" ")
    for i in range(1, n):
        print(sys.argv[i], end=" ")

    generate_shape_file(project_name, resultat_path,  id_project)
