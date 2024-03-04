using ApiTest01.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;

using JsonSerializer = System.Text.Json.JsonSerializer;

namespace ApiTest01.Services
{
    /// <summary>
    /// The read file.
    /// </summary>
    public class ReadFile
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="mntFile">The mnt file.</param>
        /// <returns>A string.</returns>
        public string Calcul_centre(string mntFile)
        {

            string fileName = $@"{mntFile}";
            StreamReader srmnt = new StreamReader(fileName);
            string line1 = srmnt.ReadLine();
            string reste = line1.Substring(6, line1.Length - 6);
            int ncols = Int32.Parse(reste);
            line1 = srmnt.ReadLine();
            reste = line1.Substring(6, line1.Length - 6);
            int nrows = Int32.Parse(reste);
            line1 = srmnt.ReadLine();
            reste = line1.Substring(10, line1.Length - 10);
            double x1corner = Double.Parse(reste, System.Globalization.CultureInfo.InvariantCulture);
            line1 = srmnt.ReadLine();
            reste = line1.Substring(10, line1.Length - 10);
            double y1corner = Double.Parse(reste, System.Globalization.CultureInfo.InvariantCulture);
            line1 = srmnt.ReadLine();
            reste = line1.Substring(9, line1.Length - 9);
            double cellsize = Double.Parse(reste, System.Globalization.CultureInfo.InvariantCulture);

            double x2corner = x1corner + cellsize * ncols;
            double y2corner = y1corner + cellsize * nrows;
            double centreX = (x2corner + x1corner) / 2;
            double centreY = (y2corner + y1corner) / 2;
            // Longtitude, Latitude
            double[] tab = Lambert93ToWGS84(centreX, centreY);
            string json = JsonConvert.SerializeObject(tab);
            srmnt.Close();
            return json;

        }
        /// <summary>
        /// 
        /// </summary>
        /// <param name="mntFile">The mnt file.</param>
        /// <returns>A string.</returns>
        public string Get_bbox(string mntFile)
        {

            string fileName = $@"{mntFile}";
            StreamReader srmnt = new StreamReader(fileName);
            string line1 = srmnt.ReadLine();
            string reste = line1.Substring(6, line1.Length - 6);
            int ncols = Int32.Parse(reste);
            line1 = srmnt.ReadLine();
            reste = line1.Substring(6, line1.Length - 6);
            int nrows = Int32.Parse(reste);
            line1 = srmnt.ReadLine();
            reste = line1.Substring(10, line1.Length - 10);
            double x1corner = Double.Parse(reste, System.Globalization.CultureInfo.InvariantCulture);
            
            line1 = srmnt.ReadLine();
            reste = line1.Substring(10, line1.Length - 10);
            double y1corner = Double.Parse(reste, System.Globalization.CultureInfo.InvariantCulture);
            line1 = srmnt.ReadLine();
            reste = line1.Substring(9, line1.Length - 9);
            double cellsize = Double.Parse(reste, System.Globalization.CultureInfo.InvariantCulture);

            double x2corner = x1corner + cellsize * ncols;
            double y2corner = y1corner + cellsize * nrows;

            // Longtitude, Latitude
            double[] tab = Lambert93ToWGS84(x1corner, y1corner);
            double[] tab2 = Lambert93ToWGS84(x2corner, y2corner);
            List<double[]> ts = new List<double[]>();
            ts.Add(tab);
            ts.Add(tab2);
            string json3 = JsonSerializer.Serialize(ts);
            srmnt.Close();
            return json3;

        }



