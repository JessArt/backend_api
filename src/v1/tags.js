const { query, count } = require("../db/connection");

module.exports.get = async (req, res) => {
  const { limit = 300, offset = 0, expand } = req.query;
  const results = await query({
    query: "SELECT * FROM tags LIMIT ? OFFSET ?",
    params: [Number(limit), Number(offset)]
  });

  const total = await count({
    query: "SELECT COUNT(*) AS total FROM tags"
  });

  if (expand) {
    const resultsWithTags = await Promise.all(
      results.map(async tag => {
        const result = await query({
          query:
            "SELECT contained_id as tagId from tags_relations WHERE parent_id = ?",
          params: [Number(tag.id)]
        });

        return Object.assign({}, tag, {
          relatedTags: result.map(({ tagId }) => tagId)
        });
      })
    );

    resultsWithTags.sort((a, b) => {
      if (b.relatedTags.length - a.relatedTags.length !== 0) {
        return b.relatedTags.length - a.relatedTags.length;
      } else {
        return b.id - a.id;
      }
    });

    res.json({
      meta: {
        limit,
        offset,
        total
      },
      data: resultsWithTags
    });
  } else {
    res.json({
      meta: {
        limit,
        offset,
        total
      },
      data: results
    });
  }
};

module.exports.getTopTags = async (req, res) => {
  const { nesting = 0, type = "photo" } = req.query;
  const tableName = type === "photo" ? "top_photo_tags" : "top_art_tags";
  const result = await query({
    query: `SELECT * FROM ${tableName}`
  });

  const ids = [];

  if (nesting) {
    if (result.length === 0) {
      res.json({
        data: [],
        entities: {}
      });
    } else {
      const resultWithNesting = await Promise.all(
        result.map(({ tag_id: tag }) => {
          ids.push(tag);
          return resolveNestedTags({ tag, ids }).then(data => {
            if (!data) {
              return tag;
            } else {
              return {
                tag,
                nested: data
              };
            }
          });
        })
      );

      const tagEntitiesArray = await query({
        query: "SELECT * FROM tags WHERE id IN (?)",
        params: [ids]
      });

      const entities = tagEntitiesArray.reduce((hash, tag) => {
        hash[tag.id] = tag;
        return hash;
      }, {});

      res.json({
        data: resultWithNesting,
        entities
      });
    }
  } else {
    res.json(result);
  }
};

module.exports.getNestedTags = async (req, res) => {
  const { tag } = req.query;
  const ids = [tag];
  const resultWithNesting = await resolveNestedTags({ tag, ids }).then(data => {
    if (!data) {
      return { tag };
    } else {
      return {
        tag,
        nested: data
      };
    }
  });

  const tagEntitiesArray = await query({
    query: "SELECT * FROM tags WHERE id IN (?)",
    params: [ids]
  });

  const entities = tagEntitiesArray.reduce((hash, tag) => {
    hash[tag.id] = tag;
    return hash;
  }, {});

  res.json({
    data: resultWithNesting.nested,
    entities
  });
};

async function resolveNestedTags({ tag, ids }) {
  const relatedTags = await query({
    query:
      "SELECT contained_id as tagId from tags_relations WHERE parent_id = ?",
    params: [Number(tag)]
  });

  if (relatedTags && relatedTags.length) {
    return Promise.all(
      relatedTags.map(({ tagId: tag }) => {
        ids.push(tag);
        return resolveNestedTags({ tag, ids }).then(data => {
          if (!data) {
            return tag;
          } else {
            return {
              tag,
              nested: data
            };
          }
        });
      })
    );
  } else {
    return null;
  }
}

module.exports.imageTags = async (req, res) => {
  const { id } = req.params;

  const results = await query({
    query: "SELECT tag_id FROM tags_images WHERE image_id = ?",
    params: [id]
  });
  const resultObject = results.reduce((hash, { tag_id: id }) => {
    hash[id] = true;
    return hash;
  }, {});

  res.json(resultObject);
};

module.exports.post = async (req, res) => {
  const { name, tags } = req.body;

  const result = await query({
    query: "INSERT INTO tags (name) VALUES (?)",
    params: [name]
  });

  await updateTagsRelation({ id: result.insertId, tags });

  res.json({
    id: result.insertId,
    status: "success"
  });
};

module.exports.put = async (req, res) => {
  const { id } = req.params;

  const { name, cover, tags } = req.body;

  await query({
    query: "UPDATE tags SET name = ?, cover = ? WHERE id = ?",
    params: [name, cover, Number(id)]
  });

  await updateTagsRelation({ id, tags });

  res.json({
    status: "success"
  });
};

module.exports.updateTopTags = async (req, res) => {
  const { type = "photo" } = req.query;
  const { tags } = req.body;
  const tableName = type === "photo" ? "top_photo_tags" : "top_art_tags";
  await query({
    query: `DELETE FROM ${tableName}`
  });

  if (tags) {
    await Promise.all(
      (Array.isArray(tags) ? tags : [tags]).map(tag =>
        query({
          query: `INSERT INTO ${tableName} (tag_id) VALUES (?)`,
          params: [Number(tag)]
        })
      )
    );
  }

  res.json({
    status: "success"
  });
};

async function updateTagsRelation({ tags, id }) {
  if (tags && tags.length > 0) {
    await query({
      query: "DELETE FROM tags_relations WHERE parent_id = ?",
      params: [Number(id)]
    });

    const tagsArray = Array.isArray(tags) ? tags : [tags];
    await Promise.all(
      tagsArray.map(tag => {
        return query({
          query:
            "INSERT INTO tags_relations (parent_id, contained_id) VALUES (?, ?)",
          params: [Number(id), Number(tag)]
        });
      })
    );
  }
}
