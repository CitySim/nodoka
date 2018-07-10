import { db, Pool } from "../db";

export interface IConfig {
    discord: {
        token: string;
    };
    emoji: {
        save: string;
    };
    server: {
        address: string;
    };
}

// a bit of a hacky way to set this, but we will call fetchConfig, it will be fine! i'm sure...
export let config: IConfig = {} as IConfig;

export async function fetchConfig(db: Pool): Promise<void> {
    let fetched = await db.query(`SELECT key, value, type FROM config`);
    let kv = new Map<string, any>();
    for (let c of fetched.rows) {
        kv.set(c.key, JSON.parse(c.value));
    }

    Object.assign<IConfig, IConfig>(config, {
        discord: {
            token: kv.get("discord.token"),
        },
        emoji: {
            save: kv.get("emoji.save"),
        },
        server: {
            address: kv.get("server.address"),
        },
    });
}
