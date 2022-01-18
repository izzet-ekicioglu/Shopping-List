/*
 Website Shopping List
 */

let serverName: string;
// Ob bereits eine Zeile in Bearbeitung ist
let editStatus: boolean = false;
// Aktuell zu bearbeitende Zeile
let currentRow: string = "";
// aktueller User
let username: string;
// Flag, ob Impressum angezeigt wird oder nicht
let impressum: boolean = false;
// Einstellung, ob Informationen über Konsole ausgegeben werden sollen
let logEvents: boolean = true;

// start()-Funktion beim ersten Aufruf der Seite
function start() {
    if (logEvents) console.log("function start() gestartet.");

    // Erste XMLHttpRequest an Server erstellen und senden
    const request = new XMLHttpRequest();
    request.open('GET', 'version');
    request.send();

    // Nach erhaltener Antwort vom Server
    request.onload = (event) => {
        // Falls HTTP-Statuscode 200 (OK)
        if (request.status === 200) {
            // Server übermittelt in Response serverName
            serverName = request.response;
            if (logEvents) console.log("Verbindung mit \"" + serverName + "\" erfolgreich aufgebaut.");

        // Falls Fehler vorliegt, HTTP-Statuscode nicht 200
        } else {
            if (logEvents) console.log("Fehler: ", request.status, "\n", event);
        }
    };
}

// Darstellung der Inhalte nach erfolgtem Login
function login(event) {
    event.preventDefault();
    if (logEvents) console.log("function login() gestartet.");

    // Liest eingegebenen Usernamen aus HTML Textfeld
    username = (document.getElementById("user_name") as HTMLInputElement).value;

    // Übermittelt Username an Server
    const request = new XMLHttpRequest();
    request.open('Post', 'login');
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(
        {
            "user_name": username
        })
    );

    // Nach erhaltener Antwort vom Server
    request.onload = (event) => {
        // Falls HTTP-Statuscode 200 (OK)
        if (request.status === 200) {
            if (logEvents) console.log(request.response);

            // Ermittelt aktuelle Tabelle vom Server und überträgt diese in HTML Datei
            tableFrame();
            fillTable();

            // Stellt anschließend Seiteninhalte auf sichtbar
            document.getElementById("contents").classList.remove("invisible");

        // Falls Fehler vorliegt, HTTP-Statuscode nicht 200
        } else {
            if (logEvents) console.log("Fehler: ", request.status, "\n", event);
        }
    }

    // Login Button unsichtbar machen
    document.getElementById("logger").classList.add("invisible");
}

// Funktionen für die Menü Buttons NEU und SICHERN
function menueButtons(event) {
    event.preventDefault();
    if (logEvents) console.log("function menueButtons() gestartet.");

    // Ermittelt zunächst getätigte ButtonID
    const button = event.submitter.id;

    // Button "NEU"
    if (button === "new") {
        if (logEvents) console.log("Selektierter Button: " + button);

        // Prüft ob eine Zeile bereits in Bearbeitung ist
        if (editStatus) {
            if (logEvents) console.log("Bereits in Bearbeitung. Zeile: " + currentRow);
        } else {
            // Setzt Tabelle zurück und ungespeicherte Änderungen gehen verloren
            fillTable();

            // XMLHttpRequest zum Sichern erstellen und an Server senden
            const request = new XMLHttpRequest();
            request.open('GET', 'create');
            request.send()

            // Nach Erhalt einer Antwort vom Server
            request.onload = (event) => {
                // Falls HTTP-Statuscode OK
                if (request.status === 200) {
                    // Lädt Neue Zeile vom Server
                    const newRow_html = request.response;
                    if (logEvents) console.log("Neue Zeile erfolgreich geladen.",);

                    // Speichert bestehende Tabelle zwischen
                    const tablecontent_html = document.getElementById("tablecontent").innerHTML;

                    // Ersetzt Tabelleninhalt mit Code für Zeile für neues Element und bereits bestehenden Tabelleninhalt
                    document.getElementById("tablecontent").innerHTML = newRow_html + tablecontent_html;

                    // Bearbeitungsflags
                    editStatus = true;
                    currentRow = "new";
                    if (logEvents) console.log("Bearbeitungsstatus: " + editStatus + "\nDerzeit in Bearbeitung: Zeile [" + currentRow + "]");

                    // Sperrt Änderung an Username und Buttons
                    setUsernameInput(false);
                    setMenueButtons(false);

                // Falls Fehler vorliegt, HTTP-Statuscode nicht OK
                } else {
                    if (logEvents) console.log("Fehler: ", request.status, "\n", event);
                }
            }
        }

    // Button "SICHERN"
    } else if (button === "sync") {
        if (logEvents) console.log("Selektierter Button: " + button);

        // XMLHttpRequest zum Sichern erstellen und an Server senden
        const request = new XMLHttpRequest();
        request.open('GET', 'save');
        request.send()

        // Nach Erhalt einer Antwort vom Server
        request.onload = (event) => {
            // Falls HTTP-Statuscode OK
            if (request.status === 200) {
                if (logEvents) console.log("Änderungen erfolgreich in neuer Datei gespeichert.",);
                fillTable();

                // Information zur Sicherung
                alert("Liste erfolgreich gespeichert!");

            // Falls Fehler vorliegt, HTTP-Statuscode nicht OK
            } else {
                if (logEvents) console.log("Fehler: ", request.status, "\n", event);
            }
        };
    }
}

