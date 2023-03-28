import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
dotenv.config();
const token = process.env.TOKEN;
const bot = new TelegramBot(token, { polling: true });
export default bot;

import { anketa, anketaListiner } from './anketa.js';
anketa();
anketaListiner();

//const chatIds = ['-1001938112685', '-785368621', '-1001783798562']; // id двох тестових + третій тестовий канал + 4ий це нова група supergrop,'-100944130193',

import { getSpreadsheetData } from "./filedata.js";
const spreadsheetId = "1ORjtAykJySO0pzbmXO7LX9DAog5GqBZ_2NYh_89SRKA";
const range = "post";

// const scheduleMessages = async () => {
//     const data = await getSpreadsheetData(spreadsheetId, range);
// };
    //console.log(data);
  
// ЭТО РАБОЧИЙ КОД ОТПРАВКИ ЦИФРЫ В ТЕЛЕГРАМ И ОТПРАВКИ СТРОКИ В ГРУППУ
let chatId = '-1001783798562';
bot.on('message', async (message) => {
  // Check if message contains text
  if (message.text) {
    // Parse message text as a number
    const rowNumber = parseInt(message.text);
    // Call getRowData function with rowNumber
    await getRowData(spreadsheetId, 'post', rowNumber);
  }
});
const sendRowToTelegram = async (rowData) => {
  const message = rowData.join("\n");
  await bot.sendMessage(chatId, message);
};

const getRowData = async (spreadsheetId, sheetName, rowNumber) => {
  const range = `${sheetName}!A${rowNumber}:I${rowNumber}`;
  const data = await getSpreadsheetData(spreadsheetId, range);
  if (data.values && data.values.length > 0) {
    await sendRowToTelegram(data.values);
  }
};