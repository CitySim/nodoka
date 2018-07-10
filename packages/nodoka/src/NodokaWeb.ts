import autobind from 'autobind-decorator'
import * as express from "express";
import { Pool } from './db';
import { IConfig } from './lib';

interface ILink {
    id: string;
    url: string;
    name: string;
}

export class NodokaWeb {
    private app: express.Application;

    constructor (
        private config: IConfig,
        private db: Pool,
    ) {
        console.log("init web...");

        // Get the bot to connect to Discord
        this.app = express();
        this.app.get("/link", this.link);
        this.app.get("/user/:userId", this.userProfile);
        this.app.listen(9000);
    };

    @autobind
    private async link(req: express.Request, res: express.Response, next: express.NextFunction) {
        let links = await this.db.query(`
            select
                link.id,
                array_agg(link.url) as url,
                count(user_link.id) as users
            from link
            inner join user_link on link.id = user_link.link_id
            group by link.id
            order by count(user_link.id) desc, link.id asc
            limit 10 offset 0
        `);

        console.log(links.rows.map(r => {
            return {
                id: r.id,
                url: r.url[0], 
                users: r.users,
            };
        }));

        res.send(`
            <table>
                ${links.rows.map((link) => `
                    <tr>
                        <td>users: ${link.users}</td>
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

    @autobind
    private async userProfile(req: express.Request, res: express.Response, next: express.NextFunction) {
        let user = await this.db.query(`
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

        let links = await this.db.query(`
            SELECT
                l.url
                (SELECT )
            FROM user_link AS ul
            INNER JOIN link AS l ON ul.link_id = l.id
            
            WHERE ul.user_id = $1
            LIMIT 25
            OFFSET 0
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
