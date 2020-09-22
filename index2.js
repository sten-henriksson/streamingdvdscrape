const puppeteer = require('puppeteer-extra')
const screenshot = 'youtube_fm_dreams_video.png'
const $ = require('cheerio');
const mysql = require('mysql');
const { get } = require('request-promise');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
//todo fix normal browser usage
const options = {

    headless: true,
    ignoreHTTPSErrors: true,
    userDataDir: './tmp'
};
function scrapeMovieDataRT(url) {
    return new Promise(resolve => {
        let sendjson = { "image": "", "genarr": [] }
        let genrearray = ["music", "musical", "comedy", "western", "drama", "sci", "mystery", "thriller", "fantasy", "romance", "horror", "kid", "documentaries", "animated", "action", "adventure"]
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

    puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }).then(async browser => {
        const page = await browser.newPage()
        await page.goto("https://www.rottentomatoes.com/browse/top-dvd-streaming")
        let linkarray = await scrapeMovieLinks(await page.content())
        let movarray = []
        let arraylenght = linkarray.length
        for (var i = 0; i < arraylenght; i++) {
            let getRandom = getRandomInt(1000, 4000)

            await page.goto("https://www.rottentomatoes.com" + linkarray[i])
            await page.waitFor(getRandom)
            let mov = await scrapeMovieDataRT(await page.content())
            movarray.push(mov)
            console.log("mov" + JSON.stringify(mov));
        }
        movarray = movarray.filter(x => x.image);
        movarray = movarray.filter(x => x.genarr[0]);
        console.log(JSON.stringify(linkarray))
    })

}
async function startscrape1() {
    let arraylenght = linkarray.length
    for (var i = 0; i < arraylenght; i++) {
        console.log("forloop" + linkarray[i]);

    }
    console.log("array : " + await scrapeMovieLinks("https://www.rottentomatoes.com/browse/top-dvd-streaming"))
    //console.log(JSON.stringify(await scrapeMovieDataRT("https://www.rottentomatoes.com/m/lost_girls_and_love_hotels")))
    //console.log(JSON.stringify(await scrapeMovieLinks("https://www.rottentomatoes.com/browse/top-dvd-streaming?minTomato=0&maxTomato=100&services=amazon;hbo_go;itunes;netflix_iw;vudu;amazon_prime;fandango_now&genres=1;2;4;5;6;8;9;10;11;13;18;14&sortBy=release")))
}
startscrape()
function getRandomInt(min, max) {
    let a = Math.floor(Math.random() * Math.floor(max));
    a = a + min
    return a
}