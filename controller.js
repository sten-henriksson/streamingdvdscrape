const model = require('./model')


exports.upsert = async function upsertRow(movieobj) {
    await model.movieList.upsert({
        name: movieobj.name, image: movieobj.image, genreArray: JSON.stringify(movieobj.genarr), moviedataurl: movieobj.moviedataurl
    })
    let getid = await model.movieList.findOne({
        where: {
            moviedataurl: movieobj.moviedataurl
        }
    });
    await model.nodownload.upsert({
        id:getid.id
    })
    console.log(getid.id);
};