/*
Website Shopping List
*/

import * as express from "express";  // express bereitstellen
const fs = require('fs'); // Zugriff auf Dateisystem

// Klasse für Einträge in der Shopping List
class ListElement {
    private name: string;
    private toBuy: string;
    private store: string;
    private date: string;
    private status: number;
    private readonly id: number;
    private static id_max: number = 0;
    private static stack: ListElement[] = [];

    constructor(name: string, toBuy: string, store: string, date: string, status: number) {
        this.id = ++ListElement.id_max;
        this.name = name;
        this.toBuy = toBuy;
        this.store = store;
        this.date = date;
        this.status = status;
        ListElement.stack.push(this);
    }

    // Getter-Methoden
    public getName(): string {
        return this.name;
    }
    public getToBuy(): string {
        return this.toBuy;
    }
    public getStore(): string {
        return this.store;
    }
    public getDate(): string {
        return this.date;
    }
    public getStatus(): number {
        return this.status;
    }
    public getID(): number {
        return this.id;
    }
    public static getListElementStack(): ListElement[] {
        return ListElement.stack;
    }

    // Setter-Methoden
    public setName(name: string) {
        this.name = name;
    }
    public setToBuy(toBuy: string) {
        this.toBuy = toBuy;
    }
    public setStore(store: string) {
        this.store = store;
    }
    public setDate(date: string) {
        this.date = date;
    }
    public setStatus(status: number) {
        this.status = status;
    }
}

// Klasse für Liste aller ListElements
class ListOfElements {
    public list: ListElement[];

    constructor() {
        this.list = [];
    }

    // Zum Durchsuchen der Liste
    public getListElement(id: number): ListElement {
        let element: ListElement = undefined;
        for (let i of this.list) {
            if (id === i.getID()) {
                element = i;
            }
        }
        return element;
    }
}

// Hilfsklasse um JSON-Datei zu konvertieren
// Mit Elementen aus Liste werden LogElemente erstellt, die
// In einer JSON gespeichert werden können - nur nötige Informationen
class LogElement {
    private name: string;
    private toBuy: string;
    private store: string;
    private date: string;
    private status: number;

    constructor(name: string, toBuy: string, store: string, date: string, status: number) {
        this.name = name;
        this.toBuy = toBuy;
        this.store = store;
        this.date = date;
        this.status = status;
    }
}

// Zum Sichern der ListOfElements (der Liste) in Datei
function saveList(listOfElements: ListOfElements, file: string): string {
    if (logRequest) console.log("function saveList() gestartet.");

    // Speichert Elemente aus aktueller List als neue Objekte der Hilfsklasse in Array
    const logElements: LogElement[] = [];
    for (let i of currentList.list) {
        logElements.push(new LogElement(i.getName(), i.getToBuy(), i.getStore(), i.getDate(), i.getStatus()));
    }

    // Konvertiert erstelltes Array in JSON-String
    const currentListJSON = JSON.stringify(logElements);

    // Schreibt erstellte JSON-String in Datei im Pfad file
    fs.writeFile(file, currentListJSON, (err) => {
        if (err) {
            if (logRequest) console.log("Liste konnte nicht gespeichert werden:");
            if (logRequest) console.log(err);
        } else {
            if (logRequest) console.log("Aktuelle Liste gesichert in der Datei: ", file);
        }

    });
    return currentListJSON;
}

