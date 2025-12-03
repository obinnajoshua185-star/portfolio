const http = require("http");
const url = require("url");

const quotes = [
  {
    id: 1,
    quote: "Be yourself; everyone else is already taken.",
    author: "Oscar Wilde",
  },
  {
    id: 2,
    quote:
      "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.",
    author: "Albert Einstein",
  },
  {
    id: 3,
    quote: "A room without books is like a body without a soul.",
    author: "Marcus Tullius Cicero",
  },
  {
    id: 4,
    quote:
      "Be who you are and say what you feel, because those who mind don't matter, and those who matter don't mind",
    author: "Bernard M. Baruch",
  },
  {
    id: 5,
    quote: "You only live once, but if you do it right, once is enough.",
    author: "Mae West",
  },
];

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  // Enable CORS - THIS IS THE FIX!
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (path === "/quote") {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(randomQuote));
  } else if (path === "/quotes") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(quotes));
  } else if (path.startsWith("/quotes/")) {
    const id = parseInt(path.split("/")[2], 10);
    const quote = quotes.find((q) => q.id === id);

    if (quote) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(quote));
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Quote not found" }));
    }
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not Found" }));
  }
});

server.listen(3001, () => {
  console.log("Server running at http://localhost:3001/");
});
