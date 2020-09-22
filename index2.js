const puppeteer = require('puppeteer-extra')
const screenshot = 'youtube_fm_dreams_video.png'
const $ = require('cheerio');
const mysql = require('mysql');
const { get } = require('request-promise');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const options = {
    
    headless: true,
    ignoreHTTPSErrors: true,
    userDataDir: './tmp'
};
function scrapeMovieDataRT(url) {
    return new Promise(resolve => {
        puppeteer.launch({ headless: true }).then(async browser => {

            const page = await browser.newPage()
            await page.goto(url)
            await page.waitFor(getRandomInt(300, 600))
            let sendjson = { "image": "", "genarr": [] }
            let genrearray = ["music", "musical", "comedy", "western", "drama", "sci", "mystery", "thriller", "fantasy", "romance", "horror", "kid", "documentaries", "animated", "action", "adventure"]
            //console.log(await page.content())
            $('div', await page.content()).each(function () {
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

            $('img', await page.content()).each(function () {
                //look if its already added if not then add it to 
                //console.log($(this).attr().class)
                if ($(this).attr().class == "posterImage js-lazyLoad") {

                    sendjson.image = $(this).attr().src
                    //console.log($(this).attr().src)
                }

            });
            resolve(sendjson)
        })


    });
}
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
function scrapeMovieLinks(url) {
    return new Promise(resolve => {
        puppeteer.launch({ headless: true }).then(async browser => {

            const page = await browser.newPage()
            await page.goto(url)
            await page.waitFor(getRandomInt(3000, 6000))

            console.log(await page.content())
            let everyother = true
            let resolvearray = []
            $('a[href]', await page.content()).each(function () {

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

        })
    });


}
async function startscrape() {
    
    //console.log("array : "+await scrapeMovieLinks("https://www.rottentomatoes.com/browse/top-dvd-streaming"))
    let linkarray = await scrapeMovieLinks("https://www.rottentomatoes.com/browse/top-dvd-streaming")
    let mintime = 0
    let unresolvedpromises = linkarray.map(async function (x) {

        let getRandom = getRandomInt(mintime+1000, mintime+5000)
        mintime = mintime + getRandom
        await sleep(getRandom + mintime)
        
        let mov = await scrapeMovieDataRT("https://www.rottentomatoes.com" + x)
        console.log("moveidata" + JSON.stringify(mov))
        return mov
    })
    linkarray = await Promise.all(unresolvedpromises)
    linkarray = linkarray.filter(x => x.image);
    console.log(JSON.stringify(linkarray))
    //console.log(JSON.stringify(await scrapeMovieDataRT("https://www.rottentomatoes.com/m/lost_girls_and_love_hotels")))
    //console.log(JSON.stringify(await scrapeMovieLinks("https://www.rottentomatoes.com/browse/top-dvd-streaming?minTomato=0&maxTomato=100&services=amazon;hbo_go;itunes;netflix_iw;vudu;amazon_prime;fandango_now&genres=1;2;4;5;6;8;9;10;11;13;18;14&sortBy=release")))
}
async function startscrape1() {
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
[{ "image": "/assets/pizza-pie/images/poster_default.c8c896e70c3.gif", "genarr": [] },
 { "image": "https://resizing.flixster.com/2VHXaJcXnk4-wmkXW45eZU8g4Nw=/206x305/v2/https://resizing.flixster.com/Hw_lrMynt1Q8gnfyWb4GQtPMCoU=/ems.ZW1zLXByZC1hc3NldHMvbW92aWVzLzI0OTNlYTE2LTViMWEtNDJiMi1hMjg0LTMxOGQ4ZjkwYmVjMi5qcGc=", "genarr": [4, 9] }, { "image": "https://resizing.flixster.com/4MxB_Jqij2BehOzt59yLg6Zf-T4=/206x305/v2/https://flxt.tmsimg.com/assets/p13266708_p_v10_aa.jpg", "genarr": [] }, { "image": "https://resizing.flixster.com/eU-Iigy02lj6McBRG6wwRyh9dY0=/206x305/v2/https://resizing.flixster.com/pPvNsZFVQywRvJXH3Yx0SIhGdvM=/ems.ZW1zLXByZC1hc3NldHMvbW92aWVzLzA1MjdlZDRlLTQ4NjctNGU2NC1hY2ViLTczODVhM2Y3ZGZkYy5qcGc=", "genarr": [4] }, { "image": "https://resizing.flixster.com/wfkCoD4FeCFQr9KmcB11aNH4JDs=/206x305/v2/https://flxt.tmsimg.com/assets/p16588174_p_v10_aa.jpg", "genarr": [9] }, { "image": "https://resizing.flixster.com/Ia47Tpse3SI9P8x-BTRi63na8VY=/206x305/v2/https://resizing.flixster.com/K4wqsqVXMfvbn2ocmAabX_OCdGs=/ems.ZW1zLXByZC1hc3NldHMvbW92aWVzLzI5Zjc4NTkwLWEyYWEtNDFhYS05NTYzLWUzOGEyNjQ3ZTFkYS5qcGc=", "genarr": [2, 11, 15] }, { "image": "https://resizing.flixster.com/dSFCZpyWmfNJj95o2IuPtUxNt8Y=/206x305/v2/https://flxt.tmsimg.com/assets/p12291885_p_v8_ab.jpg", "genarr": [2, 4] }, { "image": "https://resizing.flixster.com/5rmdAY0Y1Yg1vRj22ZkwpEcqIgY=/206x305/v2/https://flxt.tmsimg.com/assets/p15397618_p_v13_ad.jpg", "genarr": [4, 6, 7] }]
