using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Newtonsoft.Json;
using ApiTest01.Models;
using System.Numerics;

namespace ApiTest01.Services
{
    /// <summary>
    /// The fonction2.
    /// </summary>
    public class Fonction2
    {

        /// <summary>
        /// Maillages the front.
        /// </summary>
        /// 
        /// <param name="path">The path.</param>
        /// <param name="X">The X.</param>
        /// <param name="Y">The Y.</param>
        /// <param name="Z">The Z.</param>
        /// <param name="xmnt">The xmnt.</param>
        /// <param name="ymnt">The ymnt.</param>
        /// <param name="zmnt">The zmnt.</param>
        /// <param name="cellsize">The cellsize.</param>
        /// <param name="diametre">The diametre.</param>
        /// <returns><![CDATA[A (List<double>, List<double>, List<double>, List<integer>, float[,], integer[,], integer[,]).]]></returns>
        public (List<double>, List<double>, List<double>, List<int>, float[,], int[,], int[,]) Maillage_Front(string path,
                                    double[,] X, double[,] Y, double[,] Z, double[] xmnt, double[] ymnt, double[,] zmnt,
                                    double cellsize, double diametre)
        {


            (List<int> lp, List<double> lx, List<double> ly) = LectureJsonOrder(path);
            int nf = lx.Count;
            double rayon = diametre / 2;
            int nx = X.GetLength(1); int ny = X.GetLength(0);
            List<double> xf = new List<double>();
            List<double> yf = new List<double>();
            List<double> zf = new List<double>();
            List<int> frontfeu = new List<int>();
            List<int> oc = new List<int>();
            int[,] dansFeu = new int[ny, nx];
            int[,] numMesh = new int[ny, nx];

            for (int j = 0; j < ny; j++)
            {
                for (int i = 0; i < nx; i++)
                {
                    dansFeu[j, i] = 0;
                    numMesh[j, i] = i + j * nx;
                }
            }

            double pas_mesh = X[0, 1] - X[0, 0];
            double x0 = lx[0]; double y0 = ly[0];
            Console.WriteLine(String.Format(" Pas de maillage {0:F2}   ", pas_mesh));
            
            for (int l = 0; l < nf - 1; l++)
            {
                double dis = Math.Sqrt(Math.Pow(x0 - lx[l + 1], 2) +
                                       Math.Pow(y0 - ly[l + 1], 2));
                
                int nd = (int)Math.Round(dis / (2 * rayon));
                if (nd > 1)
                {
                    double xpas = (lx[l + 1] - x0) / (nd - 1);
                    double ypas = (ly[l + 1] - y0) / (nd - 1);

                    for (int k = 0; k < nd; k++)
                    {

                        double xk = x0 + xpas;
                        double yk = y0 + ypas;
                        xf.Add(xk); yf.Add(yk);
                        int ix = (int)Math.Floor((xk - X[0, 0]) / pas_mesh);
                        int jy = (int)Math.Floor((yk - Y[0, 0]) / pas_mesh);

                        double alpha = (xk - X[jy, ix]) / ((X[jy, ix + 1] - X[jy, ix]));
                        double beta = (yk - Y[jy, ix]) / ((Y[jy + 1, ix] - Y[jy, ix]));
                        double zk = (1 - alpha) * ((1 - beta) * Z[jy, ix] + beta * Z[jy + 1, ix]) +
                                           alpha * ((1 - beta) * Z[jy, ix + 1] + beta * Z[jy + 1, ix + 1]);
                        zf.Add(zk);
                        oc.Add(lp[l]);

                        x0 = xk; y0 = yk;
                    }
                }
            }

            float[,] normalf = new float[xf.Count(), 3];
            Vector3 u = new Vector3();
            Vector3 v = new Vector3();
            Vector3 w = new Vector3();

            for (int k = 0; k < xf.Count(); k++)
            {
                int ix = (int)Math.Floor((xf[k] - xmnt[0]) / cellsize);
                int jy = (int)Math.Floor((yf[k] - ymnt[0]) / cellsize);
                u.X = (float)(xmnt[ix + 1] - xmnt[ix]); u.Y = 0; u.Z = (float)(zmnt[jy, ix + 1] - zmnt[jy, ix]);
                u = Vector3.Normalize(u);
                v.X = 0; v.Y = (float)(ymnt[jy + 1] - ymnt[jy]); v.Z = (float)(zmnt[jy + 1, ix] - zmnt[jy, ix]);
                v = Vector3.Normalize(v);
                w = Vector3.Cross(u, v);
                normalf[k, 0] = w.X; normalf[k, 1] = w.Y; normalf[k, 2] = w.Z;


            }

            return (xf, yf, zf, oc, normalf, dansFeu, numMesh);
        }

