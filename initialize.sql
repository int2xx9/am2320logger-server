create table sensor(
  id integer primary key not null,
  humidity real,
  temperature real,
  created_at text not null default CURRENT_TIMESTAMP
);