function selectTool(event) {
    event.preventDefault();
    if (logEvents) console.log("function selectTool() gestartet.");

    // Getätigten Button mit Zeile ermitteln
    const button = event.submitter.id;
    const buttonID = getButtonID(button);
    const rowID = getRowID(button);

    // Bearbeitung abbrechen, Textfelder entfernen
    if (buttonID === "return") {
        if (logEvents) console.log("Selektierter Button: " + buttonID + " für Zeile: " + rowID);

        // Resettet Tabelle
        fillTable();

    // Neuen Eintrag sichern
    } else if (buttonID === "save") {
        if (logEvents) console.log("Selektierter Button: " + buttonID + " für Zeile: " + rowID);

        // Übernimmt Daten aus Textfeldern
        const new_name: string = String((document.getElementById('new_wer') as HTMLInputElement).value);
        const new_toBuy: string = String((document.getElementById('new_was') as HTMLInputElement).value);
        const new_store: string = String((document.getElementById('new_wo') as HTMLInputElement).value);
        const new_date: string = String((document.getElementById('new_wann') as HTMLInputElement).value);

        // Falls Felder leer sind, wird abgebrochen und ursprüngliche Tabelle wird ausgegeben
        if (new_name === "" || new_toBuy === "" || new_store === "" || new_date === "") {
            if (logEvents) console.log("Werte unvollständig. Nicht übernommen.");
            fillTable();

        } else {
            // Falls bereits bestehende Zeile, die bearbeitet wurde, gespeichert werden soll
            if (rowID != "new") {
                // XMLHttpRequest zur Sicherung der Änderung erstellen und neue Werte als JSON an Server senden
                const request = new XMLHttpRequest();
                request.open('POST', 'update');
                request.setRequestHeader('Content-Type', 'application/json');
                request.send(JSON.stringify(
                    {
                        "editID": rowID,
                        "name": new_name,
                        "toBuy": new_toBuy,
                        "store": new_store,
                        "date": new_date
                    })
                );

                // Nach Erhalt einer Antwort vom Server
                request.onload = (event) => {
                    // Falls HTTP Ok, wurde Eintrag gespeichert. Tabelle wird mit geänderten Werten neu geladen
                    if (request.status === 200) {
                        if (logEvents) console.log("Änderung in Zeile [" + currentRow + "] gespeichert.");
                        fillTable();

                    // Falls Fehler vorliegt, HTTP-Statuscode nicht OK
                    } else {
                        if (logEvents) console.log("Fehler: ", request.status, "\n", event);
                    }
                };

            // Falls neu erstellter Eintrag gespeichert werden soll
            } else {
                // XMLHttpRequest zum Ändern des Wertes erstellen und JSON Datei senden
                const request = new XMLHttpRequest();
                request.open('POST', 'create');
                request.setRequestHeader('Content-Type', 'application/json');
                request.send(JSON.stringify(
                    {
                        "name": new_name,
                        "toBuy": new_toBuy,
                        "store": new_store,
                        "date": new_date,
                        "status": 1
                    })
                );

                // Nach Erhalt einer Antwort vom Server
                request.onload = (event) => {
                    // Falls HTTP Ok, wurde Eintrag gespeichert. Tabelle wird mit geänderten Werten neu geladen
                    if (request.status === 200) {
                        if (logEvents) console.log("Neuen Eintrag für erfolgreich erstellt.");
                        fillTable();

                        // Falls Fehler vorliegt, HTTP-Statuscode nicht OK
                    } else {
                        if (logEvents) console.log("Fehler: ", request.status, "\n", event);
                    }
                };
            }
        }

    // Falls Button oder Feld zum Editieren getätigt wurde
    } else if (buttonID === "edit") {
        if (logEvents) console.log("Selektierter Button: " + buttonID + " für Zeile: " + rowID);

        // Prüft ob eine Zeile bereits in Bearbeitung ist
        if (editStatus) {
            if (logEvents) console.log("Bereits in Bearbeitung. Zeile: " + currentRow);
        } else {
            // Bearbeitungsflags
            editStatus = true;
            currentRow = rowID;
            if (logEvents) console.log("Bearbeitungsstatus: " + editStatus + "\nDerzeit in Bearbeitung: Zeile [" + currentRow + "]");

            // XMLHttpRequest für Bearbeitungs HTML der Zeile, sendet ID der gewählten Zeile als JSON
            const request = new XMLHttpRequest();
            request.open('POST', 'read');
            request.setRequestHeader('Content-Type', 'application/json');
            request.send(JSON.stringify(
                {
                    "editID": rowID
                })
            );

            // Nach Antwort seitens Server
            request.onload = (event) => {
                // Falls HTML-Statuscode OK
                if (request.status === 200) {
                    // Ersetzt bestehende Zeile durch empfangene Bearbeitungs-HTML
                    document.getElementById("row" + rowID).innerHTML = request.response;
                    if (logEvents) console.log("Bearbeitungsfelder für Zeile [" + rowID + "] erstellt.");

                // Falls HTTP-Statuscode nicht ok
                } else {
                    if (logEvents) console.log("Fehler: ", request.status, "\n", event);
                }
            };

            // Deaktiviert Buttons und Textfeld, da nun in Bearbeitung
            setMenueButtons(false);
            setUsernameInput(false);
        }

    // Löschen eines Eintrags
    } else if (buttonID === "delete") {
        if (logEvents) console.log("Selektierter Button: " + buttonID + " für Zeile: " + rowID);

        // Popup zum Bestätigen
        let checked: boolean = confirm("Wollen Sie diesen Eintrag wirklich löschen?");
        if (logEvents) console.log("Bestätigungsbox: " + checked);

        if (checked) {
            // XMLHttpRequest erstellen und ID des zu löschenden Elementes als JSON an Server senden
            const request = new XMLHttpRequest();
            request.open('POST', 'delete');
            request.setRequestHeader('Content-Type', 'application/json');
            request.send(JSON.stringify(
                {
                    "editID": rowID
                })
            );

            // Nach Erhalt einer Antwort vom Server
            request.onload = (event) => {
                // Falls HTTP-Statuscode OK, erstelle Tabelle neu, ohne gelöschtes Element, da deaktiviert
                if (request.status === 200) {
                    if (logEvents) console.log("Zeile [" + rowID + "] erfolgreich gelöscht.");
                    fillTable();

                // Falls HTTP-Statuscode nicht OK
                } else {
                    if (logEvents) console.log("Fehler: ", request.status, "\n", event);
                }
            };

        // Falls nicht Bestätigt
        } else {
            if (logEvents) console.log("Zeile [" + rowID + "] wurde nicht gelöscht.");
            fillTable();
        }
    }
}

