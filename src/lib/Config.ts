import * as pg from "pg";

interface IConfigValue {
    type: string;
    value: any;
}

export class Config {
    private kv = new Map<string, IConfigValue>();

    constructor(
        private pg: pg.Pool,
    ) {}

    public async fetch(): Promise<void> {
        let config = await this.pg.query(`SELECT key, value, type FROM config`);

        this.kv.clear();
        for (let c of config.rows) {
            this.kv.set(c.key, {
                type: c.type,
                value: JSON.parse(c.value),
            });
        }
    }

    public get(key: string, type: "string"): string;
    public get(key: string, type: string): any {
        if (!this.kv.has(key)) {
            throw new Error("Config key not known.");
        }

        let value = this.kv.get(key);
        if (value.type !== type) {
            throw new Error("Type does not match.");
        }

        return value.value
    }
}