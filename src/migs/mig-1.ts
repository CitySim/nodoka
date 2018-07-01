
`

CREATE TABLE nodoka.config (
    key STRING(500) PRIMARY KEY,
    type STRING(50) NOT NULL,
    value STRING NOT NULL,
    changed TIMESTAMP NOT NULL DEFAULT 'now()'
);


CREATE TABLE nodoka.file (
    id INT PRIMARY KEY,
    balance DECIMAL
);

CREATE TABLE nodoka.user (
    id INT PRIMARY KEY,
    balance DECIMAL
);


CREATE TABLE nodoka.user (
    id INT PRIMARY KEY,
    balance DECIMAL
);

`

