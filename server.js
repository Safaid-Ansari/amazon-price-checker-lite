const puppeteer = require("puppeteer");
const cron = require("node-cron");

const nodemailer = require("nodemailer");

require("dotenv").config();

const url =
  "https://www.amazon.in/Apple-iPhone-13-128GB-Starlight/dp/B09G9D8KRQ/ref=sr_1_1?keywords=i%2Bphone%2B13&qid=1663738578&sr=8-1&th=1";
const targetPrice = 450;

let scraper = async (url) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);
  await page.waitForSelector(1000);
  const result = await page.evaluate(() => {
    let priceStr = document.querySelector(".a-price-whole").innerText;
    let priceInt = parseInt(priceStr.replace(/£/g, ""));
    console.log(title, priceInt);
    return {
      priceInt,
    };
  });
  browser.close();
  return result;
};

function sendEmail(result) {
  const mailOptions = {
    from: process.env.GMAIL_LOGIN, // sender address
    to: process.env.GMAIL_LOGIN, // list of receivers
    subject: `AMAZON PRICE TRACK - ${result.title} - PRICE: ${result.priceInt}`, // Subject line
    html: `<p>Go and buy it now <a href="${url}">HERE</a></p>`, // plain text body
  };
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_LOGIN,
      pass: process.env.GMAIL_PASSWORD,
    },
  });
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
    }
    console.log("Email Sent Successfully");
  });
}

function init() {
  scraper(url)
    .then((result) => {
      let currentPrice = result.priceInt;
      if (currentPrice < targetPrice) {
        sendEmail(result);
      }
    })
    .catch((err) => {
      console.log("Fatal Error", err);
    });
}

cron.schedule("1 * * * *", () => {
  console.log("Looking for a new price");
  init();
});
