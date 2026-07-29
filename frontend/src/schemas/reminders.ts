import { BookmarkSchema } from "@src/schemas/bookmarks";
import { dateLikeSchema, numberLikeSchema } from "@src/schemas/primitives";
import { z } from "zod";

/* `GET /reminders` (COS-318).
 *
 * Le contrôleur renvoie des bookmarks joints à leur alarme, mais **sans les catégories** :
 * sa requête ne fait ni `GROUP_CONCAT` ni passage par `marshallCategories`, donc le champ
 * `categories` que porte `BookmarkSchema` est absent. D'où le `.omit()` plutôt qu'un
 * `.extend()` seul.
 *
 * Les alias diffèrent aussi de ceux de la fiche : ici `alarm_added`, là-bas
 * `alarm_date_added`. Ce n'est pas une coquille de ce fichier, c'est ce qu'écrivent les
 * deux requêtes. DATA 03 (COS-308) les alignera. */

export const ReminderSchema = BookmarkSchema.omit({ categories: true }).extend({
  /** Ré-aliasé sur `alarm.id` par la jointure : jamais nul ici, l'`INNER JOIN` exclut
   *  les bookmarks sans alarme. */
  alarm_id: numberLikeSchema,
  /** Fréquence en jours. Le contrôleur ne retient une ligne que si le nombre de jours
   *  écoulés depuis `alarm_added` est un multiple de cette valeur. */
  alarm_frequency: numberLikeSchema,
  alarm_added: dateLikeSchema,
});

export type Reminder = z.infer<typeof ReminderSchema>;

export const ReminderListSchema = z.array(ReminderSchema);
