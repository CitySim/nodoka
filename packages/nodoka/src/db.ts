import * as pg from "pg";
export { Pool } from "pg";

export const db = new pg.Pool();
db.on("connect", () => console.log("cockroach connect"));
db.on("error", (err) => {
    console.error("cockroach error", err);
});

db.connect();
