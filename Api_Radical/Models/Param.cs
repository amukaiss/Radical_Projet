using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ApiTest01.Models
{
    /// <summary>
    /// The param.
    /// </summary>
    public class Param
    {
        /// <summary>
        /// The np azimut.
        /// </summary>
        public static int np_azimut = 13;
        /// <summary>
        /// The np hauteur.
        /// </summary>
        public static int np_hauteur = 11;
        /// <summary>
        /// The sigma.
        /// </summary>
        public static double sigma = 5.67e-8;
        /// <summary>
        /// The gravite.
        /// </summary>
        public static double gravite = 9.81;
        /// <summary>
        /// The cpeau.
        /// </summary>
        public static double cpeau = 4180;
        /// <summary>
        /// The quir.
        /// </summary>
        public static double quir = 0.35;
        /// <summary>
        /// The kappafl.
        /// </summary>
        public static double kappafl = 0.6;
        /// <summary>
        /// The alpha char.
        /// </summary>
        public static double alpha_char = 0.2;
        /// <summary>
        /// The pr.
        /// </summary>
        public static double Pr = 0.69;
        /// <summary>
        /// The pr13.
        /// </summary>
        public static double Pr13 = Math.Pow(Pr, 1.0 / 3.0);
        /// <summary>
        /// The grand sphere.
        /// </summary>
        public static double grand_sphere = 20000;
        /// <summary>
        /// The grand rayon ray.
        /// </summary>
        public static double grand_rayon_ray = 20;
        /// <summary>
        /// The facteur rad.
        /// </summary>
        public static int facteur_rad = 3;
        /// <summary>
        /// The facteur conv.
        /// </summary>
        public static int facteur_conv = 3;
        /// <summary>
        /// The niso.
        /// </summary>
        public static int niso = 20;
        /// <summary>
        /// The nmax.
        /// </summary>
        public static int nmax = 4000;
        /// <summary>
        /// The isomax.
        /// </summary>
        public static double isomax = 0.6;
        /// <summary>
        /// The isomin.
        /// </summary>
        public static double isomin = 0.01;
        /// <summary>
        /// The tolerance.
        /// </summary>
        public static double tolerance = 0.01;
        /// <summary>
        /// The n points min.
        /// </summary>
        public static int n_points_min = 20;
        /// <summary>
        /// The n individu.
        /// </summary>
        public static int n_individu = 100;
        /// <summary>
        /// The n generation.
        /// </summary>
        public static int n_generation = 350;
        /// <summary>
        /// The rate selection.
        /// </summary>
        public static double rate_selection = 0.75;
        /// <summary>
        /// The rate mutation.
        /// </summary>
        public static double rate_mutation = 0.75;
        /// <summary>
        /// The amplitud mutation.
        /// </summary>
        public static double amplitud_mutation = 0.25;
        /// <summary>
        /// The rate production.
        /// </summary>
        public static double rate_production = 0.25;
        /// <summary>
        /// The nzi.
        /// </summary>
        public static int nzi = 2;
        /// <summary>
        /// The ni.
        /// </summary>
        public static int[] NI = { 150, 300 };
        /// <summary>
        /// The ratiox.
        /// </summary>
        public static double[] Ratio_x = { 0.975, 1.01 };
        /// <summary>
        /// The xz.
        /// </summary>
        public static double[] XZ = { 0, 15, 40 };
        /// <summary>
        /// The nzj.
        /// </summary>
        public static int nzj = 2;
        /// <summary>
        /// The nj.
        /// </summary>
        public static int[] NJ = { 150, 150 };
        /// <summary>
        /// The ratioy.
        /// </summary>
        public static double[] Ratio_y = { 0.985, 1.015 };
        /// <summary>
        /// The yz.
        /// </summary>
        public static double[] YZ = { 0, 15, 30 };
        /// <summary>
        /// The nfi.
        /// </summary>
        public static int nfi = 60;
        /// <summary>
        /// The nfj.
        /// </summary>
        public static int nfj = 60;
        /// <summary>
        /// The nq.
        /// </summary>
        public static double nq = 2 * Math.Pow(10, 6);
        /// <summary>
        /// The ii quanta.
        /// </summary>
        public static int ii_quanta, jj_quanta;
        /// <summary>
        /// The ind.
        /// </summary>
        public static int ind;
        /// <summary>
        /// The coeff att.
        /// </summary>
        public static double[] coeff_att = new double[5];
        /// <summary>
        /// The cmn.
        /// </summary>
        public static double[,] CMN =
            {
            { 1.486e0, 1.225e-2,-1.489e-4,  8.381e-7,-1.685e-9 },
            {-2.003e-3,-5.900e-5,6.893e-7,  -3.823e-9,  7.637e-12},
            {4.68e-5,  1.66e-6, -1.922e-8,  1.0511e-10,-2.085e-13},
            {-6.052e-2,-1.759e-3, 2.092e-5, -1.166e-7, 2.350e-10}
        };
    }
}

