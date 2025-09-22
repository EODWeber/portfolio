import { defineDocumentType, makeSource } from "contentlayer/source-files";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
const ArticleDoc = defineDocumentType(() => ({
  name: "ArticleDoc",
  filePathPattern: `articles/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    summary: { type: "string", required: false },
    tags: { type: "list", of: { type: "string" }, required: false },
    publishedAt: { type: "date", required: false },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath.replace(/^articles\//, ""),
    },
    bodyPath: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath + ".mdx",
    },
  },
}));

const CaseStudyDoc = defineDocumentType(() => ({
  name: "CaseStudyDoc",
  filePathPattern: `case-studies/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    summary: { type: "string", required: false },
    vertical: { type: "string", required: false },
    publishedAt: { type: "date", required: false },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath.replace(/^case-studies\//, ""),
    },
    bodyPath: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath + ".mdx",
    },
  },
}));

const LegalDoc = defineDocumentType(() => ({
  name: "LegalDoc",
  filePathPattern: `legal/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    summary: { type: "string", required: false },
    publishedAt: { type: "date", required: false },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath.replace(/^legal\//, ""),
    },
    bodyPath: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath + ".mdx",
    },
  },
}));

import type { PluggableList } from "unified";

const rehypePlugins = [
  rehypeSlug,
  [rehypeAutolinkHeadings, { behavior: "wrap" }],
  [rehypePrettyCode, { theme: "github-dark" }],
] as const;

export default makeSource({
  contentDirPath: "content",
  documentTypes: [ArticleDoc, CaseStudyDoc, LegalDoc],
  mdx: {
    // @ts-expect-error unified major versions report incompatible plugin signatures.
    rehypePlugins,
  },
  disableImportAliasWarning: true,
});