// Erstellt Grundgerüst für Tabelle
function tableFrame() {
    if (logEvents) console.log("function tableFrame() gestartet.");

    document.getElementById("output").innerHTML = `
        <table>
            <thead>
                <tr>
                    <th id='wer'>Wer?</th>
                    <th id='was'>Was?</th>
                    <th id='wo'>Wo?</th>
                    <th id='wann'>Wann?</th>
                    <th id='edit_buttons'></th>
                </tr>
            </thead>
            <tbody id='tablecontent'>
            </tbody>
        </table>
    `;

    if (logEvents) console.log("Tabellengerüst erstellt.");
}

// Ruft Tabelleninhalte vom Server auf und implementiert diese in HTML
function fillTable() {
    if (logEvents) console.log("function fillTable() gestartet.");

    // Startet eine READ Request an Server für benötigte HTML Daten
    const request = new XMLHttpRequest();
    request.open('GET', 'read');
    request.send();

    // Nach erhaltener Antwort vom Server
    request.onload = (event) => {
        // Falls HTTP-Statuscode 200 (OK) ist
        if (request.status === 200) {
            // Bettet empfangenen HTML Code ein
            document.getElementById("tablecontent").innerHTML = request.response;
            if (logEvents) console.log("Tabelleninhalt von Server geladen");

        // Falls Fehler bzw. HTTP-Statuscode nicht OK
        } else {
            if (logEvents) console.log("Fehler: ", request.status, "\n", event);
        }
    };

    // Stellt Tabelle auf sichtbar
    document.getElementById("output").classList.remove("invisible");

    // Setzt Bearbeitungsflag nach Reset der Tabelle
    editStatus = false;
    currentRow = "";
    if (logEvents) console.log("Bearbeitungsstatus: " + editStatus + "\nDerzeit keine Zeile in Bearbeitung.");

    // Gibt Änderung an Username und Buttons wieder frei
    setUsernameInput(true);
    setMenueButtons(true);
}

