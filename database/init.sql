comment
on database postgres is 'default administrative connection database';

create table users
(
    id         uuid                    not null
        constraint "PK_a3ffb1c0c8416b9fc6f907b7433"
            primary key,
    name       varchar(255)            not null,
    surnames   varchar(255)            not null,
    email      varchar(255)            not null
        constraint "UQ_97672ac88f789774dd47f7c8be3"
            unique,
    username   varchar(255)            not null
        constraint "UQ_fe0bb3f6520ee0469504521e710"
            unique,
    password   varchar(255)            not null,
    created_at timestamp default now() not null,
    updated_at timestamp default now() not null,
    is_deleted boolean   default false not null
);

alter table users
    owner to admin;

create table user_roles
(
    id      uuid not null
        constraint "PK_8acd5cf26ebd158416f477de799"
            primary key,
    role    varchar(50) default 'USER':: character varying not null,
    user_id uuid
        constraint "FK_87b8888186ca9769c960e926870"
            references users
);

alter table user_roles
    owner to admin;

-- Inserción de datos
-- Insertar usuario
INSERT INTO users (id, name, surnames, email, username, password)
VALUES ('01f58f46-f886-4bcd-ba97-b7b2fff7e358',
        'NombreUsuario',
        'ApellidosUsuario',
        'usuario@email.com',
        'user',
        '$2a$12$GASiX/eq87wEKStKTIVpjuPlBMrNdxFlxUEBtsDnX0hHYtYijadwS');

-- Asignar rol al usuario
INSERT INTO user_roles (id, role, user_id)
VALUES ('2abd912e-2796-4741-8ec1-10f413fe4dba', 'USER', (SELECT id FROM users WHERE username = 'user'));


-- Insertar usuario admin
INSERT INTO users (id, name, surnames, email, username, password)
VALUES ('543cc80d-00df-4dba-885e-cbccc5400acf',
        'NombreAdmin',
        'ApellidosAdmin',
        'admin@email.com',
        'admin',
        '$2a$12$GASiX/eq87wEKStKTIVpjuPlBMrNdxFlxUEBtsDnX0hHYtYijadwS');

-- Asignar roles al usuario admin

INSERT INTO user_roles (id, role, user_id)
VALUES
    ('8f3c7319-cd8a-4a7f-82ac-47d5a76819ea', 'USER', (SELECT id FROM users WHERE username = 'admin')),
    ('7449ce79-6686-435f-b5e4-fc5d2c2d83d9', 'ADMIN', (SELECT id FROM users WHERE username = 'admin'));