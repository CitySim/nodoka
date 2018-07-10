alter table config drop column changed;

alter table user_link rename to user_link_2;
CREATE TABLE user_link (
  user_id UUID NOT NULL,
  link_id UUID NOT NULL,
  PRIMARY KEY (user_id, link_id)
);
insert into user_link select user_id, link_id from user_link_2;
drop table user_link_2;

CREATE INDEX user_link_user_id_idx ON user_link (user_id);
ALTER TABLE user_link ADD CONSTRAINT fk_user_link_user FOREIGN KEY (user_id) REFERENCES "user" (id) ON UPDATE RESTRICT ON DELETE CASCADE;
CREATE INDEX user_link_link_id_idx ON user_link (link_id);
ALTER TABLE user_link ADD CONSTRAINT fk_user_link_link FOREIGN KEY (link_id) REFERENCES link (id) ON UPDATE RESTRICT ON DELETE CASCADE;

CREATE TABLE user_link_tag (
  user_id UUID NOT NULL,
  link_id UUID NOT NULL,
  tag STRING NOT NULL,

  PRIMARY KEY (user_id, link_id, tag),
  INDEX (user_id),
  INDEX (link_id),

  FOREIGN KEY (user_id, link_id) REFERENCES user_link (user_id, link_id) ON UPDATE RESTRICT ON DELETE CASCADE
);

