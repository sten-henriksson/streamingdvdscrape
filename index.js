const puppeteer = require('puppeteer-extra')
const $ = require('cheerio');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const controller = require('./controller')
var cron = require('node-cron');
puppeteer.use(StealthPlugin())
//todo fix normal browser usage
//test
const options = {

  headless: true,
  ignoreHTTPSErrors: true,
  userDataDir: './tmp'
};
function scrapeMovieDataRT(url) {
  return new Promise(resolve => {
    let sendjson = { "image": "", "genarr": [] ,"name":"","moviedataurl":""}
    let genrearray = ["music", "musical", "comedy", "western", "drama", "sci", "mystery", "thriller", "fantasy", "romance", "horror", "kid", "documentary", "animated", "action", "adventure"]
    //console.log(await page.content())
    $('div', url).each(function () {
      //look if its already added if not then add it to 
      //console.log($(this).attr().class)
      if ($(this).attr().class == "meta-value genre") {

        //resolve($(this).attr().src)


        let genrestring = $(this).text()
        genrearray = genrearray.map(function (genre, index) {


          if (genrestring.includes(genre)) {

            return index
          }

        })
        genrearray = genrearray.filter(x => x);
        
        sendjson.genarr = genrearray
      }

    });

    $('img', url).each(function () {
      //look if its already added if not then add it to 
      //console.log($(this).attr().class)
      if ($(this).attr().class == "posterImage js-lazyLoad") {

        sendjson.image = $(this).attr().src

      }

    });
    $('h1', url).each(function () {
      //look if its already added if not then add it to 
      //console.log($(this).attr().class)
      if ($(this).attr().class == "mop-ratings-wrap__title mop-ratings-wrap__title--top") {
        sendjson.name =$(this).text()
      }

    });
    resolve(sendjson)



  });
}
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
function scrapeMovieLinks(url) {
  return new Promise(resolve => {
    let everyother = true
    let resolvearray = []
    $('a[href]', url).each(function () {

      let urltocheck = $(this).attr('href')
      if (urltocheck.includes("/m/")) {
        if (everyother == true) {
          resolvearray.push(urltocheck)
          everyother = false
        }
        else {
          everyother = true
        }
      }
      //resolve($(this).text())


    });

    resolve(resolvearray)


  });


}
async function startscrape() {

  puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }).then(async browser => {
    const page = await browser.newPage()
    await page.goto("https://www.rottentomatoes.com/top/bestofrt/top_100_animation_movies/")
    let linkarray = await scrapeMovieLinks(await page.content())
    let movarray = []
    let arraylenght = linkarray.length
    for (var i = 0; i < arraylenght; i++) {
      let getRandom = getRandomInt(1000, 4000)
      let url = "https://www.rottentomatoes.com" + linkarray[i]
      await page.goto(url)
      await page.waitFor(getRandom)
      let mov = await scrapeMovieDataRT(await page.content())
      
      //upsert here with movieurl and moviedata
      mov.moviedataurl = url
      movarray.push(mov)
     
    }
    movarray = movarray.filter(x => x.image);
    movarray.forEach(element => {
      console.log("Mov"+JSON.stringify(element));
      controller.upsert(element)
    });
    console.table(linkarray)
  })

}
startscrape()
function getRandomInt(min, max) {
  let a = Math.floor(Math.random() * Math.floor(max));
  a = a + min
  return a
}

cron.schedule('*/20 * * * *', () => {
  startscrape()
});