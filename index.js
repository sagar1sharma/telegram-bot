import axios from "axios";
import cheerio, { text } from "cheerio";
import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import express from "express";

const app = express();
dotenv.config();
const bot = new TelegramBot(process.env.botToken, {polling: true});

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Hi! I am sagar, You may specify name of movies/series and I will provide you the download link, but do make sure to spell it correctly! /n remember, Title will be followed by magnet link that you have to copy and paste in the browser, then the download automatically start')});

bot.on('message', (msg) => {
    if (msg.text && !msg.text.startsWith('/start')) {
    const chatId = msg.chat.id;
    const searchTerm = msg.text.replace(/ /g, '%20');


    getDownloadLinks(searchTerm)
    .then(async(links) => {
        if(links.length > 0){
                  for(var i = 0; i < 10; i++){
                    const title = `${links[i].title}`;
                    await bot.sendMessage(chatId, title);

                    const message = `${links[i].magnetLink}`;
                    await bot.sendMessage(chatId, message);
                  }
                }
        else{
            bot.sendMessage(chatId, 'Sorry! make sure you spelled correctly!');
        }
    })
    .catch((err) => bot.sendMessage(chatId, 'Some error took place'));
}
});

async function getDownloadLinks(searchTerm){
    const url = 'https://thepiratebay10.info/search/'+ searchTerm;
    try{
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const links = [];
        var i = 0;

        $('tr').each((index, element) => {
            const titleElement = $(element).find('td:nth-child(2) a');
            const magnetLinkElement = $(element).find('td:nth-child(4) a[href^="magnet:?"]');
      
            if (titleElement.length > 0 && magnetLinkElement.length > 0) {
              const title = titleElement.text();
              const magnetLink = magnetLinkElement.attr('href');
              links.push({ title, magnetLink });
            }

          });
        
        return links;
    }
    catch(err){
        console.log('Error');
    }
}

app.listen(process.env.PORT || 3000, () => {
    console.log("Server started");
})

