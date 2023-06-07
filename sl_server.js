"use strict";
/*
Website Shopping List
*/
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express"); // express bereitstellen
var fs = require('fs'); // Zugriff auf Dateisystem
// Klasse für Einträge in der Shopping List
var ListElement = /** @class */ (function () {
    function ListElement(name, toBuy, store, date, status) {
        this.id = ++ListElement.id_max;
        this.name = name;
        this.toBuy = toBuy;
        this.store = store;
        this.date = date;
        this.status = status;
        ListElement.stack.push(this);
    }
    // Getter-Methoden
    ListElement.prototype.getName = function () {
        return this.name;
    };
    ListElement.prototype.getToBuy = function () {
        return this.toBuy;
    };
    ListElement.prototype.getStore = function () {
        return this.store;
    };
    ListElement.prototype.getDate = function () {
        return this.date;
    };
    ListElement.prototype.getStatus = function () {
        return this.status;
    };
    ListElement.prototype.getID = function () {
        return this.id;
    };
    ListElement.getListElementStack = function () {
        return ListElement.stack;
    };
    // Setter-Methoden
    ListElement.prototype.setName = function (name) {
        this.name = name;
    };
    ListElement.prototype.setToBuy = function (toBuy) {
        this.toBuy = toBuy;
    };
    ListElement.prototype.setStore = function (store) {
        this.store = store;
    };
    ListElement.prototype.setDate = function (date) {
        this.date = date;
    };
    ListElement.prototype.setStatus = function (status) {
        this.status = status;
    };
    ListElement.id_max = 0;
    ListElement.stack = [];
    return ListElement;
}());
// Klasse für Liste aller ListElements
var ListOfElements = /** @class */ (function () {
    function ListOfElements() {
        this.list = [];
    }
    // Zum Durchsuchen der Liste
    ListOfElements.prototype.getListElement = function (id) {
        var element = undefined;
        for (var _i = 0, _a = this.list; _i < _a.length; _i++) {
            var i = _a[_i];
            if (id === i.getID()) {
                element = i;
            }
        }
        return element;
    };
    return ListOfElements;
}());
// Hilfsklasse um JSON-Datei zu konvertieren
// Mit Elementen aus Liste werden LogElemente erstellt, die
// In einer JSON gespeichert werden können - nur nötige Informationen
var LogElement = /** @class */ (function () {
    function LogElement(name, toBuy, store, date, status) {
        this.name = name;
        this.toBuy = toBuy;
        this.store = store;
        this.date = date;
        this.status = status;
    }
    return LogElement;
}());
// Zum Sichern der ListOfElements (der Liste) in Datei
function saveList(listOfElements, file) {
    if (logRequest)
        console.log("function saveList() gestartet.");
    // Speichert Elemente aus aktueller List als neue Objekte der Hilfsklasse in Array
    var logElements = [];
    for (var _i = 0, _a = currentList.list; _i < _a.length; _i++) {
        var i = _a[_i];
        logElements.push(new LogElement(i.getName(), i.getToBuy(), i.getStore(), i.getDate(), i.getStatus()));
    }
    // Konvertiert erstelltes Array in JSON-String
    var currentListJSON = JSON.stringify(logElements);
    // Schreibt erstellte JSON-String in Datei im Pfad file
    fs.writeFile(file, currentListJSON, function (err) {
        if (err) {
            if (logRequest)
                console.log("Liste konnte nicht gespeichert werden:");
            if (logRequest)
                console.log(err);
        }
        else {
            if (logRequest)
                console.log("Aktuelle Liste gesichert in der Datei: ", file);
        }
    });
    return currentListJSON;
}
function readRow(listElement) {
    if (logRequest)
        console.log("function readRow() gestartet.");
    // Übernimmt Werte des aktuellen Elements und erstellt Tabellenzeile
    var name = listElement.getName();
    var toBuy = listElement.getToBuy();
    var store = listElement.getStore();
    var date = listElement.getDate();
    var id = listElement.getID();
    return "\n        <tr id='row" + id + "' class='noborder'>\n            <td class='listelement'>\n                <button title='Beabeiten' id='edit-" + id + "' class='edit_box' type='submit' formnovalidate>\n                    " + name + "\n                </button>\n            </td>\n            <td class='listelement'>\n                <button title='Beabeiten' id='edit-" + id + "' class='edit_box' type='submit' formnovalidate>\n                    " + toBuy + "\n                </button>\n            </td>\n            <td class='listelement'>\n                <button title='Beabeiten' id='edit-" + id + "' class='edit_box' type='submit' formnovalidate>\n                    " + store + "\n                </button>\n            </td>\n            <td class='listelement'>\n                <button title='Beabeiten' id='edit-" + id + "' class='edit_box' type='submit' formnovalidate>\n                    " + date + "\n                </button>\n            </td>\n            <td class='editelement'>\n                <button title='Bearbeiten' id='edit-" + id + "' class='table_button' type='submit' formnovalidate>\n                    <img class='button_icon' src='../image/edit-ico.png' alt='Bearbeiten'>\n                </button>\n                <button title='L\u00F6schen' id='delete-" + id + "' class='table_button' type='submit' formnovalidate>\n                    <img class='button_icon' src='../image/trash-ico.png' alt='L\u00F6schen'>\n                </button>\n            </td>\n        </tr>\n    ";
}
// Aktuelle Liste (übergebene Liste) wird als Tabelleninhalt für html aufbereitet
function createTable(listOfElements) {
    if (logRequest)
        console.log("function createTable() gestartet.");
    // setzt vorherige Tabelle zurück
    var tablecontent_html = "";
    // Sofern abgerufenes Element aus Liste aktiv ist, wird dieses für die Dartellung aufgearbeitet
    for (var i = listOfElements.list.length - 1; i >= 0; i--) {
        // Prüft ob einzelne Elemente aktiv sind (Status 1)
        if (listOfElements.list[i].getStatus() === 1) {
            // Aufruf der Funktion für jedes aktive Element
            tablecontent_html += readRow(listOfElements.list[i]);
        }
    }
    return tablecontent_html;
}
// Darstellung falls bestehender Eintrag zum Editieren ausgewählt wird
function createEditRow(elementToChange) {
    if (logRequest)
        console.log("function createEditRow() gestartet.");
    // Abruf der Daten des zu bearbeitenden Elementes
    var editID = elementToChange.getID();
    var name = elementToChange.getName();
    var toBuy = elementToChange.getToBuy();
    var store = elementToChange.getStore();
    var date = elementToChange.getDate();
    return "\n        <td class='new_listelement'>\n            <input type='text' id='new_wer' class='textfield' autocomplete='off' placeholder='Wer?' value='" + name + "' required>\n        </td>\n        <td class='new_listelement'>\n            <input type='text' id='new_was' class='textfield' autocomplete='off' placeholder='Was?' value='" + toBuy + "' required>\n        </td>\n        <td class='new_listelement'>\n            <input type='text' id='new_wo' class='textfield' autocomplete='off' placeholder='Wo?' value='" + store + "' required>\n        </td>\n        <td class='new_listelement'>\n            <input type='text' id='new_wann' class='textfield' autocomplete='off' placeholder='Wann?' value='" + date + "' required>\n        </td>\n        <td class='editelement'>\n            <button title='Speichern' id='save-" + editID + "' class='table_button' type='submit'>\n                <img class='button_icon' src='../image/save-ico.png' alt='Speichern'>\n            </button>\n            <button title='L\u00F6schen' id='delete-" + editID + "' class='table_button' type='submit' formnovalidate>\n                <img class='button_icon' src='../image/trash-ico.png' alt='L\u00F6schen'>\n            </button>\n            <button title='Verwerfen' id='return-" + editID + "' class='table_button' type='submit' formnovalidate>\n                <img class='button_icon' src='../image/return-ico.png' alt='Verwerfen'>\n            </button>\n        </td>\n    ";
}
// Darstellung neuer Zeile zum Ergänzen von Elementen
function createNewRow() {
    if (logRequest)
        console.log("function createNewRow() gestartet.");
    return "\n        <td class='new_listelement'>\n            <input type='text' id='new_wer' class='textfield' autocomplete='off' placeholder='Wer?' value='" + username + "' required>\n        </td>\n        <td class='new_listelement'>\n            <input type='text' id='new_was' class='textfield' autocomplete='off' placeholder='Was?' required>\n        </td>\n        <td class='new_listelement'>\n            <input type='text' id='new_wo' class='textfield' autocomplete='off' placeholder='Wo?' required>\n        </td>\n        <td class='new_listelement'>\n            <input type='text' id='new_wann' class='textfield' autocomplete='off' placeholder='Wann?' value='" + getDate() + "' required>\n        </td>\n        <td class='editelement'>\n            <button title='Speichern' id='save-new' class='table_button' type='submit'>\n                <img class='button_icon' src='../image/save-ico.png' alt='Speichern'>\n            </button>\n            <button title='Verwerfen' id='return-new' class='table_button' type='submit' formnovalidate>\n                <img class='button_icon' src='../image/return-ico.png' alt='Verwerfen'>\n            </button>\n        </td>\n    ";
}
// Gibt Datum im richtigen Format als String aus
function getDate() {
    var date = new Date().toISOString();
    var output = "";
    for (var i = 0; i <= 9; i++) {
        output += date[i];
    }
    return output;
}
// Gibt Datum für die Sicherung der Datein aus
function dateConverted() {
    var date = (new Date()).toISOString();
    var newDate = "";
    for (var i = 0; i < date.length; i++) {
        // Ersetzt alle Doppelpunkte
        if (date[i] === ":") {
            newDate += "-";
        }
        else {
            newDate += date[i];
        }
    }
    return newDate;
}
// SERVER
// Webseitenbezeichnung
var websiteName = "Shopping-List";
var version = '1.0';
// aktueller User - Zuweisung nach Eingabe seitens Client
var username;
// Legt neues Objekt der Klasse ListOfElements als Liste an
var currentList = new ListOfElements();
// Zählt Anfragen seitens Client
var runCounter = 0;
// Einstellung, ob Informationen über Konsole ausgegeben werden sollen
var logRequest = true;
// Zeitpunkt des Serverstarts
var runDate = dateConverted();
// Pfad zuletzt gespeicherten Log und Zielpfad neuer Sicherungen
var currentLog = "log/listLog.json";
var saveLog = "log/listLog_";
// Liest JSON-Datei der letzten ListOfElements ein falls vorhanden
fs.readFile(currentLog, "utf-8", function (err, jsonData) {
    // Falls kein vorheriges Log gefunden werden konnte ist neue Liste leer
    if (err) {
        currentList.list = [];
        if (logRequest) {
            console.log("Keine vorherigen Daten gefunden. Leere Liste erstellt.");
        }
        // Andernfalls wird ein Array aus der JSON Datei erstellt und die einzelnen
        // Elemente des neuen Arrays als neue ListElement-Objekte in ListOfElements gesichert
    }
    else {
        // JSON aus den eingelesenen Daten
        var arrFromJSON = JSON.parse(jsonData);
        for (var _i = 0, arrFromJSON_1 = arrFromJSON; _i < arrFromJSON_1.length; _i++) {
            var i = arrFromJSON_1[_i];
            currentList.list.push(new ListElement(i.name, i.toBuy, i.store, i.date, i.status));
        }
        if (logRequest)
            console.log("Liste eingelesen. Anzahl der Einträge: ", currentList.list.length);
    }
});
// Server Werte
var server = express();
var serverPort = 8080;
var serverName = websiteName + " " + version;
server.listen(serverPort);
console.log("Der Server \"" + serverName + "\" steht auf Port ", serverPort, "bereit. \nServerstart: ", runDate);
// Auswertung von URLencoded und JSON ermöglichen
server.use(express.urlencoded({ extended: false }));
server.use(express.json());
// Verzeichnis des Servers und Ordner die genutzt werden sollen
var rootDirectory = __dirname;
server.use("/style", express.static(rootDirectory + "/style"));
server.use("/image", express.static(rootDirectory + "/image"));
server.use("/script", express.static(rootDirectory + "/script"));
console.log("root directory: ", rootDirectory);
// REQUESTS
// Übergabe der index.html
server.get("/", function (req, res) {
    if (logRequest)
        console.log("GET /");
    res.status(200);
    res.sendFile(rootDirectory + "/html/index.html");
});
// Übergabe des Icons
server.get("/icon", function (req, res) {
    if (logRequest)
        console.log("GET icon");
    res.status(200);
    res.sendFile(rootDirectory + "/image/logo-ico.png");
});
// Übergabe des Servernamens
server.get("/version", function (req, res) {
    if (logRequest)
        console.log("GET version");
    res.status(200);
    res.send(serverName);
});
// Zu übermittelnde Daten abhängig von Clientanfrage
// Nach Login, Übertrag Nutzer
server.post("/login", function (req, res) {
    // Anfragezähler erhöhen
    ++runCounter;
    // Username vom Client ermitteln
    var user_name = String(req.body.user_name);
    username = user_name;
    if (logRequest)
        console.log("POST /login: ", runCounter, "\nUser: ", user_name);
    // Bestätigung an Client senden
    res.status(200);
    res.send("Erfolgreich als \"" + user_name + "\" angemeldet.");
});
// Neuer Listeneintrag soll gespeichert werden
server.post("/create", function (req, res) {
    // Anfragezähler erhöhen
    ++runCounter;
    // Wert vom Client übertragenen JSON entnehmen
    var name = String(req.body.name);
    var toBuy = String(req.body.toBuy);
    var store = String(req.body.store);
    var date = String(req.body.date);
    if (logRequest)
        console.log("POST /create: ", runCounter);
    // Entnommene Werte als neues ListElement zur Liste hinzufügen
    currentList.list.push(new ListElement(name, toBuy, store, date, 1));
    // Änderungen in aktueller Liste werden in aktueller Log-Datei gesichert
    saveList(currentList, currentLog);
    // Mit aktualisierter Liste neue html generieren und an Client senden
    var tablecontent_html = createTable(currentList);
    res.status(200);
    res.send(tablecontent_html);
});
// Formular für neuen Eintrag
server.get("/create", function (req, res) {
    // Anfragezähler erhöhen
    ++runCounter;
    if (logRequest)
        console.log("GET /create: ", runCounter);
    // Sendet Bearbeitungszeile für neues Element
    var newRow_html = createNewRow();
    res.status(200);
    res.send(newRow_html);
});
// Übermittelt Listeneinträge als Tabelle an Client, falls möglich
server.get("/read", function (req, res) {
    // Anfragezähler erhöhen
    ++runCounter;
    var listLength = currentList.list.length;
    if (logRequest)
        console.log("GET /read: ", runCounter, "\nAnzahl Elemente: ", listLength);
    // Falls keine Liste definiert wurde, um Fehler aufzufangen
    if (currentList === undefined) {
        res.status(404);
        res.send("Liste existiert nicht.");
        // Andernfalls Tabelle als html generieren und an Client senden
    }
    else {
        var tablecontent_html = createTable(currentList);
        res.status(200);
        res.send(tablecontent_html);
    }
});
// Übermittelt ausgewählte Zeile aufbereitet zur Bearbeitung
server.post("/read", function (req, res) {
    // Anfragezähler erhöhen
    ++runCounter;
    // ID zu bearbeitender Zeile aus vom Client übertragenen JSON entnehmen
    var editID = Number(req.body.editID);
    // Sucht anhand empfangener ID Liste nach Element durch
    var editElement = currentList.getListElement(editID);
    if (logRequest)
        console.log("Post /read: ", runCounter, "\nAusgewähltes Element: [", editID, "] ", editElement);
    // Falls Liste undefiniert ist oder ListElement anderen Status als aktiv hat, wird abgebrochen
    if (currentList === undefined || editElement.getStatus() !== 1) {
        res.status(404);
        res.send("Element mit der ID [" + editID + "] existiert nicht.");
        // Andernfalls wird Bearbeitungsansicht für entsprechende Zeile an Client gesendet
    }
    else {
        var rowedit_html = createEditRow(editElement);
        res.status(200);
        res.send(rowedit_html);
    }
});
// Übermittelte Änderung durch Client für Listeneintrag in aktueller LOG sichern
server.post("/update", function (req, res) {
    // Anfragezähler erhöhen
    ++runCounter;
    // Neue Werte aus der vom Client übertragenen JSON übernehmen
    var editID = Number(req.body.editID);
    var name = String(req.body.name);
    var toBuy = String(req.body.toBuy);
    var store = String(req.body.store);
    var date = String(req.body.date);
    if (logRequest)
        console.log("GET /update: ", runCounter, "\nAusgewähltes Element: [", editID, "] ");
    // Zu überschreibendes Element aus Liste suchen
    var changedElement = currentList.getListElement(editID);
    // Falls Liste undefiniert ist oder ListElement anderen Status als aktiv hat, wird abgebrochen
    if (changedElement === undefined || changedElement.getStatus() !== 1) {
        res.status(404);
        res.send("Element mit der ID [" + editID + "] existiert nicht.");
        // Andernfalls Werte für Listenelement überschreiben
    }
    else {
        changedElement.setName(name);
        changedElement.setToBuy(toBuy);
        changedElement.setStore(store);
        changedElement.setDate(date);
        // Liste mit bearbeitetem Element sichern
        saveList(currentList, currentLog);
        // HTML für Tabelle neu generieren und Bestätigung an Client senden
        createTable(currentList);
        res.status(200);
        res.send("Element mit der ID [" + editID + "] geändert.");
    }
});
// Falls ein Element gelöscht werden soll
server.post("/delete", function (req, res) {
    // Anfragezähler erhöhen
    ++runCounter;
    // ID zu löschenden Elementes aus vom Client übertragenen JSON entnehmen
    var editID = Number(req.body.editID);
    // Zu löschendes Element anhand ID aus Liste wählen
    var elementToDelete = currentList.getListElement(editID);
    if (logRequest)
        console.log("Post /delete: ", runCounter, "\nAusgewähltes Element: [", editID, "] ", elementToDelete);
    // Falls Liste undefiniert ist oder ListElement anderen Status als aktiv hat, wird abgebrochen
    if (elementToDelete === undefined || elementToDelete.getStatus() !== 1) {
        res.status(404);
        res.send("Element mit der ID [" + editID + "] existiert nicht.");
        // Andernfalls wird Status des zu löschenden Elementes auf deaktiviert gesetzt und Liste aktualisiert
    }
    else {
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
server.get("/save", function (req, res) {
    // Anfragezähler erhöhen
    ++runCounter;
    if (logRequest)
        console.log("Get /save: ", runCounter);
    // Bestimmt Dateinamen
    var runDate = dateConverted();
    var newLog = saveLog + runDate + ".json";
    // Sichern der aktuellen Liste in Datei newSaveLog
    saveList(currentList, newLog);
    // Bestätigung an Client senden
    res.status(200);
    res.send("Liste gesichert");
});
// Falls Anfrage vom Client nicht bearbeitet werden kann und um Fehler aufzufangen
server.use(function (req, res) {
    // Anfragezähler erhöhen
    ++runCounter;
    // Vom Client angefrangte URL
    var reqURL = req.url;
    if (logRequest)
        console.log("Fehler 404: ", reqURL);
    // Fehlernachricht an Client senden
    res.status(404);
    res.set('content-type', 'text/plain; charset=utf-8');
    res.send(reqURL + "\nDie Anfrage konnte vom Webserver nicht bearbeitet werden!");
});