        //Fonction pour extraire les mnt du rectangle 
        /// <summary>
        /// Lectures the grosfichier.
        /// </summary>
        /// <param name="mntFile">The mnt file.</param>
        /// <param name="path">The path.</param>
        /// <returns>A (double[], double[], Double[,], double).</returns>
        public (double[], double[], Double[,], double) lecture_grosfichier(string mntFile, string path)
        {
            double[] list = jsonRectangle(path);
            double x1rectangle, x2rectangle, y1rectangle, y2rectangle;
            x1rectangle = list[0];
            y1rectangle = list[1];
            x2rectangle = list[2];
            y2rectangle = list[3];
            StreamReader srmnt = new StreamReader(mntFile);
            char[] cSplitter = { ' ' };
            string line1 = srmnt.ReadLine();
            string reste = line1.Substring(6, line1.Length - 6);

            int ncols = Int32.Parse(reste);
            line1 = srmnt.ReadLine();
            reste = line1.Substring(6, line1.Length - 6);
            int nrows = Int32.Parse(reste);

            line1 = srmnt.ReadLine();
            reste = line1.Substring(10, line1.Length - 10);

            double x1corner = Double.Parse(reste, System.Globalization.CultureInfo.InvariantCulture);
            //double x1corner = Convert.ToDouble(reste.Replace('.',','));
            line1 = srmnt.ReadLine();
            reste = line1.Substring(10, line1.Length - 10);
            double y1corner = Double.Parse(reste, System.Globalization.CultureInfo.InvariantCulture);
            line1 = srmnt.ReadLine();
            reste = line1.Substring(9, line1.Length - 9);
            double cellsize = Double.Parse(reste, System.Globalization.CultureInfo.InvariantCulture);


            double x2corner = x1corner + cellsize * ncols;
            double y2corner = y1corner + cellsize * nrows;
            

            int ixmin = (int)Math.Round((x1rectangle - x1corner) / cellsize) - 1;
            int ixmax = (int)Math.Round((x2rectangle - x1corner) / cellsize) + 1;
            int jymin = (int)Math.Round((y1rectangle - y1corner) / cellsize) - 1;
            int jymax = (int)Math.Round((y2rectangle - y1corner) / cellsize) + 1;

            line1 = srmnt.ReadLine();

            double[] xmnt = new double[ixmax - ixmin ];
            double[] ymnt = new double[jymax - jymin ];
            double[,] zmnt = new double[jymax - jymin , ixmax - ixmin ];

            for (int i = ixmin; i < ixmax; i++)
            {

                xmnt[i - ixmin] = x1corner + i * cellsize;

            }
            for (int j = jymin; j < jymax; j++)
            {
                ymnt[j - jymin] = y1corner + j * cellsize;
            }

            double[,] ztemp = new double[nrows, ncols];

            for (int j = 0; j < nrows; j++)
            {
                string stream = srmnt.ReadLine();
                stream = stream.Trim();
                string[] line = stream.Split(cSplitter);
                for (int i = 0; i < ncols; i++)
                {
                    ztemp[nrows - j - 1, i] = Double.Parse(line[i], System.Globalization.CultureInfo.InvariantCulture);
                }
            }
            for (int j = 0; j < nrows; j++)
            {

                if ((j >= jymin) && (j < jymax))
                {
                    for (int i = ixmin; i < ixmax; i++)
                    {
                        zmnt[j - jymin, i - ixmin] = ztemp[j, i];
                    }
                }
            }

            return (xmnt, ymnt, zmnt, cellsize);
        }

        //récuperer les x1,x2 et y1,y2 du rectangle à partir du fichier json
        /// <summary>
        /// jsons the rectangle.
        /// </summary>
        /// <param name="path">The path.</param>
        /// <returns>An array of double.</returns>
        public double[] jsonRectangle(string path)
        {
            using (StreamReader r = new StreamReader(path))
            {
                string json = r.ReadToEnd();

                dynamic stuff = JObject.Parse(json);
                object address = stuff.features[0].geometry;
                dynamic stuf = JObject.Parse(address.ToString());
                double[] list = new double[4];
                double[] tab = new double[2];
                double[] tab2 = new double[2];
                double longi1, longi2;
                double lat1, lat2;
                longi1 = stuf.coordinates[0][0][0];
                lat1 = stuf.coordinates[0][0][1];
                longi2 = stuf.coordinates[0][2][0];
                lat2 = stuf.coordinates[0][2][1];
                tab = WGS84ToLambert93(longi1, lat1);
                tab2 = WGS84ToLambert93(longi2, lat2);

                list[0] = tab[0];
                list[1] = tab[1];
                list[2] = tab2[0];
                list[3] = tab2[1];

                return list;
            }
        }

