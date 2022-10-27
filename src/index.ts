import * as fxp from 'fast-xml-parser';
import * as md5 from 'js-md5';
// Function import node fs module
import * as fs from 'node:fs';

const url: string = 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml';

// Compose Function
function compose<A>(...fns: Function[]): Function {
 return (x : A) => fns.reduceRight((v, f) => f(v), x);
}

// Call url and return the response
async function get(url : string): Promise<string> {
 const response = await fetch(url);
 return await response.text();
}

// Function to convert XML to JSON using fast-xml-parser
function json(xml : string): Rss {
 const parser = new fxp.XMLParser();
 return parser.parse(xml);
}

// Function to get items from the JSON
function items(json : Rss): Item[] {
 return json.rss.channel.item;
}

// Function to hash string using xxhash
function hash(str : string): string {
 return md5(str);
}

// Function to write to file in data folder, saving file as hash of the item
function write(data : string): void {
 fs.writeFileSync(`data/${hash(data)}.json`, data);
}

type Item = {
 title: string;
 link: string;
 guid: string;
 "atom:link": string;
 description: string;
 "dc:creator": string;
 pubDate: string;
 category: string[];
 "media:content": string;
 "media:credit": string;
 "media:description": string;
}

type Image = {
 title: string;
 url: string;
 link: string;
}

type Channel = {
 title: string;
 link: string;
 "atom:link": string;
 description: string;
 language: string;
 copyright: string;
 lastBuildDate: string;
 pubDate: string;
 image: Image;
 item: Item[];
}

type Rss = {
 rss: {
  "@version": string;
  "@xmlns:media": string;
  "@xmlns:atom": string;
  "@xmlns:dc": string;
  channel: Channel;
 }
}

const ops: Function[] = [
  json,
  items
];
ops.reverse();

// Compose the functions
const op = compose(...ops);

// Call the op function
const result = op(await get(url));
result.forEach((item: Item) => {
  const text : string = JSON.stringify(item, null, 2);
  write(text);
  console.log(text);
});