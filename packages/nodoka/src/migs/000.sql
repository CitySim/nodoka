CREATE TABLE config (
	key STRING PRIMARY KEY NOT NULL,
	type STRING NOT NULL,
	value STRING NULL DEFAULT NULL,
	changed TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE link (
	id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
	url STRING NOT NULL,
	"name" STRING NOT NULL,
	UNIQUE INDEX link_url_key (url)
);

CREATE TABLE "user" (
	id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
	discord_id STRING NULL,
	UNIQUE INDEX user_discord_id_key (discord_id)
);

CREATE TABLE user_link (
	id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
	user_id UUID NOT NULL,
	link_id UUID NOT NULL,
	UNIQUE INDEX user_link_user_id_link_id_key (user_id, link_id)
);
