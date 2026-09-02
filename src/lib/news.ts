import originals from "@/data/originals.json";
import { slugify } from "@/lib/towns";

/* Cycletowns Originals — editorial written by the Cycletowns team.
   In phase 2 this moves into the database with an admin editor; until then edit src/data/originals.json. */
export type Article = {
  kind?: string;
  series?: string;
  ep?: number;
  town?: string;
  img: string;
  title: string;
  dek: string;
  body: string; // simple HTML paragraphs
  cat?: string;
};
export const ARTICLES = originals as Article[];
export const articleSlug = (a: Article) => slugify(a.title);
export const getArticle = (slug: string) => ARTICLES.find((a) => articleSlug(a) === slug);