function readRow(listElement: ListElement): string {
    if (logRequest) console.log("function readRow() gestartet.");

    // Übernimmt Werte des aktuellen Elements und erstellt Tabellenzeile
    let name = listElement.getName();
    let toBuy = listElement.getToBuy();
    let store = listElement.getStore();
    let date = listElement.getDate();
    let id = listElement.getID();

    return `
        <tr id='row${id}' class='noborder'>
            <td class='listelement'>
                <button title='Beabeiten' id='edit-${id}' class='edit_box' type='submit' formnovalidate>
                    ${name}
                </button>
            </td>
            <td class='listelement'>
                <button title='Beabeiten' id='edit-${id}' class='edit_box' type='submit' formnovalidate>
                    ${toBuy}
                </button>
            </td>
            <td class='listelement'>
                <button title='Beabeiten' id='edit-${id}' class='edit_box' type='submit' formnovalidate>
                    ${store}
                </button>
            </td>
            <td class='listelement'>
                <button title='Beabeiten' id='edit-${id}' class='edit_box' type='submit' formnovalidate>
                    ${date}
                </button>
            </td>
            <td class='editelement'>
                <button title='Bearbeiten' id='edit-${id}' class='table_button' type='submit' formnovalidate>
                    <img class='button_icon' src='../image/edit-ico.png' alt='Bearbeiten'>
                </button>
                <button title='Löschen' id='delete-${id}' class='table_button' type='submit' formnovalidate>
                    <img class='button_icon' src='../image/trash-ico.png' alt='Löschen'>
                </button>
            </td>
        </tr>
    `;
}

// Aktuelle Liste (übergebene Liste) wird als Tabelleninhalt für html aufbereitet
function createTable(listOfElements: ListOfElements): string {
    if (logRequest) console.log("function createTable() gestartet.");

    // setzt vorherige Tabelle zurück
    let tablecontent_html: string = "";

    // Sofern abgerufenes Element aus Liste aktiv ist, wird dieses für die Dartellung aufgearbeitet
    for (let i: number = listOfElements.list.length - 1; i >= 0; i--) {
        // Prüft ob einzelne Elemente aktiv sind (Status 1)
        if (listOfElements.list[i].getStatus() === 1) {
            // Aufruf der Funktion für jedes aktive Element
            tablecontent_html += readRow(listOfElements.list[i]);
        }
    }
    return tablecontent_html;
}

// Darstellung falls bestehender Eintrag zum Editieren ausgewählt wird
function createEditRow(elementToChange: ListElement): string {
    if (logRequest) console.log("function createEditRow() gestartet.");

    // Abruf der Daten des zu bearbeitenden Elementes
    let editID = elementToChange.getID();
    let name = elementToChange.getName();
    let toBuy = elementToChange.getToBuy();
    let store = elementToChange.getStore();
    let date = elementToChange.getDate();

    return `
        <td class='new_listelement'>
            <input type='text' id='new_wer' class='textfield' autocomplete='off' placeholder='Wer?' value='${name}' required>
        </td>
        <td class='new_listelement'>
            <input type='text' id='new_was' class='textfield' autocomplete='off' placeholder='Was?' value='${toBuy}' required>
        </td>
        <td class='new_listelement'>
            <input type='text' id='new_wo' class='textfield' autocomplete='off' placeholder='Wo?' value='${store}' required>
        </td>
        <td class='new_listelement'>
            <input type='text' id='new_wann' class='textfield' autocomplete='off' placeholder='Wann?' value='${date}' required>
        </td>
        <td class='editelement'>
            <button title='Speichern' id='save-${editID}' class='table_button' type='submit'>
                <img class='button_icon' src='../image/save-ico.png' alt='Speichern'>
            </button>
            <button title='Löschen' id='delete-${editID}' class='table_button' type='submit' formnovalidate>
                <img class='button_icon' src='../image/trash-ico.png' alt='Löschen'>
            </button>
            <button title='Verwerfen' id='return-${editID}' class='table_button' type='submit' formnovalidate>
                <img class='button_icon' src='../image/return-ico.png' alt='Verwerfen'>
            </button>
        </td>
    `;
}

