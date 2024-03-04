using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Numerics;
using ApiTest01.Models;
using MongoDB.Bson;
using MongoDB.Driver;
using SharpCompress.Archives;

namespace ApiTest01.Services
{
    /// <summary>
    /// Fonction : classe contient les fonctions suivantes :
    /// Angle_direction_ellipse, Voisinage_ifeu, Voisinage, Calcul_isoflux,
    /// Chercher2
    /// </summary>
    public class Fonction3
    {
        /// <summary>
        /// Cette fonction calcule l'angle, la direction d'inclinaison et la hauteur de flamme.
        /// </summary>
        /// <param name="lfl">Longueur de flamme.</param>
        /// <param name="vent_force">Force du vent.</param>
        /// <param name="vent_direction">Direction du vent.</param>
        /// <param name="normal">Normal du terrain.</param>
        /// <returns>Returne un tableau contenant: angle, direction d'inclinaison et hauteur.</returns>
        public double[] Angle_direction_ellipse(double lfl, double vent_force, double vent_direction, Vector3 normal)
        {
            Vector3 xplus = new Vector3(1, 0, 0);
            Vector3 yplus = new Vector3(0, 1, 0);
            Vector3 zplus = new Vector3(0, 0, 1);
            Vector3 vent = new Vector3();
            Vector3 vent_tangentiel = new Vector3();
            Vector3 pente_tangentiel_fixe = new Vector3();
            Vector3 pente = new Vector3();
            Vector3 A = new Vector3();
            Vector3 vflamme = new Vector3();
            Vector3 V = new Vector3();
            Vector3 W = new Vector3();
            double angle, direction;
            double gravite = 9.81;
            double hauteur_flamme;
            double dv = vent_direction * Math.PI / 180 - Math.PI;
            double fv = vent_force / 3.6;
            // VENT_TANGENTIEL: VECTEUR VENT TANGENTIEL, DANS LE PLAN DU TERRAIN, 
            // CALCULE À PARTIR DE LA FORCE DU VENT ET DE SA DIRECTION
            vent.X = (float)( fv* Math.Sin(dv));
            vent.Y = (float)(fv * Math.Cos(dv));
            vent.Z = 0;
            A = Vector3.Cross(vent, normal);
            vent_tangentiel = Vector3.Cross(normal, A);
            double vent_u = Math.Sqrt(Vector3.Dot(vent_tangentiel, vent_tangentiel));
            // CALCUL DE L'ANGLE DE PENTE PAR RAPPORT À LA VERTICALE ABSOLUE (Z)
            // CALCUL DE LA DIRECTION DE PLUS GRANDE PENTE PAR RAPPORT AU REPÉRE FIXE(X, Y, Z)
            A = Vector3.Cross(zplus, normal);
            pente = Vector3.Cross(normal, A);
            double norme_pente = Math.Sqrt(Vector3.Dot(pente, pente));
            
            if (norme_pente <= 1e-5)
            {
                hauteur_flamme = lfl * Math.Pow(1 + 4 * Math.Pow(vent_u, 2) / (gravite * lfl), -0.5);
                angle = Math.Atan(1.22 * vent_u / Math.Sqrt(gravite * hauteur_flamme));
                direction = dv;
            }
            else if (Math.Abs(fv) <= 1e-5)
            {
                angle = Math.Asin(Vector3.Dot(pente, zplus) / norme_pente);
                hauteur_flamme = lfl*Math.Cos(angle);
                A = Vector3.Cross(pente, zplus);
                pente_tangentiel_fixe = Vector3.Cross(zplus, A);
                double norme_pente_tangentiel_fixe = Math.Sqrt(Vector3.Dot(pente_tangentiel_fixe, pente_tangentiel_fixe));
                direction = Math.Acos(Vector3.Dot(pente_tangentiel_fixe, yplus) / norme_pente_tangentiel_fixe);
                if (Vector3.Dot(pente_tangentiel_fixe, yplus) < 0)
                {
                    direction=2*Math.PI -direction;
                }
            }
            else
            {
                hauteur_flamme = lfl * Math.Pow(1 + 4 * Math.Pow(fv, 2) / (gravite * lfl), -0.5);
                angle = Math.Atan(1.22 * fv / Math.Sqrt(gravite * hauteur_flamme));
                vflamme = (float)(Math.Sin(angle)) * (Vector3.Multiply((float)(Math.Sin(dv)), xplus) +
                    Vector3.Multiply((float)(Math.Cos(dv)), yplus)) +
                    Vector3.Multiply((float)(Math.Cos(angle)), zplus);
                vflamme = Vector3.Normalize(vflamme);
                angle = Math.Acos(Vector3.Dot(vflamme, normal));
                V = Vector3.Cross(vflamme, normal);

                W = Vector3.Cross(zplus, V);
                double norme_W = Math.Sqrt(Vector3.Dot(W, W));
                double ps = Vector3.Dot(W, yplus) / norme_W;
                direction = Math.Acos(ps);
                if (ps < 0)
                {
                    direction = 2* Math.PI - direction;
                }
            }
            if (angle < 0)
            {
                angle = Math.Abs(angle);
                direction = Math.PI + direction;

            }
            double[] tab = new double[3];

            tab[0] = (float)angle;
            tab[1] = (float)direction;
            tab[2] = (float)hauteur_flamme;
            return tab;
        }


