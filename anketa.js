import bot from "./app.js";
import { writeSpreadsheetData } from "./writegoog.js";
import { sendToBase, sendToBaseStatusDone, sendToBaseStatusReserve } from './writegoog.js'
import { crawler, crawlerStatusNew, googleFindMessageId } from './crawler.js'
import { findStatusRaw } from "./getStatus.js";

import { deleteButton } from './button.js';
const chatId = '-1001783798562';
const messageId = '378';

let customerPhone;
let customerName;


const spreadsheetId = "1ORjtAykJySO0pzbmXO7LX9DAog5GqBZ_2NYh_89SRKA";
//const range = 'post!N5';
//const data = [['0674600500 імя Yevgen']];
const data = [];

const phoneRegex = /^\d{10,12}$/;

const phrases = {
  greetings: 'Привіт, якщо ви хочете зробити замовлення, натисніть кнопку "Зробити замовлення".',
  contactRequest: 'Нам потрібні ваші контактні дані. Отримати з контактних даних телеграм?',
  dataConfirmation: `Ваш номер телефону: ${customerPhone}. Ваше імя ${customerName}. Дані вірні?`,
  thanksForOrder: `Замовлення успішно оформлено. Дякую ${customerName}`,
  wrongName: 'Невірне ім\'я. Будь ласка, введіть своє справжнє ім\'я:',
  wrongPhone: 'Невірний номер телефону. Будь ласка, введіть номер телефону ще раз:',
  phoneRules: 'Введіть ваш номер телефону без +. Лише цифри. І відправте повідомлення',
  nameRequest: 'Введіть своє ім\'я:',
};

const keyboards = {
  startingKeyboard: [['Зробити замовлення']],
  contactRequest: [
    [
      {
        text: 'Так',
        request_contact: true,
      }
    ],
    ['Ні, я введу номер вручну'],
    ['/start'],
  ],
  dataConfirmation: [
    ['Так, Оформити замовлення'],
    ['Ні, повторити введення'],
    ['/start'],
  ],
  enterPhone: [
    ['/start']
  ]
}

const anketa = () => {
    bot.onText(/\/start/ , (msg) => {
        customerPhone = undefined;
        customerName = undefined
    bot.sendMessage(msg.chat.id, phrases.greetings, {
        reply_markup: {
        keyboard: keyboards.startingKeyboard,
        resize_keyboard: true,
        one_time_keyboard: true
    }
  });
});
};

//getSpreadsheetRow
const anketaListiner = async() => {
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;
  
  if (messageText === 'Зробити замовлення') {
    await deleteButton();
    // check reserve
    const reservTemp = await crawler(spreadsheetId, "post", "N");
    const statusNew = await crawlerStatusNew(spreadsheetId, "post", "N");
    
    if (statusNew === true) {
      bot.sendMessage(chatId, 'є замовлення від іншого користувача');
    
    } else if (reservTemp === true) {
      sendToBaseStatusReserve();
      bot.sendMessage(chatId, phrases.contactRequest, {
        reply_markup: {
        keyboard: keyboards.contactRequest,
        resize_keyboard: true,
      },
    });
    
  } else {
    bot.sendMessage(chatId, 'стоїть бронь');
  }
  
  } else if (msg.contact) {  //тут іде по витяганню з контактів
    customerPhone = msg.contact.phone_number;
    customerName = msg.contact.first_name;
    //console.log(customerPhone)
    bot.sendMessage(chatId, `Ваш номер телефону: ${customerPhone}. Ваше імя ${customerName}. Дані вірні?`, 
      {
        reply_markup: {
          keyboard: keyboards.dataConfirmation,
          resize_keyboard: true,
          one_time_keyboard: true
        },
      });
  } else if(messageText === 'Так, Оформити замовлення') {
    await deleteButton();
    await sendToBase(customerPhone, customerName);
    await sendToBaseStatusDone();
    bot.sendMessage(chatId, `Замовлення успішно оформлено. Дякую ${customerName}`);

  } else if (messageText === 'Почати спочатку') {
    bot.sendMessage(chatId, '/start');
  //тут іде по самостійному введенню
  } else if(messageText === `Ні, я введу номер вручну` || messageText === 'Ні, повторити введення') {
    customerPhone = undefined;
    customerName = undefined;  
    bot.sendMessage(chatId, phrases.phoneRules, 
      {
        reply_markup: {
          keyboard: keyboards.enterPhone,
          resize_keyboard: true,
        },
      });
  } else if (phoneRegex.test(messageText)) {
    customerPhone = messageText;
    bot.sendMessage(chatId, phrases.nameRequest);
  } else if (customerPhone && customerName == undefined ) {
    if (messageText.length >= 2) {
      customerName = messageText;
      bot.sendMessage(chatId, `Ваш номер телефону: ${customerPhone}. Ваше імя ${customerName}. Дані вірні?` , {
        reply_markup: {
          keyboard: keyboards.dataConfirmation,
          resize_keyboard: true,
          one_time_keyboard: true
        },
      });
    }
  } 
});
};

export {
    anketa,
    anketaListiner,
  };