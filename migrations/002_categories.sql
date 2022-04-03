
CREATE TABLE tags_relations (
  parent_id INT(11) NOT NULL,
  contained_id INT(11) NOT NULL,
  PRIMARY KEY (parent_id, contained_id),
  FOREIGN KEY (parent_id)
    REFERENCES tags(id),
  FOREIGN KEY (contained_id)
    REFERENCES tags(id)
);

CREATE TABLE top_tags (
  tag_id INT(11) NOT NULL,
  PRIMARY KEY (tag_id),
  FOREIGN KEY (tag_id)
    REFERENCES tags(id)
);

RENAME TABLE top_tags TO top_photo_tags;

CREATE TABLE top_art_tags (
  tag_id INT(11) NOT NULL,
  PRIMARY KEY (tag_id),
  FOREIGN KEY (tag_id)
    REFERENCES tags(id)
);

CREATE TABLE categories (
  id CHAR(16) NOT NULL,
  PRIMARY KEY(id),
  name VARCHAR(100) NOT NULL
);

CREATE TABLE categories_relations (
  parent_id CHAR(16) NOT NULL,
  contained_id CHAR(16) NOT NULL,
  PRIMARY KEY (parent_id, contained_id),
  FOREIGN KEY (parent_id)
    REFERENCES categories(id),
  FOREIGN KEY (contained_id)
    REFERENCES categories(id)
);

CREATE TABLE categories_tags (
  category_id CHAR(16) NOT NULL,
  tag_id INT(11) NOT NULL,
  PRIMARY KEY (category_id, tag_id),
  FOREIGN KEY (category_id)
    REFERENCES categories(id),
  FOREIGN KEY (tag_id)
    REFERENCES tags(id)
);