        /// <summary>
        /// WGS the s84 to lambert93.
        /// </summary>
        /// <param name="longitude">The longitude.</param>
        /// <param name="latitude">The latitude.</param>
        /// <returns>An array of double.</returns>
        public double[] WGS84ToLambert93(double longitude, double latitude)
        {
            /**** Conversion latitude,longitude en coordonée lambert 93 ****/
            // Projection conforme sécante, algo détailler dans NTG_71.pdf : http://www.ign.fr/affiche_rubrique.asp?rbr_id=1700&lng_id=FR
            //  > ACCUEIL > L'offre IGN Pro > Géodésie > RGF93 > Outils 

            //variables:
            var a = 6378137; //demi grand axe de l'ellipsoide (m)
            var e = 0.08181919106; //première excentricité de l'ellipsoide
            var l0 = (Math.PI / 180) * 3;
            var lc = l0;
            var phi0 = (Math.PI / 180) * 46.5; //latitude d'origine en radian
            var phi1 = (Math.PI / 180) * 44; //1er parallele automécoïque
            var phi2 = (Math.PI / 180) * 49; //2eme parallele automécoïque

            var x0 = 700000; //coordonnées à l'origine
            var y0 = 6600000; //coordonnées à l'origine

            var phi = (Math.PI / 180) * latitude;
            var l = (Math.PI / 180) * longitude;

            //calcul des grandes normales
            var gN1 = a / Math.Sqrt(1 - e * e * Math.Sin(phi1) * Math.Sin(phi1));
            var gN2 = a / Math.Sqrt(1 - e * e * Math.Sin(phi2) * Math.Sin(phi2));

            //calculs des latitudes isométriques
            var gl1 = Math.Log(Math.Tan(Math.PI / 4 + phi1 / 2) * Math.Pow((1 - e * Math.Sin(phi1)) / (1 + e * Math.Sin(phi1)), e / 2));
            var gl2 = Math.Log(Math.Tan(Math.PI / 4 + phi2 / 2) * Math.Pow((1 - e * Math.Sin(phi2)) / (1 + e * Math.Sin(phi2)), e / 2));
            var gl0 = Math.Log(Math.Tan(Math.PI / 4 + phi0 / 2) * Math.Pow((1 - e * Math.Sin(phi0)) / (1 + e * Math.Sin(phi0)), e / 2));
            var gl = Math.Log(Math.Tan(Math.PI / 4 + phi / 2) * Math.Pow((1 - e * Math.Sin(phi)) / (1 + e * Math.Sin(phi)), e / 2));

            //calcul de l'exposant de la projection
            var n = (Math.Log((gN2 * Math.Cos(phi2)) / (gN1 * Math.Cos(phi1)))) / (gl1 - gl2);//ok

            //calcul de la constante de projection
            var c = ((gN1 * Math.Cos(phi1)) / n) * Math.Exp(n * gl1);//ok

            //calcul des coordonnées
            var ys = y0 + c * Math.Exp(-1 * n * gl0);

            var x93 = x0 + c * Math.Exp(-1 * n * gl) * Math.Sin(n * (l - lc));
            var y93 = ys - c * Math.Exp(-1 * n * gl) * Math.Cos(n * (l - lc));

            double[] tabXY = new double[2];

            tabXY[0] = x93;
            tabXY[1] = y93;

            return tabXY;
        }

