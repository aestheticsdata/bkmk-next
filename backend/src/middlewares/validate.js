/**
 * Middleware de validation des entrées (COS-318).
 *
 * S'utilise en nommant les parties à valider :
 *
 *     router.get("/", checkToken, validate({ query: listBookmarksQuerySchema }), catchAsync(controller));
 *
 * **Il ne remplace pas `req.body` ni `req.query`.** Le résultat validé est posé dans
 * `req.validated.{body,query,params}`, et les contrôleurs continuent de lire les objets
 * d'origine. C'est délibéré : `z.object` retire les clés inconnues, et écraser `req.body`
 * ferait disparaître sans bruit un champ qu'un contrôleur hérité lit encore. La migration
 * vers `req.validated` se fait contrôleur par contrôleur, au moment où on le réécrit —
 * COS-295 pour l'authentification, le lot DATA pour le reste.
 *
 * En échec, réponse **400** avec la liste des champs fautifs. On répond ici plutôt que de
 * passer par `next(err)` : le serveur n'a aucun gestionnaire d'erreurs, donc `next(err)`
 * tombe sur celui d'Express, qui rend une page HTML. Et 400 plutôt que le 500 que le
 * reste de l'API renvoie à tout : une entrée malformée est une erreur du client.
 *
 * Pour les routes multipart, à placer **après** multer — sans quoi `req.body` est vide.
 */
const validate = (schemas) => (req, res, next) => {
  const validated = {};

  for (const part of ["body", "query", "params"]) {
    const schema = schemas[part];
    if (!schema) continue;

    const result = schema.safeParse(req[part]);
    if (!result.success) {
      return res.status(400).json({
        msg: "invalid request",
        details: result.error.issues.map((issue) => ({
          field: [part, ...issue.path].join("."),
          message: issue.message,
        })),
      });
    }
    validated[part] = result.data;
  }

  req.validated = validated;
  return next();
};

module.exports = validate;