// Darstellung neuer Zeile zum Ergänzen von Elementen
function createNewRow(): string {
    if (logRequest) console.log("function createNewRow() gestartet.");

    return `
        <td class='new_listelement'>
            <input type='text' id='new_wer' class='textfield' autocomplete='off' placeholder='Wer?' value='${username}' required>
        </td>
        <td class='new_listelement'>
            <input type='text' id='new_was' class='textfield' autocomplete='off' placeholder='Was?' required>
        </td>
        <td class='new_listelement'>
            <input type='text' id='new_wo' class='textfield' autocomplete='off' placeholder='Wo?' required>
        </td>
        <td class='new_listelement'>
            <input type='text' id='new_wann' class='textfield' autocomplete='off' placeholder='Wann?' value='${getDate()}' required>
        </td>
        <td class='editelement'>
            <button title='Speichern' id='save-new' class='table_button' type='submit'>
                <img class='button_icon' src='../image/save-ico.png' alt='Speichern'>
            </button>
            <button title='Verwerfen' id='return-new' class='table_button' type='submit' formnovalidate>
                <img class='button_icon' src='../image/return-ico.png' alt='Verwerfen'>
            </button>
        </td>
    `;
}

// Gibt Datum im richtigen Format als String aus
function getDate(): string {
    let date: string = new Date().toISOString();
    let output: string = "";
    for (let i: number = 0; i <= 9; i++) {
        output += date[i];
    }
    return output;
}

// Gibt Datum für die Sicherung der Datein aus
function dateConverted(): string {
    let date: string = (new Date()).toISOString();
    let newDate: string = "";
    for (let i: number = 0; i < date.length; i++) {
        // Ersetzt alle Doppelpunkte
        if (date[i] === ":") {
            newDate += "-";
        } else {
            newDate += date[i];
        }
    }
    return newDate
}


// SERVER
// Webseitenbezeichnung
const websiteName: string = "Shopping-List";
const version: string = '1.0';
// aktueller User - Zuweisung nach Eingabe seitens Client
let username: string;
// Legt neues Objekt der Klasse ListOfElements als Liste an
let currentList: ListOfElements = new ListOfElements();
// Zählt Anfragen seitens Client
let runCounter: number = 0;
// Einstellung, ob Informationen über Konsole ausgegeben werden sollen
let logRequest: boolean = true;
// Zeitpunkt des Serverstarts
const runDate: string = dateConverted();

// Pfad zuletzt gespeicherten Log und Zielpfad neuer Sicherungen
const currentLog: string = "log/listLog.json";
const saveLog: string = "log/listLog_";

// Liest JSON-Datei der letzten ListOfElements ein falls vorhanden
fs.readFile(currentLog, "utf-8", (err, jsonData) => {
    // Falls kein vorheriges Log gefunden werden konnte ist neue Liste leer
    if (err) {
        currentList.list = [];
        if (logRequest) {
            console.log("Keine vorherigen Daten gefunden. Leere Liste erstellt.");
        }

    // Andernfalls wird ein Array aus der JSON Datei erstellt und die einzelnen
    // Elemente des neuen Arrays als neue ListElement-Objekte in ListOfElements gesichert
    } else {
        // JSON aus den eingelesenen Daten
        const arrFromJSON = JSON.parse(jsonData);
        for (let i of arrFromJSON) {
            currentList.list.push(new ListElement(i.name, i.toBuy, i.store, i.date, i.status));
        }
        if (logRequest) console.log("Liste eingelesen. Anzahl der Einträge: ", currentList.list.length);
    }
});

// Server Werte
const server = express();
const serverPort: number = 8080;
const serverName: string = websiteName + " " + version;
server.listen(serverPort);
console.log("Der Server \"" + serverName + "\" steht auf Port ", serverPort, "bereit. \nServerstart: ", runDate);

// Auswertung von URLencoded und JSON ermöglichen
server.use(express.urlencoded({extended: false}));
server.use(express.json());

// Verzeichnis des Servers und Ordner die genutzt werden sollen
let rootDirectory = __dirname;
server.use("/style", express.static(rootDirectory + "/style"));
server.use("/image", express.static(rootDirectory + "/image"));
server.use("/script", express.static(rootDirectory + "/script"));
console.log("root directory: ", rootDirectory);

