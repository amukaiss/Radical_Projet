using System;
using System.IO;

namespace ApiTest01.Services
{
    
    /// <summary>
    /// Classe contient les fonctions : Maillage_Domaine_Carre et Elevation_Domaine
    /// </summary>
    public class Fonction1
    {               
        /// <summary>
        /// Cette fonction sert à maillaer le domaine cible.
        /// </summary>
        /// <param name="rectangle">nom du rectangle limitant le domaine d'étude</param>
        /// <param name="xmnt"> Les x issus de MNT.</param>
        /// <param name="ymnt"> Les y issus de MNT. </param>
        /// <param name="pas">Le pas de résolution de MNT</param>
        /// <returns> Deux tableaux X et Y. du maillage</returns>
        public (double[,],double[,]) Maillage_Domaine_Carre(string rectangle, double[] xmnt, double[] ymnt, double pas)
        {
            ReadFile r = new ReadFile();
            double[] list = r.jsonRectangle(rectangle);
            double xmin = list[0];
            double ymin = list[1];
            double xmax = list[2];
            double ymax = list[3];

            double a = xmnt[xmnt.Length - 1] - xmnt[0];
            double b = ymnt[ymnt.Length - 1] - ymnt[0];
            int nx = (int)Math.Floor(a / pas) ;
            int ny = (int)Math.Floor(b / pas) ;

            double[,] X = new double[ny, nx];
            double[,] Y = new double[ny, nx];

            for (int j = 0; j < ny; j++)
            {
                for (int i = 0; i < nx; i++)
                {
                    X[j, i] = xmnt[0] + i * pas;
                    Y[j, i] = ymnt[0] + j * pas;
                }
            }
            return (X, Y);
        }

        /// <summary>
        /// Elevations des points du maillage.
        /// </summary>
        /// <param name="X"> Le tableau X retourné par la fonction Maillage_Domaine_Carre.</param>
        /// <param name="Y"> Le tableau Y retourné par la fonction Maillage_Domaine_Carre.</param>
        /// <param name="xmnt"> Les x de MNT. </param>
        /// <param name="ymnt"> Les y de MNT.</param>
        /// <param name="zmnt"> Les z de MNT.</param>
        /// <param name="cellsize"> Le pas de résolution de MNT.</param>
        /// <returns>Tableau Z même taille que X et Y.</returns>
        public double[,] Elevation_Domaine(double[,] X, double[,] Y, double[] xmnt, double[] ymnt, double[,] zmnt, double cellsize)
        {
            double[,] Z = new double[X.GetLength(0), X.GetLength(1)];
            int ic;
            int jc;
            for (int j = 0; j < X.GetLength(0); j++)
            {
                for (int i = 0; i < X.GetLength(1); i++)
                {
                    ic = (int)Math.Floor((X[j, i] - xmnt[0]) / cellsize);
                    jc = (int)Math.Floor((Y[j, i] - ymnt[0]) / cellsize);
                    var alpha = (X[j, i] - xmnt[ic]) / cellsize;
                    var beta = (Y[j, i] - ymnt[jc]) / cellsize;
                    Z[j, i] = (1 - alpha) * ((1 - beta) * zmnt[jc, ic] + beta * zmnt[jc + 1, ic]) +
                                alpha * ((1 - beta) * zmnt[jc, ic + 1] + beta * zmnt[jc + 1, ic + 1]);
                                    
                }
            }
            return Z;
        }
    }
}
