var Discord = require('discord.io');
var giantbomb = require('giantbomb');
var auth = require('../auth.json');

var gb = giantbomb(auth.gbtoken);
var bot = new Discord.Client({
    token: auth.token,
    autorun: true
});

bot.on('ready', function (evt) {
    console.log('Connected');
    console.log('Logged in as ' + bot.username + ' - (' + bot.id + ')');
});

function buildMessage(json) {
    var message = "";
    for (var i = 0; i < json.number_of_total_results; ++i) {
        var result = json.results[i];
        message += "**" + result.name + "** (" + getDate(result.original_release_date) + ")\n";
        message += result.image + "\n";
        message += result.deck + "\n\n";
    }
    return message;
}

function sendToChat(channelID, message, image = false) {
    if (image) {
        bot.uploadFile({
            to: channelID,
            file: image,
            message: message
        });
    }
    else {
        bot.sendMessage({
            to: channelID,
            message: message,
            typing: true
        });
    }
}

function getDate(dateString) {
    const monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];
    var date = new Date(dateString);
    return monthNames[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
}

bot.on('message', function (user, userID, channelID, message, event) {
    if (message.includes('!find')) {
        var gameName = message.replace("!find ", "");
        const config = {
            sortBy: 'original_release_date',
            sortDir: 'asc'
        };
        gb.games.search(gameName, config, (err, res, json) => {
            if (!err) {
                sendToChat(
                    channelID,
                    json.number_of_total_results > 10
                        ? "Buddy, do you have any idea how many " + gameName + " games there are?! You need to narrow it down for me."
                        : json.number_of_total_results === 0
                            ? "That's not a thing."
                            : buildMessage(json));
            }
            else {
                sendToChat(channelID, "Something bad happened. I blame you. Or the universe.");
            }
        });
    }
});