        /// <summary>
        /// Voisinage_ifeu calcul les noeuds du maillage du terrain, voisins d'un site en feu "ifeu"
        /// recevant le flux de chaleur dans un rayon assez grand.
        /// </summary>
        /// <param name="ifeu">numéro du site en feu.</param>
        /// <param name="xf">Coordonnée x du site en feu.</param>
        /// <param name="yf">coordonnée y du site en feu.</param>
        /// <param name="nx">nombre total de noeuds du maillage selon x.</param>
        /// <param name="ny">nombre total de noeuds du maillage selon y.</param>
        /// <param name="dansFeu">Référence 1 si le noeud est en feu et 0 sinon</param>
        /// <param name="numMesh">Numéro du noeud dans le maillage.</param>
        /// <param name="rayon">Rayon du site en feu.</param>
        /// <param name="prad">Tableau contenant la puissance radiative de points du maillages (points receptifs)</param>
        /// <param name="pemissif">Pouvoir emissif du site en feu.</param>
        /// <param name="X">Tableau contenant les x du maillage.</param>
        /// <param name="Y">Tableau contenant les y du maillage.</param>
        /// <returns>returne un tableau des entiers : les numéros du noeuds voisins</returns>
        public int[] Voisinage_ifeu(int ifeu, double xf, double yf, int nx, int ny,
          int[,] dansFeu, int[,] numMesh, double rayon, double[,] prad,
          double pemissif, double[,] X, double[,] Y)
        {

            List<int> nvoisins = new List<int>();

            for (int j = 0; j < ny; j++)
            {
                for (int i = 0; i < nx; i++)
                {

                    int ij = numMesh[j, i];
                    if (dansFeu[j,i] == 1)
                    { 
                        continue; 
                    }

                    double dis = Math.Sqrt(Math.Pow(X[j, i] - xf, 2) +
                                           Math.Pow(Y[j, i] - yf, 2));
                    if (dis <= rayon)
                    {
                        dansFeu[j, i] = 1;
                        prad[j, i] = pemissif;
                        continue;
                    }

                    if (dis > rayon && dis <= Param.grand_rayon_ray)
                    {
                        nvoisins.Add(ij);
                    }
                }
            }
            int[] voisinage = new int[nvoisins.Count];
            nvoisins.CopyTo(voisinage);
            return voisinage;
        }