        /// <summary>
        /// Lambert93 the to WG s84.
        /// </summary>
        /// <param name="x">The X.</param>
        /// <param name="y">The Y.</param>
        /// <returns>An array of double.</returns>
        public double[] Lambert93ToWGS84(double x, double y)
        {
            double LON_MERID_IERS = 3.0 * Math.PI / 180.0;
            double N = 0.7256077650;
            double C = 11754255.426;
            double XS = 700000.000;
            double YS = 12655612.050;

            double dX = x - XS;
            double dY = y - YS;
            double R = Math.Sqrt(dX * dX + dY * dY);
            double gamma = Math.Atan(dX / -dY);
            double latIso = -1 / N * Math.Log(Math.Abs(R / C));

            double[] tabXY = new double[2];

            tabXY[0] = (LON_MERID_IERS + gamma / N) * (180.0 / Math.PI);
            tabXY[1] = (latitudeFromLatitudeISO(latIso)) * (180.0 / Math.PI);

            return tabXY;
        }
        /// <summary>
        /// latitudes the from latitude ISO.
        /// </summary>
        /// <param name="latISo">The lat IS.</param>
        /// <returns>A double.</returns>
        private double latitudeFromLatitudeISO(double latISo)
        {
            double M_PI_2 = Math.PI / 2;
            double DEFAULT_EPS = 1e-10;
            double E_WGS84 = 0.08181919106;
            double E2 = E_WGS84 / 2.0;
            double phi0 = 2 * Math.Atan(Math.Exp(latISo)) - M_PI_2;
            double phiI = 2 * Math.Atan(Math.Pow((1 + E_WGS84 * Math.Sin(phi0)) /
                (1 - E_WGS84 * Math.Sin(phi0)), E2) * Math.Exp(latISo)) - M_PI_2;
            double delta = Math.Abs(phiI - phi0);
            while (delta > DEFAULT_EPS)
            {
                phi0 = phiI;
                phiI = 2 * Math.Atan(Math.Pow((1 + E_WGS84 * Math.Sin(phi0)) /
                    (1 - E_WGS84 * Math.Sin(phi0)), E2) * Math.Exp(latISo)) - M_PI_2;
                delta = Math.Abs(phiI - phi0);
            }
            return phiI;
        }

        /// <summary>
        /// Convert to jagged array.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="multiArray">The multi array.</param>
        /// <returns>An array of TS.</returns>
        public T[][] ConvertToJaggedArray<T>(T[,] multiArray)
        {
            int numOfColumns = multiArray.GetLength(0);
            int numOfRows = multiArray.GetLength(1);
            T[][] jaggedArray = new T[numOfColumns][];

            for (int c = 0; c < numOfColumns; c++)
            {
                jaggedArray[c] = new T[numOfRows];
                for (int r = 0; r < numOfRows; r++)
                {
                    jaggedArray[c][r] = multiArray[c, r];
                }
            }

            return jaggedArray;
        }


        /// <summary>
        /// jsons the flamme.
        /// </summary>
        /// <param name="path">The path.</param>
        /// <returns>An array of double.</returns>
        public double[] jsonFlamme(string path)
        {
            using (StreamReader r = new StreamReader(path))
            {
                string json = r.ReadToEnd();

                dynamic stuff = JObject.Parse(json);
                object address = stuff.features[0].geometry;
                dynamic stuf = JObject.Parse(address.ToString());
                double[] list = new double[4];
                double[] tab = new double[2];
                double[] tab2 = new double[2];
                double longi1, longi2;
                double lat1, lat2;
                longi1 = stuf.coordinates[0][0][0];
                lat1 = stuf.coordinates[0][0][1];
                longi2 = stuf.coordinates[0][2][0];
                lat2 = stuf.coordinates[0][2][1];
                tab = WGS84ToLambert93(longi1, lat1);
                tab2 = WGS84ToLambert93(longi2, lat2);

                list[0] = tab[0];
                list[1] = tab[1];
                list[2] = tab2[0];
                list[3] = tab2[1];

                return list;
            }
        }


        /// <summary>
        /// reads the flamme.
        /// </summary>
        /// <param name="path">The path.</param>
        /// <returns>An array of double.</returns>
        public double[,] readFlamme(string path)
        {
            using (StreamReader r = new StreamReader(path))
            {
                string json = r.ReadToEnd();

                Flamme[] result = JsonConvert.DeserializeObject<Flamme[]>(json);
                double[,] list = new double[result.Length, 5];
                for (int i = 0; i < result.Length; i++)
                {

                    list[i, 0] = result[i].niv3;
                    list[i, 1] = result[i].pouvoirE;
                    list[i, 2] = result[i].longueurF;
                    list[i, 3] = result[i].tempF;
                    list[i, 4] = result[i].rayon;

                }
                return list;
            }

        }
    }
}
