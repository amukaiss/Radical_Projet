using ApiTest01.Services;
using Microsoft.AspNetCore.Mvc;
using System;

namespace ApiTest01.Controllers
{
    /// <summary>
    /// The getbbox controller.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]

    public class GetbboxController : Controller
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
            return r.Get_bbox(mntFile);
        }
    }
}   