import axios from "axios";
import cheerio, { text } from "cheerio";
import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();
const bot = new TelegramBot(process.env.botToken, {polling: true});

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Hi! I am sagar, You may specify name of movies/series and I will provide you the download link, but do make sure to spell it correctly!')
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const searchTerm = msg.text.replace(/ /g, '%20');


    getDownloadLinks(searchTerm)
    .then((links) => {
        if(links.length > 0){
                links.forEach((link) => {
                    const customServerURL = 'http://localhost:3001/';
                    const torrentLink = customServerURL+`download/`+link.magnetLink;
                    const message = `<b>${link.title}</b>\nMagnet Link: <a href="${torrentLink}"> Download </a>`;
                    bot.sendMessage(chatId, message, {parse_mode: 'HTML'});
                  });
                }
        else{
            bot.sendMessage(chatId, 'Sorry! make sure you spelled correctly!');
        }
    })
    .catch((err) => bot.sendMessage(chatId, 'Some error took place'));
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