        /// <summary>
        /// Calcul_iso_fluxe : calcul les iso-flux à chaque noeud du maillage.
        /// </summary>
        /// <param name="xf"> Coordonnée x du site en feu.</param>
        /// <param name="yf"> Coordonnée y du site en feu.</param>
        /// <param name="pemissif">Pouvoir emissif du site en feu.</param>
        /// <param name="ny">Nombre total de noeuds selon y.</param>
        /// <param name="nx">Nombre total de noeuds selon x.</param>
        /// <param name="X">Tableau contient tous les x du maillage.</param>
        /// <param name="Y">Tableau contient tous les y du maillage.</param>
        /// <param name="teta_flamme"> Angle d'inclainaison de flamme.</param>
        /// <param name="bdata">Donnees extraites de la base de données pour un site en feu.</param>
        /// <param name="diametre">Diametre du site en feu.</param>
        /// <param name="voisins"> Voisins du site en feu.</param>
        /// <param name="prad"> Tableau contenant la puissance radiative de tous les points du maillage.</param>
        /// <returns>Retourne un tableau des iso-flux.</returns>
        public double[,] Calcul_isoflux(double xf, double yf, double pemissif, int ny, int nx,
            double[,] X, double[,] Y, double teta_flamme, double[,] bdata, double diametre,
            int[] voisins, double[,] prad)
        {
            //StreamWriter sw = new StreamWriter("resultat.dat");
            int[,] tab = new int[nx * ny, 2];
            double[,] rotation = new double[2, 2];
            double[] point = new double[2];
            double[] rot_point = new double[2];
            double[] centre_ellipse = new double[2];

            double rayon = diametre / 2;

            rotation[0, 0] = Math.Cos(teta_flamme);
            rotation[0, 1] = -Math.Sin(teta_flamme);
            rotation[1, 0] = Math.Sin(teta_flamme);
            rotation[1, 1] = Math.Cos(teta_flamme);

            for (int j1 = 0; j1 < voisins.GetLength(0); j1++)
            {

                int j = voisins[j1] / nx;
                int i = voisins[j1] - j * nx;
                double dis = Math.Sqrt(Math.Pow(X[j, i] - xf, 2) +
                                   Math.Pow(Y[j, i] - yf, 2));
                if (dis > rayon && dis < Param.grand_rayon_ray)
                {
                    point[0] = X[j, i] - xf;
                    point[1] = Y[j, i] - yf;
                    rot_point[0] = point[0] * rotation[0, 0] + point[1] * rotation[0, 1];
                    rot_point[1] = point[0] * rotation[1, 0] + point[1] * rotation[1, 1];

                    for (int k = bdata.GetLength(0) - 1; k >= 0; k--)
                    {

                        if (bdata[k, 1] <= 0 || bdata[k, 2] <= 0)
                            continue;
                        centre_ellipse[0] = 0;
                        centre_ellipse[1] = bdata[k, 3];
                        double dss = Math.Pow((rot_point[0] - centre_ellipse[0]) / bdata[k, 2], 2) +
                            Math.Pow((rot_point[1] - centre_ellipse[1]) / bdata[k, 1], 2);

                        if (dss <= 1)
                        {
                            prad[j, i] = prad[j, i] + pemissif * bdata[k, 0];
                            break;
                        }

                    }
                }


            }

            return prad;
        }

        
        /// <summary>
        /// Cette fonction d'extraire les ellipses des iso-flux normalisés dans la base de donnéees "MongoDB".
        /// </summary>
        /// <param name="lon">Longueur de flamme.</param>
        /// <param name="ra">Rayon de flamme.</param>
        /// <param name="inc">Inclinaison de flamme.</param>
        /// <param name="humi">Humidité du milieu.</param>
        /// <returns> Returne des ellipses des iso-flux.</returns>
        public List<BsonDocument> Chercher2(double lon, double ra, double inc, double humi)
        {

            var dbClient = new MongoClient("mongodb://localhost:27017");
            IMongoDatabase db = dbClient.GetDatabase("BD_Radical");

            var abaquesCollect = db.GetCollection<BsonDocument>("Abaques");
            var builder = Builders<BsonDocument>.Filter;
            //var projection = Builders<Abaque>.Projection.Exclude(u => u._id).Include(u => u.ISOFLUX);
            var filter = builder.Eq("Humidite", humi) & builder.Eq("Rayon_de_flamme", ra) & builder.Eq("Longueur_de_flamme", lon) & builder.Eq("Inclinaison_de_flamme", inc);
            var sortDefinition = Builders<BsonDocument>.Sort.Descending("Longueur_de_flamme");
            var docs = abaquesCollect.Find(filter).Project(Builders<BsonDocument>.Projection.Include("ISOFLUX").Exclude("_id")).Sort(sortDefinition).Limit(1).ToList();
            return docs;
        }
    }
}
