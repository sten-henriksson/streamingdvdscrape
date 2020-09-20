const puppeteer = require('puppeteer')
const screenshot = 'youtube_fm_dreams_video.png'
const $ = require('cheerio');
const mysql = require('mysql');
const { get } = require('request-promise');

function GetMLinks(url) {
    return new Promise(resolve => {

        try {
            (async () => {
                const browser = await puppeteer.launch()
                const page = await browser.newPage()
                await page.goto(url)
                let sendjson = { "image": "", "genarr": [] }
                let genrearray = ["music", "musical", "comedy", "western", "drama", "sci", "mystery", "thriller", "fantasy", "romance", "horror", "kid", "documentaries", "animated", "action", "adventure"]
                //console.log(await page.content())
                $('div', await page.content()).each(function () {
                    //look if its already added if not then add it to 
                    //console.log($(this).attr().class)
                    if ($(this).attr().class == "meta-value genre") {

                        //resolve($(this).attr().src)

                        console.log($(this).text())
                        let genrestring = $(this).text()
                        genrearray = genrearray.map(function (genre, index) {


                            if (genrestring.includes(genre)) {
                                console.log(index)
                                return index
                            }

                        })
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

            })()
        } catch (err) {
            console.error(err)
        }
    });
}
async function startscrape() {
    console.log(JSON.stringify(await GetMLinks("https://www.rottentomatoes.com/m/lost_girls_and_love_hotels")))
}
startscrape()