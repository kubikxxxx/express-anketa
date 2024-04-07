const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");

const PORT = 3000;

app.use('/public', express.static('public', {
  setHeaders: (res, path, stat) => {
    if (path.endsWith('.css')) {
      res.set('Content-Type', 'text/css');
    }
  }
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); // aktivace slozek css a img
app.set("view engine", "ejs"); // nastavení EJS 

/* cesta k zobrazeni dom stranky */
app.get("/", (req, res) => {
  //tady bude formular
  res.render("index", { title: "Webová anketa" }); 
});

/* cesta ke zpracovnym datum */
app.post("/submit", (req, res) => {
  // data jdou do responses.json
  const newResponse = {
    id: Date.now(), //unikátní ID
    timestamp: new Date().toISOString(),
    answers: req.body,
  };

  // Čtení stávajících dat z souboru
  fs.readFile("responses.json", (err, data) => {
    if (err) throw err;
    let json = JSON.parse(data);
    json.push(newResponse);

    // Zápis aktualizovaných dat zpět do souboru
    fs.writeFile("responses.json", JSON.stringify(json, null, 2), (err) => {
      if (err) throw err;
      console.log("Data byla úspěšně uložena.");
      res.redirect("/results"); // Přesměrování na stránku s výsledky
    });
  });
});

/* Routa pro zobrazení výsledků ankety */
app.get("/results", (req, res) => {
  // Zde bude načtení dat ze souboru responses.json a jejich předání do šablony
  fs.readFile('responses.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Nastala chyba při čtení dat.');
    }
    const responses = JSON.parse(data);
    res.render('results', { title: "Výsledky ankety", responses }); // Předání dat-odpovědí šabloně results.ejs
  });
});

app.listen(PORT, () => {
  console.log(`Server běží na portu ${PORT}`);
});