import * as Eris from "eris";
import * as pg from "pg";
import autobind from 'autobind-decorator'
import * as express from "express";
import { Config } from "./lib/Config";

interface ILink {
    id: string;
    url: string;
    name: string;
}

export class NodokaWeb {
    private pg: pg.Pool;
    private config: Config;
    private app: express.Application;

    constructor () {
        this.init();
    }

    private async init() {
        console.log("init...");
        this.pg = new pg.Pool();
        await this.pg.connect();

        this.config = new Config(this.pg);
        await this.config.fetch();

        // Get the bot to connect to Discord
        this.app = express();
        this.app.get("/user/:userId", this.userPage);
        this.app.listen(9000);
    };

    @autobind
    private async userPage(req: express.Request, res: express.Response, next: express.NextFunction) {
        let user = await this.pg.query(`
            SELECT id
            FROM "user"
            WHERE id = $1
        `, [
            req.params["userId"]
        ]);

        if (user.rowCount === 0) {
            res.status(404);
            res.send("not found");
            return;
        }

        let links = await this.pg.query(`
            SELECT l.name, l.url
            FROM link AS l
            INNER JOIN user_link AS ul
                ON ul.link_id = l.id
            WHERE ul.user_id = $1
        `, [
            req.params["userId"]
        ]);

        res.send(`
            <table>
                ${links.rows.map((link) => `
                    <tr>
                        <td>${link.name}</td>
                        <td>
                            <a href="${link.url}">${link.url}</a>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2">
                            <img src="${link.url}" style="max-height: 300px;">
                        </td>
                    </tr>
                `).join("")}
            </table>
        `);
    }
}