// Klappt und Schließt das Impressum
function showImpressum(event) {
    event.preventDefault();
    if (logEvents) console.log("function showImpressum() gestartet");

    // Falls Impressum false, wirds auf sichtbar gestellt, und andersrum auf unsichtbar
    if (!impressum) {
        document.getElementById("impressum").classList.remove("invisible");
        impressum = true;
        if (logEvents) console.log("Impressum wird angezeigt");

    } else {
        document.getElementById("impressum").classList.add("invisible");
        impressum = false;
        if (logEvents) console.log("Impressum wird verborgen");
    }
}

// Zum Deaktivieren/Reaktivieren von Menü Buttons
function setMenueButtons(status: boolean) {
    // Falls status true (bei Bearbeitung von Zeilen) werden Buttons deaktiviert
    if (status) {
        document.getElementById("new").removeAttribute("disabled");
        document.getElementById("new").classList.remove("cursor_locked");
        document.getElementById("sync").removeAttribute("disabled");
        document.getElementById("sync").classList.remove("cursor_locked");
        if (logEvents) console.log("Menü-Buttons wieder aktiviert.");
    // Falls status false (keine Bearbeitung von Zeilen) werden Buttons aktiviert
    } else {
        document.getElementById("new").setAttribute("disabled", "disabled");
        document.getElementById("new").classList.add("cursor_locked");
        document.getElementById("sync").setAttribute("disabled", "disabled");
        document.getElementById("sync").classList.add("cursor_locked");
        if (logEvents) console.log("Menü-Buttons deaktiviert.");
    }
}

// Zum Deaktivieren/Reaktivieren vom Eingabefeld für Username
function setUsernameInput(status: boolean) {
    // Aktiviert/ Deaktiviert nach status das Eingabefeld für den Username
    if (status) {
        document.getElementById("user_name").removeAttribute("readonly");
        document.getElementById("user_name").classList.remove("cursor_locked");
        if (logEvents) console.log("Eingabefeld für Usernamen wieder aktiviert.");

    } else {
        document.getElementById("user_name").setAttribute("readonly", "readonly");
        document.getElementById("user_name").classList.add("cursor_locked");
        if (logEvents) console.log("Eingabefeld für Usernamen deaktiviert.");
    }
}

// Ermittelt welcher Button ohne Zeile getätigt wurde
function getButtonID(button: string): string {
    let outputID: string = "";
    for (let i: number = 0; i < button.length; i++) {
        // break bei Bindestrich, da Zeile folgt
        if (button[i] === "-") break;
        outputID += button[i];
    }
    return outputID;
}

// Ermittelt aus übergebenem/r String/ID die Zeile
function getRowID(button: string): string {
    let outputID: string = "";
    let charCounter: boolean = false;
    for (let i: number = 0; i < button.length; i++) {
        if (charCounter === true) {
            outputID += button[i];
        }
        if (button[i] === "-") {
            charCounter = true;
        }
    }
    return outputID;
}

document.addEventListener("DOMContentLoaded", () => {
    // Baut DOM des HTML Dokuments auf
    start();

    // Nach Eingabe und Bestätigung des Usernames Aufbau der Tabelle
    document.getElementById("enter_login").addEventListener("submit", (event) => {
        if (logEvents) console.log("-->EventListener reagiert auf \"enter_login\".");
        login(event);
    })

    // Funktionen für die Buttons NEU und SICHERN
    document.getElementById("menue_row").addEventListener("submit", (event) => {
        if (logEvents) console.log("-->EventListener reagiert auf \"menue_row\".");
        menueButtons(event);
    })

    // Funktionen für die Bearbeitung von Zeilen
    document.getElementById("form_table").addEventListener("submit", (event) => {
        event.preventDefault();
        if (logEvents) console.log("-->EventListener reagiert auf \"form_table\".");
        selectTool(event);
    })

    document.getElementById("show_impressum").addEventListener("submit", (event) => {
        if (logEvents) console.log("-->EventListener reagiert auf \"show_impressum\".");
        showImpressum(event);
    })
});