// REQUESTS
// Übergabe der index.html
server.get("/", (req: express.Request, res: express.Response) => {
    if (logRequest) console.log("GET /");
    res.status(200);
    res.sendFile(rootDirectory + "/html/index.html");
});
// Übergabe des Icons
server.get("/icon", (req: express.Request, res: express.Response) => {
    if (logRequest) console.log("GET icon");
    res.status(200);
    res.sendFile(rootDirectory + "/image/logo-ico.png");
});
// Übergabe des Servernamens
server.get("/version", (req: express.Request, res: express.Response) => {
    if (logRequest) console.log("GET version");
    res.status(200);
    res.send(serverName);
});

// Zu übermittelnde Daten abhängig von Clientanfrage
// Nach Login, Übertrag Nutzer
server.post("/login", (req: express.Request, res: express.Response) => {
    // Anfragezähler erhöhen
    ++runCounter;

    // Username vom Client ermitteln
    const user_name: string = String(req.body.user_name);
    username = user_name;

    if (logRequest) console.log("POST /login: ", runCounter, "\nUser: ", user_name);

    // Bestätigung an Client senden
    res.status(200);
    res.send("Erfolgreich als \"" + user_name + "\" angemeldet.");
});

// Neuer Listeneintrag soll gespeichert werden
server.post("/create", (req: express.Request, res: express.Response) => {
    // Anfragezähler erhöhen
    ++runCounter;

    // Wert vom Client übertragenen JSON entnehmen
    const name: string = String(req.body.name);
    const toBuy: string = String(req.body.toBuy);
    const store: string = String(req.body.store);
    const date: string = String(req.body.date);

    if (logRequest) console.log("POST /create: ", runCounter);

    // Entnommene Werte als neues ListElement zur Liste hinzufügen
    currentList.list.push(new ListElement(name, toBuy, store, date, 1));

    // Änderungen in aktueller Liste werden in aktueller Log-Datei gesichert
    saveList(currentList, currentLog);

    // Mit aktualisierter Liste neue html generieren und an Client senden
    const tablecontent_html = createTable(currentList)
    res.status(200);
    res.send(tablecontent_html);
});

// Formular für neuen Eintrag
server.get("/create", (req: express.Request, res: express.Response) => {
    // Anfragezähler erhöhen
    ++runCounter;

    if (logRequest) console.log("GET /create: ", runCounter);

    // Sendet Bearbeitungszeile für neues Element
    const newRow_html = createNewRow();
    res.status(200);
    res.send(newRow_html);
});

// Übermittelt Listeneinträge als Tabelle an Client, falls möglich
server.get("/read", (req: express.Request, res: express.Response) => {
    // Anfragezähler erhöhen
    ++runCounter;

    const listLength = currentList.list.length;
    if (logRequest) console.log("GET /read: ", runCounter, "\nAnzahl Elemente: ", listLength);

    // Falls keine Liste definiert wurde, um Fehler aufzufangen
    if (currentList === undefined) {
        res.status(404)
        res.send("Liste existiert nicht.");

    // Andernfalls Tabelle als html generieren und an Client senden
    } else {
        const tablecontent_html = createTable(currentList);
        res.status(200);
        res.send(tablecontent_html);
    }
});

// Übermittelt ausgewählte Zeile aufbereitet zur Bearbeitung
server.post("/read", (req: express.Request, res: express.Response) => {
    // Anfragezähler erhöhen
    ++runCounter;

    // ID zu bearbeitender Zeile aus vom Client übertragenen JSON entnehmen
    const editID: number = Number(req.body.editID);

    // Sucht anhand empfangener ID Liste nach Element durch
    const editElement = currentList.getListElement(editID);

    if (logRequest) console.log("Post /read: ", runCounter, "\nAusgewähltes Element: [", editID, "] ", editElement);

    // Falls Liste undefiniert ist oder ListElement anderen Status als aktiv hat, wird abgebrochen
    if (currentList === undefined || editElement.getStatus() !== 1) {
        res.status(404)
        res.send("Element mit der ID [" + editID + "] existiert nicht.");

    // Andernfalls wird Bearbeitungsansicht für entsprechende Zeile an Client gesendet
    } else {
        const rowedit_html = createEditRow(editElement);
        res.status(200);
        res.send(rowedit_html);
    }
});

