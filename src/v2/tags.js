const { query } = require("../db/connection");

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
    const tagEntitiesArray = await query({
      query: "SELECT * FROM tags WHERE id IN (?)",
      params: result.map(({ tag_id: tag }) => tag)
    });

    const entities = tagEntitiesArray.reduce((hash, tag) => {
      hash[tag.id] = tag;
      return hash;
    }, {});

    res.json({
      data: result.map(({ tag_id: tag }) => ({ tag })),
      entities
    });
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
            return { tag };
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
