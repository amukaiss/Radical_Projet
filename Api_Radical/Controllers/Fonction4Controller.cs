using ApiTest01.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Numerics;

namespace ApiTest01.Controllers
{
    /// <summary>
    /// The fonction4 controller.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class Fonction4Controller : Controller
    {

        /// <summary>
        /// Post a list of list of list of double.
        /// </summary>
        /// <param name="mnt_file">The mnt file.</param>
        /// <param name="rect_file">The rect file.</param>
        /// <param name="front_file">The front file.</param>
        /// <param name="flamme_file">The flamme file.</param>
        /// <param name="humi">The humi.</param>
        /// <param name="vent_force">The vent force.</param>
        /// <param name="vent_direction">The vent direction.</param>
        /// <returns><![CDATA[A List<List<List<Double>>>.]]></returns>
        [HttpPost]
        public List<List<List<Double>>> Post(string mnt_file, string rect_file, string front_file, string flamme_file,
        double humi, double vent_force, double vent_direction)
        // public IEnumerable<Angles> Post(string mnt_file, string rect_file, string front_file, string flamme_file,
        //      double humi, double vent_force, double vent_direction)
        {
            // Measure calculation's time
            var watch = System.Diagnostics.Stopwatch.StartNew();

            Console.WriteLine("\nCalculating...");
            Fonction1 f1 = new Fonction1();
            Fonction2 f2 = new Fonction2();
            Fonction3 f3 = new Fonction3();
            ReadFile r = new ReadFile();
            double diametre = 2.5;
            double rayon = diametre / 2;
            double pas_mesh = 1.0;
            (double[] xmnt, double[] ymnt, Double[,] zmnt, double cellsize) = r.lecture_grosfichier(mnt_file, rect_file);
            Console.WriteLine("\tLecture fichiers...");
            Console.WriteLine("\tConstruction: Maillage du domaine...");
            (Double[,] X, Double[,] Y) = f1.Maillage_Domaine_Carre(rect_file, xmnt, ymnt, pas_mesh);
           
            int nx = X.GetLength(1);int ny = X.GetLength(0);
            Console.WriteLine("\tCalcul : Elevation du maillage domaine...");
            double[,] Z = f1.Elevation_Domaine(X, Y, xmnt, ymnt, zmnt, cellsize);
            Console.WriteLine("\tConstruction : Maillage du front...");
            (List<double> xf, List<double> yf, List<double> zf, List<int> oc,float[,] normalf, int[,] dansFeu, int[,] numMesh)
            = f2.Maillage_Front(front_file, X, Y, Z, xmnt, ymnt, zmnt, cellsize, diametre);
                                   
            Console.WriteLine("\tLecture : fichier de flamme...");
            double[,] list = r.readFlamme(flamme_file);
            List<double> lLfl = new List<double>();
            List<double> lPouvoir = new List<double>();
            List<double> lRayon = new List<double>();

            for (int i = 0; i < oc.Count; i++)
            {
                for (int j = 0; j < list.GetLength(0); j++)
                {
                    if (oc[i] == list[j, 0])
                    {
                        lLfl.Add(list[j, 2]);
                        lPouvoir.Add(list[j, 1]);
                        lRayon.Add(list[j, 4]);
                    }
                }
            }
            // TO REVIEW
            int nIso = 20;
            double[,] bdata = new double[nIso, 4];
            double[,] resultat = new double[ny * nx, 3];
            double[,] prad = new double[ny, nx];
            double[] tab = new double[2];
            int k = 0;

            for (int j = 0; j < ny; j++)
            {
                for (int i = 0; i < nx; i++)
                {
                    prad[j, i] = 0;
                    tab = r.Lambert93ToWGS84(X[j, i], Y[j, i]);
                    resultat[k, 0] = X[j, i];
                    resultat[k, 1] = Y[j, i];
                    resultat[k, 2] = 0;
                    k++;
                }
            }
            //StreamWriter sw = new StreamWriter("resultat.dat");
            // Boucle sur les sites en feu
            Console.WriteLine("\tGathering data from database...");
            List<BsonDocument> docs = new List<BsonDocument>();
            for (int index = 0; index < xf.Count; index++)
            //for (int index = 0; index < 5; index++)
            {
                double[] inc = f3.Angle_direction_ellipse(lLfl[index], vent_force, vent_direction,
                (new Vector3(normalf[index, 0], normalf[index, 1], normalf[index, 2])));
                int[] voisins = f3.Voisinage_ifeu(index, xf[index], yf[index], nx, ny, 
                dansFeu, numMesh, rayon, prad, lPouvoir[index], X, Y);
                

                var angle = inc[0] * 180 / Math.PI;
                var teta= inc[1] * 180 / Math.PI;
                double angle_degre = Math.Min(angle, 65);              
                docs = f3.Chercher2((int)lLfl[index], lRayon[index], (int)(angle_degre), humi);
                
                try
                {
                    foreach (BsonDocument doc in docs)
                    {

                        string json = doc.ToString();
                                                                           
                        var myJsonObject = JsonConvert.DeserializeObject<Models.Abaque>(json);
                        for (int i = 0; i < nIso; i++)
                        {
                                                                 
                            bdata[i, 0] = myJsonObject.ISOFLUX[i][0].iso;
                            bdata[i, 1] = myJsonObject.ISOFLUX[i][0].Ellipse[0];
                            bdata[i, 2] = myJsonObject.ISOFLUX[i][0].Ellipse[1];
                            bdata[i, 3] = myJsonObject.ISOFLUX[i][0].Ellipse[2];
                        }

                        prad = f3.Calcul_isoflux(xf[index], yf[index], lPouvoir[index], ny, nx,
                            X, Y, inc[1], bdata, diametre, voisins, prad);

                    }

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);                                                            
                }
            }
            int m = 0;
            for (int j = 0; j < X.GetLength(0); j++)
            {
                for (int i = 0; i < X.GetLength(1); i++)
                {
                    resultat[m, 2] = prad[j, i];
                    m++;
                }
            }
            //sw.WriteLine("TITLE=\"CARRE\"");
            //sw.WriteLine("VARIABLES = \"X\", \"Y\",\"Z\", \"FLUX\"");
            //sw.WriteLine("ZONE I= {0} J={1}  F=POINT", X.GetLength(1), X.GetLength(0));
            double[,,] resXY = new double[X.GetLength(0), X.GetLength(1), 3];
            k = 0;
            for (int i = 0; i < X.GetLength(0); i++)
            {
                for (int j = 0; j < X.GetLength(1); j++)
                {
                    resXY[i, j, 0] = X[i, j];
                    resXY[i, j, 1] = Y[i, j];
                    resXY[i, j, 2] = resultat[k, 2];
                    //sw.WriteLine("{0:F2}   {1:F2}   {2:F2}  {3:F2} ", resXY[i, j, 0], resXY[i, j, 1], Z[i, j], resXY[i, j, 2]);
                    k++;
                }
            }
            //sw.Close();
            double[][] re = r.ConvertToJaggedArray(resultat);

            var list3D = resXY.Cast<double>().Select((v, n) => new
            {
                x = n / (resXY.GetLength(2) * resXY.GetLength(1)),
                y = (n / resXY.GetLength(2)) % resXY.GetLength(1),
                value = v,
            })
            .GroupBy(q => q.x)
            .Select(q => q.GroupBy(w => w.y, w => w.value)
            .Select(e => e.ToList())
            .ToList())
            .ToList();


            watch.Stop();
            var elapsedMs = watch.ElapsedMilliseconds;
            Console.WriteLine("Done!\n***\nCalculation took " + elapsedMs + " ms.");
            return list3D;
        }
    }
}