// Übermittelte Änderung durch Client für Listeneintrag in aktueller LOG sichern
server.post("/update", (req: express.Request, res: express.Response) => {
    // Anfragezähler erhöhen
    ++runCounter;

    // Neue Werte aus der vom Client übertragenen JSON übernehmen
    const editID: number = Number(req.body.editID);
    const name: string = String(req.body.name);
    const toBuy: string = String(req.body.toBuy);
    const store: string = String(req.body.store);
    const date: string = String(req.body.date);

    if (logRequest) console.log("GET /update: ", runCounter, "\nAusgewähltes Element: [", editID, "] ");

    // Zu überschreibendes Element aus Liste suchen
    const changedElement = currentList.getListElement(editID);

    // Falls Liste undefiniert ist oder ListElement anderen Status als aktiv hat, wird abgebrochen
    if (changedElement === undefined || changedElement.getStatus() !== 1) {
        res.status(404)
        res.send("Element mit der ID [" + editID + "] existiert nicht.");

    // Andernfalls Werte für Listenelement überschreiben
    } else {
        changedElement.setName(name);
        changedElement.setToBuy(toBuy);
        changedElement.setStore(store);
        changedElement.setDate(date);

        // Liste mit bearbeitetem Element sichern
        saveList(currentList, currentLog);

        // HTML für Tabelle neu generieren und Bestätigung an Client senden
        createTable(currentList)
        res.status(200);
        res.send("Element mit der ID [" + editID + "] geändert.");
    }
});

// Falls ein Element gelöscht werden soll
server.post("/delete", (req: express.Request, res: express.Response) => {
    // Anfragezähler erhöhen
    ++runCounter;

    // ID zu löschenden Elementes aus vom Client übertragenen JSON entnehmen
    const editID: number = Number(req.body.editID);

    // Zu löschendes Element anhand ID aus Liste wählen
    const elementToDelete = currentList.getListElement(editID);

    if (logRequest) console.log("Post /delete: ", runCounter, "\nAusgewähltes Element: [", editID, "] ", elementToDelete);

    // Falls Liste undefiniert ist oder ListElement anderen Status als aktiv hat, wird abgebrochen
    if (elementToDelete === undefined || elementToDelete.getStatus() !== 1) {
        res.status(404)
        res.send("Element mit der ID [" + editID + "] existiert nicht.");

    // Andernfalls wird Status des zu löschenden Elementes auf deaktiviert gesetzt und Liste aktualisiert
    } else {
        elementToDelete.setStatus(2);

        // Sichert aktualisierte Liste in aktueller Log Datei
        saveList(currentList, currentLog);

        // HTML für Tabelle neu generieren und Bestätigung an Client senden
        //const tablecontent_html = createTable(currentList);
        res.status(200);
        res.send("Element mit der ID [" + editID + "] gelöscht.");
    }
});

// Sobald nach fertiger Bearbeitung der Liste aktuelle Log in neuer Datei gesichert werden soll
server.get("/save", (req: express.Request, res: express.Response) => {
    // Anfragezähler erhöhen
    ++runCounter;

    if (logRequest) console.log("Get /save: ", runCounter);

    // Bestimmt Dateinamen
    const runDate: string = dateConverted();
    const newLog: string = saveLog + runDate + ".json";

    // Sichern der aktuellen Liste in Datei newSaveLog
    saveList(currentList, newLog);

    // Bestätigung an Client senden
    res.status(200);
    res.send("Liste gesichert");
});

// Falls Anfrage vom Client nicht bearbeitet werden kann und um Fehler aufzufangen
server.use((req, res) => {
    // Anfragezähler erhöhen
    ++runCounter;

    // Vom Client angefrangte URL
    const reqURL: string = req.url;

    if (logRequest) console.log("Fehler 404: ", reqURL);

    // Fehlernachricht an Client senden
    res.status(404);
    res.set('content-type', 'text/plain; charset=utf-8')
    res.send(reqURL + "\nDie Anfrage konnte vom Webserver nicht bearbeitet werden!");
});

