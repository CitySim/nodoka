import * as Eris from "eris";
import * as pg from "pg";
import autobind from 'autobind-decorator'
import { Config } from "./lib/Config";

interface ILink {
    id: string;
    url: string;
    name: string;
}

export class NodokaBot {
    private pg: pg.Pool;
    private config: Config;
    private bot: Eris.Client;

    constructor () {
        this.init();
    }

    private async init() {
        console.log("init...");
        this.pg = new pg.Pool();
        await this.pg.connect();

        this.config = new Config(this.pg);
        await this.config.fetch();

        this.bot = new Eris.Client(this.config.get("discord.token", "string"));
        this.bot.on("ready", this.onReady);
        this.bot.on("disconnect", this.onDisconnect);
        this.bot.on("error", this.onError);
        this.bot.on("messageCreate", this.onMessageCreate);
        this.bot.on("messageReactionAdd", this.onMessageReactionAdd);
        this.bot.on("messageReactionRemove", this.onMessageReactionRemove);
        this.bot.on("messageReactionRemoveAll", this.onMessageReactionRemoveAll);

        // Get the bot to connect to Discord
        await this.bot.connect();
    };

    @autobind
    private onReady() {
        console.log(`Logged in as ${this.bot.user.username}#${this.bot.user.discriminator}`);
        this.bot.editStatus("online", { name: "fapping" })
    }
        
    @autobind
    private onDisconnect() {
        console.log(`onDisconnect`);
    }
    
    @autobind
    private onError(err: Error, id: number) {
        console.log(`onError`, err, id);
    }

    @autobind
    private async onMessageCreate(message: Eris.Message) {
        console.log(`onMessageCreate`);
        if (message.attachments.length) {
            message.addReaction(this.config.get("emoji.save", "string"));
        }
        
        if(message.content === ",ping") {
            this.bot.createMessage(message.channel.id, {
                embed: {
                    url: "https://nodoka.yuuu.moe",
                    color: 3575715,
                    image: {
                        url: "https://media1.tenor.com/images/75af5262d34d2d0b5dc8c404212665a8/tenor.gif?itemid=8942945",
                    },
                },
            });
        } else if (message.content === ",profile") {
            let user = await this.pg.query(`SELECT id FROM "user" WHERE discord_id = $1`, [ message.author.id ]);
            if (user.rowCount > 0) {
                this.bot.createMessage(message.channel.id, `https://nodoka.yuuu.moe/user/${user.rows[0].id}`);
            }
        }
    }

    @autobind
    private onMessageReactionRemoveAll(message: Eris.PossiblyUncachedMessage) {
        console.log(`onMessageReactionRemoveAll`);
        
    }

    @autobind
    private async onMessageReactionAdd(msg: Eris.PossiblyUncachedMessage, emoji: Eris.Emoji, userId: string) {
        if (userId === this.bot.user.id) {
            return;
        }
        console.log(`onMessageReactionAdd`);
    
        if (emoji.name === this.config.get("emoji.save", "string")) {
            let user = await this.pg.query(`SELECT id FROM "user" WHERE discord_id = $1`, [ userId ]);
            if (user.rowCount === 0) {
                this.bot.createMessage(msg.channel.id, `Hi <@${userId}>, sorry but i don't know you. And i'n not allowed to talk with people i don't know.`);
                return
            }

            console.log("-> EMOJI_SAVE")
            let message: Eris.Message;
            if (msg instanceof Eris.Message) {
                message = msg;
            } else {
                console.log("fetch message")
                message = await this.bot.getMessage(msg.channel.id, msg.id);
            }

            let links: Partial<ILink>[] = [];

            for (let attachment of message.attachments) {
                links.push({
                    name: attachment.filename,
                    url: attachment.url,
                })
            }

            if (links.length === 0) {
                // no files in this message
                return;
            }
            
            console.log(links)
            for (let link of links) {
                let saved = await this.pg.query(`
                    INSERT INTO link (url, name)
                    VALUES ($1, $2)
                    ON CONFLICT (url) DO
                        UPDATE SET name = excluded.name
                    RETURNING id
                `, [
                    link.url,
                    link.name,
                ]);
                
                console.log("saved", saved);
                link.id = saved.rows[0].id;

                await this.pg.query(`
                    INSERT INTO user_link (link_id, user_id)
                    VALUES ($1, $2)
                    ON CONFLICT (user_id, link_id) DO NOTHING
                `, [
                    link.id,
                    user.rows[0].id,
                ]);
            }
            
            this.bot.addMessageReaction(message.channel.id, message.id, "🆗");
            setTimeout(() => {
                this.bot.removeMessageReaction(message.channel.id, message.id, "🆗");
            }, 2000);
        }
    }

    @autobind
    private async onMessageReactionRemove(msg: Eris.PossiblyUncachedMessage, emoji: Eris.Emoji, userId: string) {
        if (userId === this.bot.user.id) {
            return;
        }
        console.log(`onMessageReactionRemove`);
    
        if (emoji.name === this.config.get("emoji.save", "string")) {
            let user = await this.pg.query(`SELECT id FROM "user" WHERE discord_id = $1`, [ userId ]);
            if (user.rowCount === 0) {
                return
            }

            let message: Eris.Message;
            if (msg instanceof Eris.Message) {
                message = msg;
            } else {
                console.log("fetch message")
                message = await this.bot.getMessage(msg.channel.id, msg.id);
            }

            let links: Partial<ILink>[] = [];

            for (let attachment of message.attachments) {
                links.push({
                    name: attachment.filename,
                    url: attachment.url,
                })
            }

            if (links.length === 0) {
                // no files in this message
                return;
            }
            
            console.log(links)
            for (let link of links) {
                await this.pg.query(`
                    DELETE FROM user_link
                    WHERE
                        link_id IN (
                            SELECT id
                            FROM link
                            WHERE url = $1
                        )
                `, [
                    link.url
                ]);
            }
            
            this.bot.addMessageReaction(message.channel.id, message.id, "🆗");
            setTimeout(() => {
                this.bot.removeMessageReaction(message.channel.id, message.id, "🆗");
            }, 2000);
        }
    }
}
