using ApiTest01.Services;
using Microsoft.AspNetCore.Mvc;
using System;

namespace ApiTest01.Controllers
{
    /// <summary>
    /// The getcenter controller.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]

    public class GetcenterController : Controller
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="mntFile">The mnt file.</param>
        /// <returns>A string.</returns>
        [HttpPost]
        public string Post(string mntFile)
        {
            ReadFile r = new ReadFile();
            return r.Calcul_centre(mntFile);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <returns>An integer.</returns>
        [HttpGet]
        public int Get()
        {
            var rng = new Random();
            return 2;
        }
    }
}