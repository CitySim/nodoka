require("dotenv").config();
import { NodokaBot } from "./NodokaBot";
import { NodokaWeb } from "./NodokaWeb";
import { config, fetchConfig } from "./lib";
import { db } from "./db";

(async function main () {
    await fetchConfig(db)
    new NodokaBot(config, db);
    new NodokaWeb(config, db);
})();