        /// <summary>
        /// Lecture du front de feu sous json
        /// </summary>
        /// <param name="path">Arborescence du fichier json. </param>
        /// <returns>Trois listes : une des entiers (NIV3) et deux des réels (x et y).</returns>
        public (List<int>, List<double>, List<double>) jsonFront(string path)
        {
            ReadFile rf = new ReadFile();
            using (StreamReader r = new StreamReader(path))
            {
                string json = r.ReadToEnd();
                var myJsonObject = JsonConvert.DeserializeObject<FrontJson>(json);
                int nb = myJsonObject.features.Length;

                List<int> lp = new List<int>();
                List<double> lx = new List<double>();
                List<double> ly = new List<double>();
                int t = 0;
                double[] tab = new double[2];
                for (int k = 0; k < nb; k++)
                {
                    t = myJsonObject.features[k].geometry.coordinates.Length;
                    for (int i = 0; i < (t / 2) - 1; i++)
                    {
                        tab = rf.WGS84ToLambert93(myJsonObject.features[k].geometry.coordinates[i, 0],
                                                         myJsonObject.features[k].geometry.coordinates[i, 1]);
                        lx.Add(tab[0]);
                        ly.Add(tab[1]);
                        lp.Add(myJsonObject.features[k].properties.NIV3_14);

                    }
                }
                tab = rf.WGS84ToLambert93(myJsonObject.features[nb - 1].geometry.coordinates[(t / 2) - 1, 0],
                                                        myJsonObject.features[nb - 1].geometry.coordinates[(t / 2) - 1, 1]);
                lx.Add(tab[0]);
                ly.Add(tab[1]);


                lp.Add(myJsonObject.features[nb - 1].properties.NIV3_14);

                return (lp, lx, ly);
            }
        }


        /// <summary>
        /// Calcul de l'elevation (Z) de chaque site du front du feu.
        /// </summary>
        /// 
        /// <param name="xf"> Coordonnée x du site en feu.</param>
        /// <param name="yf"> Coordonnée y du site en feu.</param>
        /// <param name="xmnt">Tableau des X du modèle numérique de terrain.</param>
        /// <param name="ymnt">Tableau des Y du modèle numérique de terrain.</param>
        /// <param name="zmnt">Tableau des Z du modèle numérique de terrain.</param>
        /// <param name="cellsize"> Pas de résolution de MNT. </param>
        /// <returns> Premier tableau contenant les z de tous les sites en feu. Le second est tableau de deux dimensions, contenant les normales des sites en feu.</returns>
        public (double[], float[,]) Elevation_Front(List<double> xf, List<double> yf, double[] xmnt, double[] ymnt, double[,] zmnt, double cellsize)
        {
            double[] zf = new double[xf.Count()];
            float[,] normalf = new float[xf.Count(), 3];
            Vector3 u = new Vector3();
            Vector3 v = new Vector3();
            Vector3 w = new Vector3();
            for (int k = 0; k < xf.Count(); k++)
            {
                int ix = (int)Math.Floor((xf[k] - xmnt[0]) / cellsize);
                int jy = (int)Math.Floor((yf[k] - ymnt[0]) / cellsize);
                var a = (xf[k] - xmnt[ix]) / cellsize;
                var b = (yf[k] - ymnt[jy]) / cellsize;
                zf[k] = (1 - a) * ((1 - b) * zmnt[jy, ix] + b * zmnt[jy + 1, ix]) + a * ((1 - b) * zmnt[jy, ix + 1] + b * zmnt[jy + 1, ix + 1]);
                u.X = (float)(xmnt[ix + 1] - xmnt[ix]); u.Y = 0; u.Z = (float)(zmnt[jy, ix + 1] - zmnt[jy, ix]);
                u = Vector3.Normalize(u);
                v.X = 0; v.Y = (float)(ymnt[jy + 1] - ymnt[jy]); v.Z = (float)(zmnt[jy + 1, ix] - zmnt[jy, ix]);
                v = Vector3.Normalize(v);
                w = Vector3.Cross(u, v);
                normalf[k, 0] = w.X; normalf[k, 1] = w.Y; normalf[k, 2] = w.Z;
            }
            return (zf, normalf);
        }


