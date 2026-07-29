import { FIELD_LIMITS } from "@src/schemas/fieldLimits";
import { z } from "zod";

/* L'import de favoris (COS-318) — `POST /bookmarks/upload`.
 *
 * Le fichier part en `multipart/form-data` sous le champ `bookmark_file`, et c'est le
 * back qui l'analyse : soit un CSV `titre;lien`, soit l'export Netscape des navigateurs,
 * dont il saute les deux premières lignes puis lit par paires.
 *
 * Le front ne voit donc **aucune entrée analysée** aujourd'hui : la réponse est un
 * `{ msg }`, et en cas d'échec le back ajoute la ligne fautive. Les schémas d'entrées et
 * de résumé ci-dessous décrivent ce que UI 08 (COS-304) doit afficher — un aperçu avant
 * envoi, et un compte rendu après — et ce que le back devra renvoyer pour cela. Ils ne
 * sont branchés nulle part tant que ce ticket n'a pas déplacé l'analyse. */

/** Une ligne du fichier, telle que l'analyseur la produit. */
export const ImportEntrySchema = z.object({
  title: z.string().min(1).max(FIELD_LIMITS.title),
  link: z.string().min(1).max(FIELD_LIMITS.url),
});

export type ImportEntry = z.infer<typeof ImportEntrySchema>;

export const ImportEntryListSchema = z.array(ImportEntrySchema);

/** Le compte rendu d'un import. */
export const ImportSummarySchema = z.object({
  parsed: z.number().int().min(0),
  imported: z.number().int().min(0),
  skipped: z.number().int().min(0),
  errors: z.array(z.object({ line: z.number().int().optional(), reason: z.string() })).default([]),
});

export type ImportSummary = z.infer<typeof ImportSummarySchema>;

/** Ce que le back renvoie **réellement** aujourd'hui : un message, et sur erreur l'URL ou
 *  le titre qui a fait échouer l'insertion. */
export const ImportResponseSchema = z.object({
  msg: z.string(),
  url: z.string().optional(),
  title: z.string().optional(),
});

export type ImportResponse = z.infer<typeof ImportResponseSchema>;
