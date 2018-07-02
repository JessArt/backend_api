const { query, count } = require("../db/connection");

module.exports = async (req, res) => {
  const { pageNumber = 0, pageSize: limit = 10, tags, type } = req.query;
  const offset = pageNumber * limit;
  if (!tags) {
    const typeCond = type ? "WHERE type = ?" : "";
    const typeParam = type ? [type] : [];
    const results = await query({
      query: `SELECT * FROM images ${typeCond} ORDER BY id DESC LIMIT ? OFFSET ?`,
      params: typeParam.concat([Number(limit), Number(offset)])
    });

    const total = await count({
      query: `SELECT COUNT(*) AS total FROM images ${typeCond}`,
      params: typeParam
    });

    res.json({
      meta: {
        elements: results.length,
        offset,
        page_size: Number(limit),
        total: total
      },
      data: results
    });
  } else {
    const resolvedTags = await resolveTags({ tags }).then(resolvedTags =>
      resolvedTags.map(Number)
    );

    const typeCond = type ? "AND type = ?" : "";
    const typeParam = type ? [type] : [];
    // we get all images joined with tags
    // so every image can appear several times with different tags
    // the trick is that we resolve tags, e.g. unwrap, so the same
    // image can appear with several unwrapped tags. Because of that
    // we have a line `GROUP BY id`.
    const sqlQuery = `
    SELECT * FROM
    (SELECT * FROM images
      INNER JOIN tags_images
      ON images.id = tags_images.image_id) t
    WHERE tag_id IN (?) ${typeCond}
    GROUP BY id
    ORDER BY id DESC
    LIMIT ? OFFSET ?`;
    const results = await query({
      query: sqlQuery,
      params: [resolvedTags].concat(typeParam, Number(limit), Number(offset))
    });

    // we use _almost_ the same query as above, but for some reason
    // (which I have no idea about) `GROUP BY id` clause does not work,
    // returning 2 (for my query) instead of ~950.
    // However, `COUNT(DISTINCT id)` works, so it is here instead of
    // `GROUP BY id`.
    // TODO: post a question to StackOverflow and link it here.
    const countQuery = `
    SELECT COUNT(DISTINCT id) AS total FROM
    (SELECT * FROM images
      INNER JOIN tags_images
      ON images.id = tags_images.image_id) t
    WHERE tag_id IN (?) ${typeCond}`;
    const total = await count({
      query: countQuery,
      params: [resolvedTags].concat(typeParam)
    });

    res.json({
      meta: {
        elements: results.length,
        offset,
        page_size: Number(limit),
        total: total
      },
      data: results
    });
  }
};

async function resolveTags({ tags }) {
  const tagsArray = Array.isArray(tags) ? tags : [tags];

  const resolvedTagsArray = await Promise.all(
    tagsArray.map(async tag => {
      const relatedTags = await query({
        query:
          "SELECT contained_id as tagId from tags_relations WHERE parent_id = ?",
        params: [Number(tag)]
      });

      if (relatedTags && relatedTags.length) {
        return resolveTags({
          tags: relatedTags.map(({ tagId }) => tagId)
        }).then(resolvedTags => [tag].concat(resolvedTags));
      } else {
        return tag;
      }
    })
  );

  return resolvedTagsArray.reduce((arr, value) => arr.concat(value), []);
}
