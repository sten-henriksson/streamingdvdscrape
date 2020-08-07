//todo 3 tables mainindex todownload table and tofindhash table when removed from tofindhash table add to todownload table 
//gets titels of recent dv relases and adds it to db if its not already there and if its there just skip
const puppeteer = require('puppeteer')
const screenshot = 'youtube_fm_dreams_video.png'
const $ = require('cheerio');
const mysql = require('mysql');
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "moviedb"
});
con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});


try {
    (async () => {
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto("https://www.rottentomatoes.com/browse/top-dvd-streaming")
        //console.log(await page.content())
        $('h3', await page.content()).each(function () {
            //look if its already added if not then add it to 
            
            getnamefromdb($(this).text())
        });
    })()
} catch (err) {
    console.error(err)
}





function addtomovietable(name){
    
        var sql = "INSERT INTO movies (name) VALUES (?)";
        con.query(sql,[name],function (err, result) {
          if (err) throw err;
          console.log("1 record inserted");
          console.log(result.insertId);
          AddToScrapeTable(result.insertId)
        });
      
} 
function AddToScrapeTable(id){
    var sql = "INSERT INTO nohash (id) VALUES (?)";
    con.query(sql,[id],function (err, result) {
      if (err) throw err;
      console.log("id inserted "+id);
    
    });
}


function getnamefromdb(name){
    
    var sql = 'SELECT * FROM movies WHERE name = ? ';
    con.query(sql, [name], function (err, result) {
      if (err) throw err;
      if(result.length){
        console.log("alreadyindb")
      }
      else{
        addtomovietable(name)
        console.log("addtomovietable")
      }
      
    });
}