        /// <summary>
        /// Lecture du fichier json avec format "Order"
        /// </summary>
        /// <param name="path">Arborescence du fichier json.</param>
        /// <returns>Trois listes : une des entiers (NIV3) et deux des réels (x et y).</returns>
        public (List<int>, List<double>, List<double>) LectureJsonOrder(string path)
        {
            ReadFile rf = new ReadFile();
            List<DynamicFront> li = frontJson2(path);
            List<double> lx = new List<double>();
            List<double> ly = new List<double>();
            List<double> lx1 = new List<double>();
            List<double> ly1 = new List<double>();
            List<double> lx2 = new List<double>();
            List<double> ly2 = new List<double>();
            List<int> lp = new List<int>();
            for (int i = 0; i < li.Count(); i++)
            {
                string chaine = li[i].coordinates;
                if (li[i].type == "MultiLineString")
                {
                    (List<int> oc, List<double> xf1, List<double> yf1) = Multifront(chaine);
                    for (int o = 0; o < xf1.Count(); o++)
                    {
                        lx1.Add(xf1[o]);
                        ly1.Add(yf1[o]);
                    }
                }
                else
                {
                    (List<int> oc, List<double> xf1, List<double> yf1, List<double> xf2, List<double> yf2) = Linefront(chaine);
                    for (int o = 0; o < xf1.Count(); o++)
                    {
                        lx1.Add(xf1[o]);
                        ly1.Add(yf1[o]);
                        lx2.Add(xf2[o]);
                        ly2.Add(yf2[o]);
                        lp.Add(oc[o]);
                    }
                }

            }
            for (int i = 0; i < lx1.Count() - 1; i++)
            {
                double X = lx2[i]; double Y = ly2[i]; int fait = 0; int j = i;
                while (fait < 1)
                {
                    j = j + 1; fait = 0;
                    if (X == lx1[j] && Y == ly1[j])
                    {
                        double x1 = lx1[i + 1]; double y1 = ly1[i + 1]; double x2 = lx2[i + 1]; double y2 = ly2[i + 1];
                        int ip = lp[i + 1];
                        fait = 1;
                        lx1[i + 1] = lx1[j]; ly1[i + 1] = ly1[j]; lx2[i + 1] = lx2[j]; ly2[i + 1] = ly2[j]; lp[i + 1] = lp[j];
                        lx1[j] = x1; ly1[j] = y1; lx2[j] = x2; ly2[j] = y2; lp[j] = ip;
                        X = lx2[j]; Y = ly2[j];
                    }
                }
            }
            double[] tab = new double[2];
            for (int i = 0; i < lx1.Count(); i++)
            {
                tab = rf.WGS84ToLambert93(lx1[i], ly1[i]);
                lx.Add(tab[0]);
                ly.Add(tab[1]);
            }
            int t = lx2.Count() - 1;
            tab = rf.WGS84ToLambert93(lx2[t], ly2[t]);
            lx.Add(tab[0]);
            ly.Add(tab[1]);

            return (lp, lx, ly);

        }

