const puppeteer = require("puppeteer");
const fs = require("fs");

// const { postGenerator}=require("../Outerbase Testing/gpt");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: "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",
});
let news = [];
async function run(link) {
  const url = `https://economictimes.indiatimes.com/tech/${link}`;
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
  });
  const page = await browser.newPage();
  await page.goto(url);

  const newsHandles = await page.$$(".article-list> .story-box.clearfix");

  for (const newshandle of newsHandles) {
    const titleElement = await newshandle.$("div.desc > h4 > a");

    const title = await page.evaluate(
      (el) => el.querySelector("div.desc > h4 > a").textContent,
      newshandle
    );
    const link = await page.evaluate(
      (el) => el.getAttribute("href"),
      titleElement
    );
    const about = await page.evaluate(
      (gl) => gl.querySelector(" div.desc > p").textContent,
      newshandle
    );

    news.push({
      title: title,
      desc: about,
      link: `economictimes.indiatimes.com${link}`,
    });
  }

  browser.close();
  console.log(news);
  return await postGenerator(news);
}
async function postGenerator(newsArray) {
  console.log(typeof newsArray);
  //console.log("array printing", newsArray);
  let prompt = `I am giving you a number of news objects which may contain names, descriptions, and links. Now, create a beautiful LinkedIn post by modifying the text, grammar, and summarizing it.  The news is:\n\n`;
  let prompt2 = `You are a news reporter who is an expert in his field, using the following news, create a LinkedIn post that is engaging and informative.Use snarky and casual undertone but make it a detailed and thought-provoking post. Constraints : do not include pretext or context in your response, only return the linkedin post. enforce Maximum 500 charecters. The news is:\n\n`;
  newsArray.forEach((news) => {
    prompt2 += `Title: ${news.title}\n`;
    prompt2 += `Link: ${news.link}\n`;
    prompt2 += `Description: ${news.desc}\n\n`;
  });

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt2,
      },
    ],
    model: "gpt-3.5-turbo",
  });

  const response = completion.choices[0].message.content;
  //console.log(response);
  return response;
}

// try{
//    run("funding");
// }catch(e){
//   console.log(e);
// }
module.exports = { run };
