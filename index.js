const puppeteer = require('puppeteer');

const express = require('express')
const http = require('http')
const path = require('path');
const app = express()
const server = http.createServer(app)
const cors = require('cors')
const bodyParser = require('body-parser');


const port = process.env.PORT || 4000
server.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

app.use(
    cors({
        origin: 'http://localhost:4000',
        credentials: true
    })
);
app.use(express.static(__dirname + '/public'));

app.use('/getVal', async(req, res, next) => {
    console.log(req.body)
    let MoyenneValue = await getMoyenne(req.body.mdp, req.body.id)
    res.status(200).json({ val: MoyenneValue })
})

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

const getMoyenne = async(password, identifiant) => {
        const waitTime = 1000
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox']
    });
    //try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 })

    await page.goto('https://cas.monbureaunumerique.fr/login?service=https%3A%2F%2Fwww.monbureaunumerique.fr%2Fsg.do%3FPROC%3DIDENTIFICATION_FRONT');
    await page.click('body > main > div > div > div > div > div > form > div:nth-child(1) > div > label')

    await Promise.all([
        await page.click('#button-submit'),
        page.waitForNavigation()
    ])

    // connexion
    await page.type('#username', identifiant)
    await page.type('#password', password);
    //await page.click('#bouton_valider')
    // command inside MBN
    page.waitForNavigation()
    await page.click('#bouton_valider')

    console.log("la")
    try {
        await page.waitForSelector('body > div.header > div.dropdown.dropdown--inverted.header__portals.dropdown--right.js-dropdown > button', { visible: true, timeout: 750 })
        await page.click('body > div.header > div.dropdown.dropdown--inverted.header__portals.dropdown--right.js-dropdown > button')
    } catch {
        await browser.close()
        return "Vous devez renseignez un mot de passe ou un identifiant correcte"
    }
    //await sleep(waitTime)
    console.log("la1")
    page.waitForSelector('body > div.header > div.dropdown.dropdown--inverted.header__portals.dropdown--right.js-dropdown.dropdown--is-opened > div > ul > li:nth-child(1) > a')
        .then(async() => {
            await page.click('body > div.header > div.dropdown.dropdown--inverted.header__portals.dropdown--right.js-dropdown.dropdown--is-opened > div > ul > li:nth-child(1) > a')
        })
    await sleep(waitTime)
    console.log("la2")
    try {
        await page.click('#js-menu > ul.services-list.services-list--shortcut > li:nth-child(6) > a')
    } catch {
        await browser.close()
        return "Votre compte MBN n'a pas acc??s ?? l'ongelt '??valuation'"
    }
    await sleep(waitTime)

    console.log("la3")
        // r??cupere les notes

    let exit = false
    let i = 0
    let note = []
    let floatNote = []

    while (exit === false) {
        console.log()
        try {
            await page.waitForSelector(`#yui-rec${i} > td.yui-dt0-col-moyenneEleve.yui-dt-col-moyenneEleve.yui-dt-sortable > div`, { visible: true, timeout: 500 })
            let element = await page.$(`#yui-rec${i} > td.yui-dt0-col-moyenneEleve.yui-dt-col-moyenneEleve.yui-dt-sortable > div`)
            let value = await page.evaluate(el => el.textContent, element)
            console.log(value)
            note.push(value)
            i++
        } catch {
            if (i == 0) {
                await browser.close()
                return "Vous ne poss??dez pas de note"
            }
            exit = true
            break;
        }
    }

    if (exit == true) {
        // convertir en float les notes
        for (let x = 0; x < note.length; x++) {
            let value = parseFloat(note[x].replace(",", "."));
            floatNote.push(value)

        }

        // calculer la moyenne
        let somme = 0
        let moyenne = 0
        for (let x = 0; x < floatNote.length; x++) {
            somme += floatNote[x]
        }
        moyenne = somme / floatNote.length
        arrondi = moyenne * 100;
        arrondi = Math.round(arrondi);
        arrondi = arrondi / 100;
        await browser.close()
        return `T'as moyenne est de : ${arrondi}`
    }
    /* } catch {
         await browser.close()
         return "identifiant ou mot de passe incorrecte"
     }*/
}