        /// <summary>
        /// fronts the json2.
        /// </summary>
        /// <param name="path">Arborescence du fichier json.</param>
        /// <returns><![CDATA[A List<DynamicFront>.]]></returns>
        List<DynamicFront> frontJson2(string path)
        {
            using (StreamReader r = new StreamReader(path))
            {
                string json = r.ReadToEnd();
                dynamic myJsonObject = JsonConvert.DeserializeObject(json);

                List<DynamicFront> lstGeoLocation = new List<DynamicFront>();
                List<int> lp = new List<int>();
                List<double> lx = new List<double>();
                List<double> ly = new List<double>();
                foreach (var item in myJsonObject.features)
                {
                    lstGeoLocation.Add(new DynamicFront()
                    {
                        type = item.geometry.type,
                        coordinates = item.ToString()
                    });
                }


                return (lstGeoLocation);
            }
        }

        /// <summary>
        /// Lecture fichier json contenant multilignes : lorsque ligne du front contient plusieurs types d'OCSOL.
        /// </summary>
        /// <param name="path">Arborescence du fichier json.</param>
        /// <returns>Trois listes : une des entiers (NIV3) et deux des réels (x et y).</returns>
        (List<int>, List<double>, List<double>) Multifront(string path)
        {
            ReadFile rf = new ReadFile();
            dynamic myJsonObject = JsonConvert.DeserializeObject<MultiFront>(path);

            List<int> lp = new List<int>();
            List<double> lx = new List<double>();
            List<double> ly = new List<double>();
            int t = 0;
            double[] tab = new double[2];
            t = myJsonObject.geometry.coordinates.Length;

            for (int i1 = 0; i1 < t; i1++)
            {
                var t2 = myJsonObject.geometry.coordinates[i1].Length;
                // Console.WriteLine("multi: " + t2);
                for (int i = 0; i < (t2 / 2) - 1; i++)
                {
                    tab = rf.WGS84ToLambert93((double)myJsonObject.geometry.coordinates[i1][i, 0],
                                                   (double)myJsonObject.geometry.coordinates[i1][i, 1]);

                    lx.Add(tab[0]);
                    ly.Add(tab[1]);
                    lp.Add(myJsonObject.properties.NIV3_14);


                }
                tab = rf.WGS84ToLambert93((double)myJsonObject.geometry.coordinates[i1][(t / 2) - 1, 0],
                                                        (double)myJsonObject.geometry.coordinates[i1][(t / 2) - 1, 1]);
                lx.Add(tab[0]);
                ly.Add(tab[1]);


                lp.Add(myJsonObject.properties.NIV3_14);

            }

            return (lp, lx, ly);
        }

        /// <summary>
        /// lecture de ligne du front sous json
        /// </summary>
        /// <param name="path">Arborescence du fichier json.</param>
        /// <returns>List<integer>, List<double>, List<double>, List<double>, List<double>).</returns>
        (List<int>, List<double>, List<double>, List<double>, List<double>) Linefront(string path)
        {
            ReadFile rf = new ReadFile();
            dynamic myJsonObject = JsonConvert.DeserializeObject<LineFront>(path);

            List<int> lp = new List<int>();
            List<double> lx1 = new List<double>();
            List<double> ly1 = new List<double>();
            List<double> lx2 = new List<double>();
            List<double> ly2 = new List<double>();
            int t = 0;
            double[] tab = new double[4];
            t = myJsonObject.geometry.coordinates.Length;
            for (int i = 0; i < (t / 2) - 1; i++)
            {

                tab[0] = (double)myJsonObject.geometry.coordinates[i, 0];
                tab[1] = (double)myJsonObject.geometry.coordinates[i, 1];
                tab[2] = (double)myJsonObject.geometry.coordinates[i + 1, 0];
                tab[3] = (double)myJsonObject.geometry.coordinates[i + 1, 1];
                lx1.Add(tab[0]);
                ly1.Add(tab[1]);
                lx2.Add(tab[2]);
                ly2.Add(tab[3]);
                lp.Add(myJsonObject.properties.NIV3_14);

            }
            return (lp, lx1, ly1, lx2, ly2);
        }
    }
}
